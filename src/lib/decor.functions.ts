import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PaletteSchema = z.object({
  id: z.string(),
  name: z.string(),
  essentials: z.array(z.string()).min(2).max(8),
  nearby: z.array(z.string()).min(0).max(8),
});

const InputSchema = z.object({
  imageDataUrl: z.string().min(20).refine((s) => s.startsWith("data:image/"), "Image invalide"),
  roomType: z.string().min(2).max(60),
  palette: PaletteSchema,
  style: z.string().min(2).max(60).optional(),
  paletteIntensity: z.enum(["doux", "equilibre", "audacieux"]).optional(),
  dominantColor: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional(),
  budgetDZD: z.number().min(0).max(100_000_000).optional(),
  wishes: z.string().max(800).optional(),
  variantHint: z.string().max(120).optional(),
});

export type GenerateDecorInput = z.infer<typeof InputSchema>;
export type GenerateDecorResult = { imageDataUrl: string; description: string };

const FORBIDDEN = {
  Cuisine: "PAS de canapé, PAS de fauteuil, PAS de lit. Une cuisine reste une cuisine : meubles bas/hauts, plan de travail, électroménager, éventuellement table.",
  "Salle de bain": "PAS de canapé, PAS de lit. Lavabo, WC, douche/baignoire, miroir, rangements salle de bain.",
  Chambre: "PAS de cuisine, PAS de baignoire. Lit, tables de chevet, dressing/armoire, éventuellement fauteuil.",
  Salon: "PAS de lit, PAS de cuisine. Canapé, fauteuils, table basse, console, tapis.",
  "Salle à manger": "PAS de lit, PAS de cuisine. Table à manger, chaises, buffet, luminaire central.",
  Bureau: "PAS de lit, PAS de cuisine. Bureau, chaise ergonomique, bibliothèque.",
  Entrée: "Console, miroir, porte-manteau, banc.",
} as Record<string, string>;

function buildPrompt(data: GenerateDecorInput) {
  const fonctionnalite = FORBIDDEN[data.roomType] ?? "Respecter strictement la fonction d'origine de la pièce.";
  const budgetLine = data.budgetDZD && data.budgetDZD > 0
    ? `Budget client ≈ ${new Intl.NumberFormat("fr-DZ").format(data.budgetDZD)} DA — choisir des matériaux et finitions cohérents avec ce budget (ni trop pauvre, ni démesurément luxueux).`
    : "";
  return `Tu es architecte d'intérieur de luxe spécialiste du marché algérien.

OBJECTIF : Re-décorer la pièce visible sur la photo fournie, en générant UNE seule image photoréaliste finale de la même pièce.

CONTRAINTES ABSOLUES — respect du réel (priorité maximale) :
1. Conserver EXACTEMENT la géométrie de la pièce : murs, angles, hauteur sous plafond.
2. Conserver EXACTEMENT la position des fenêtres (côté, taille, forme) — si la fenêtre est à droite sur la photo, elle reste à droite.
3. Conserver EXACTEMENT la position des portes.
4. Conserver la position des éléments fixes : lavabo, WC, baignoire, plan de cuisine, cheminée, radiateurs, prises apparentes — s'ils sont à gauche, ils restent à gauche.
5. Conserver le cadrage et l'angle de vue de la photo originale.
6. Fonction de la pièce (${data.roomType}) : ${fonctionnalite}

DIRECTION CRÉATIVE :
- Palette imposée "${data.palette.name}" : couleurs essentielles ${data.palette.essentials.join(", ")} ; nuances proches autorisées ${data.palette.nearby.join(", ")}.
- Ne pas introduire de couleurs hors de cette palette élargie.
- Style : luxe algérien contemporain, matières nobles (velours, marbre, laiton, bois, zellige).
- Lumière naturelle douce, ambiance magazine de décoration.
${budgetLine}
${data.wishes ? `- Souhaits client : ${data.wishes}` : ""}
${data.variantHint ? `- Variante : ${data.variantHint}` : ""}

LIVRABLE : une seule image finale photoréaliste, haute qualité, même cadrage que la photo d'origine.`;
}

async function callGemini(apiKey: string, prompt: string, imageDataUrl: string): Promise<GenerateDecorResult> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      }],
      modalities: ["image", "text"],
    }),
  });
  if (!response.ok) {
    const t = await response.text().catch(() => "");
    if (response.status === 429) throw new Error("Trop de requêtes — réessayez dans un instant.");
    if (response.status === 402) throw new Error("Crédits IA épuisés.");
    console.error("AI gateway error", response.status, t);
    throw new Error("La génération a échoué.");
  }
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string; images?: Array<{ image_url?: { url?: string } }> } }>;
  };
  const msg = json.choices?.[0]?.message;
  const url = msg?.images?.[0]?.image_url?.url;
  if (!url) throw new Error("L'IA n'a pas renvoyé d'image.");
  return { imageDataUrl: url, description: msg?.content?.toString() ?? "" };
}

export const generateDecorImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateDecorResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Service IA indisponible.");
    return callGemini(apiKey, buildPrompt(data), data.imageDataUrl);
  });

// ====================== Détection d'éléments cliquables ======================

const DetectInputSchema = z.object({
  imageDataUrl: z.string().min(20),
  roomType: z.string().min(2).max(60),
});

export type DetectedItem = {
  label: string;
  category: string; // slug catalogue
  estimatedPriceDZD: number;
  // bbox normalisée 0..1, origine top-left
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DetectItemsResult = { items: DetectedItem[] };

const ALLOWED_CATS = [
  "mobilier", "luminaires", "tapis", "rideaux", "peinture", "carrelage",
  "accessoires", "art", "sanitaire", "cuisine", "parquet", "plafond",
  "menuiserie", "climatisation",
];

export const detectDecorItems = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => DetectInputSchema.parse(input))
  .handler(async ({ data }): Promise<DetectItemsResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Service IA indisponible.");

    const prompt = `Analyse cette image d'intérieur (${data.roomType}). Identifie 6 à 10 éléments décoratifs/mobilier visibles et achetables.

Pour chacun renvoie :
- label : nom court en français (ex: "Canapé velours", "Lustre cristal", "Tapis berbère")
- category : un seul slug parmi : ${ALLOWED_CATS.join(", ")}
- estimatedPriceDZD : prix de marché algérien estimé en Dinars (entier)
- x, y, w, h : bounding box normalisée entre 0 et 1 (origine coin haut-gauche), couvrant l'objet

Réponds UNIQUEMENT en JSON strict :
{"items":[{"label":"...","category":"...","estimatedPriceDZD":12345,"x":0.1,"y":0.2,"w":0.2,"h":0.3}]}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        }],
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) {
      if (response.status === 429) throw new Error("Trop de requêtes.");
      if (response.status === 402) throw new Error("Crédits IA épuisés.");
      throw new Error("Détection échouée.");
    }
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { items?: DetectedItem[] } = {};
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    const items = (parsed.items ?? [])
      .filter((it) => typeof it.x === "number" && typeof it.y === "number")
      .map((it) => ({
        label: String(it.label ?? "Élément"),
        category: ALLOWED_CATS.includes(String(it.category)) ? String(it.category) : "accessoires",
        estimatedPriceDZD: Math.max(0, Math.round(Number(it.estimatedPriceDZD) || 0)),
        x: Math.max(0, Math.min(1, Number(it.x))),
        y: Math.max(0, Math.min(1, Number(it.y))),
        w: Math.max(0.02, Math.min(1, Number(it.w))),
        h: Math.max(0.02, Math.min(1, Number(it.h))),
      }));
    return { items };
  });
