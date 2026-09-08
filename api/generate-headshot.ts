import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
    // Vercel hobby plan limits execution to 10s. Pro is 15s-900s.
    // If the model takes longer than 10s, Vercel will kill the request.
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64, attire, background, aspect_ratio, hairStyle, customNotes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    console.log("Processing image on Vercel Serverless Function...");

    const base64Data = imageBase64.split(",")[1];
    const mimeTypeMatch = imageBase64.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const selectedAspectRatio = validAspectRatios.includes(aspect_ratio)
      ? aspect_ratio
      : "3:4";

    const hairInstruction = hairStyle === "preserve_long"
      ? "CRITICAL: The subject has LONG HAIR in the photo. Do NOT cut it short! Strictly preserve their authentic long hair length, wave/curl pattern, volume, and color. Neatly arrange and style their long hair so it falls naturally and elegantly over the shoulders or chest without awkward flyaways."
      : hairStyle === "preserve_original"
      ? "CRITICAL: Keep the subject's exact hair length, natural texture, and hair volume identical to the source image. Only polish and groom unruly flyaway strands, do NOT alter the haircut or shorten the length."
      : "Keep the subject's authentic hair length and color from the photo. Tidy up messy strands while keeping the natural hair length intact.";

    const userNotes = customNotes && customNotes.trim()
      ? `\nADDITIONAL USER SPECIFIC REQUEST: "${customNotes.trim()}"`
      : "";

    const promptText = `
You are a world-class portrait photographer shooting real people for authentic corporate profiles.
Your task is to take the REAL person from the input image and photograph them in high-end corporate studio attire.

### ABSOLUTE RULES AGAINST AI UNCANNY VALLEY / ARTIFICIAL LOOK:
1. PRESERVE THE REAL PERSON (REAL HUMAN TEXTURE):
   - You MUST keep this exact person's real face, authentic features, eye shape, nose structure, smile lines, and skin tone.
   - Absolutely NO plastic airbrushing, NO fake synthetic CGI look, NO generic AI face swap.
   - Retain realistic human skin texture, pores, fine details, and natural organic lighting.

2. HAIR FIDELITY (DO NOT SHORTEN OR REINVENT HAIR):
   - ${hairInstruction}
   - Under NO circumstance should long hair be cropped or converted into a short buzz/crew cut.
   - If hair was asymmetrical or windblown, naturally drape and balance it while honoring its true length and character.

3. REFINED CORPORATE ATTIRE:
   - Dress the person in: ${attire}.
   - The clothing must fit naturally onto their neck and body with realistic textile creases, collar lines, and fabric weave.

4. STUDIO ENVIRONMENT & LIGHTING:
   - Setting: ${background}.
   - Natural 3-point portrait photography lighting with soft shadows, true-to-life skin reflections, and sharp focus on the eyes.

5. FRAMING:
   - Classic executive portrait framing (head and upper torso centered, natural posture, confident and approachable expression).
${userNotes}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: selectedAspectRatio as any,
          imageSize: "512px", // Changed to 512px to improve speed and reduce likelihood of Vercel 10s timeout
        },
      },
    });

    let generatedImageData: string | null = null;
    let generatedMimeType = "image/jpeg";

    const candidate = response.candidates?.[0];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          generatedImageData = part.inlineData.data;
          if (part.inlineData.mimeType) {
            generatedMimeType = part.inlineData.mimeType;
          }
          break;
        }
      }
    }

    if (!generatedImageData) {
      const refusalOrText = candidate?.content?.parts?.find((p) => p.text)?.text;
      throw new Error(refusalOrText || "The model did not return an image.");
    }

    res.json({
      success: true,
      generatedImage: `data:${generatedMimeType};base64,${generatedImageData}`,
    });
  } catch (error: any) {
    console.error("Vercel Serverless Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate headshot" });
  }
}
