import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageDataUrl: z
    .string()
    .min(20)
    .refine((s) => s.startsWith("data:image/"), "Image invalide"),
  roomType: z.string().min(2).max(60),
  widthM: z.number().min(1).max(30),
  lengthM: z.number().min(1).max(30),
  heightM: z.number().min(2).max(8),
  style: z.string().min(2).max(60),
  budget: z.string().max(60).optional(),
  wishes: z.string().min(5).max(800),
});

export type GenerateDecorInput = z.infer<typeof InputSchema>;

export type GenerateDecorResult = {
  imageDataUrl: string;
  description: string;
};

export const generateDecorImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateDecorResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Service IA indisponible : clé manquante.");
    }

    const surface = (data.widthM * data.lengthM).toFixed(1);
    const prompt = `Tu es un architecte d'intérieur de luxe spécialisé dans la décoration algérienne haut de gamme.

À partir de la photo fournie de cette pièce (${data.roomType}), génère une nouvelle image photoréaliste de la même pièce entièrement redécorée.

Contraintes STRICTES à respecter :
- Conserver EXACTEMENT la géométrie, les murs, les fenêtres et les portes existantes.
- Dimensions de la pièce : ${data.widthM} m × ${data.lengthM} m, hauteur ${data.heightM} m (surface ≈ ${surface} m²). Le mobilier doit être proportionné à cet espace réel.
- Style demandé : ${data.style}.
${data.budget ? `- Budget approximatif : ${data.budget}.` : ""}
- Souhaits du client : ${data.wishes}
- Photoréalisme, lumière naturelle douce, ambiance magazine de décoration, qualité professionnelle.
- Palette cohérente avec une esthétique algérienne raffinée.

Rendu : une seule image finale haute qualité, cadrage similaire à la photo d'origine.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      if (response.status === 429) {
        throw new Error("Trop de requêtes — veuillez réessayer dans un instant.");
      }
      if (response.status === 402) {
        throw new Error("Crédits IA épuisés. Ajoutez du crédit à l'espace de travail.");
      }
      console.error("AI gateway error", response.status, errText);
      throw new Error("La génération a échoué. Réessayez.");
    }

    const json = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
          images?: Array<{ image_url?: { url?: string } }>;
        };
      }>;
    };

    const message = json.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error("AI response missing image", JSON.stringify(json).slice(0, 500));
      throw new Error("L'IA n'a pas renvoyé d'image. Réessayez avec une autre photo.");
    }

    return {
      imageDataUrl: imageUrl,
      description: message?.content?.toString() ?? "",
    };
  });
