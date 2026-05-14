import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useRef, useState } from "react";
import { Sparkles, Upload, Wand2, ArrowLeft, Download, Loader2 } from "lucide-react";
import { generateDecorImage, type GenerateDecorResult } from "@/lib/decor.functions";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio IA — DECIDOR" },
      {
        name: "description",
        content:
          "Téléversez la photo de votre pièce, indiquez ses dimensions et vos souhaits — l'IA DECIDOR génère votre nouvelle décoration.",
      },
    ],
  }),
  component: Studio,
});

const ROOM_TYPES = ["Salon", "Chambre", "Cuisine", "Salle à manger", "Salle de bain", "Bureau", "Entrée"];
const STYLES = ["Classique", "Minimaliste", "Méditerranéen", "Scandinave", "Mauresque moderne", "Art déco"];

function Studio() {
  const generate = useServerFn(generateDecorImage);

  const [preview, setPreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("Salon");
  const [widthM, setWidthM] = useState(4);
  const [lengthM, setLengthM] = useState(5);
  const [heightM, setHeightM] = useState(2.8);
  const [style, setStyle] = useState("Classique");
  const [budget, setBudget] = useState("");
  const [wishes, setWishes] = useState(
    "Ambiance chaleureuse mauve et or champagne, canapé velours, tapis oriental, lumière douce.",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateDecorResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Veuillez choisir une image.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Image trop lourde (max 6 Mo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setPreview(url);
      setImageDataUrl(url);
    };
    reader.readAsDataURL(file);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!imageDataUrl) {
      setError("Téléversez d'abord une photo de la pièce.");
      return;
    }
    setLoading(true);
    try {
      const res = await generate({
        data: { imageDataUrl, roomType, widthM, lengthM, heightM, style, budget, wishes },
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[var(--color-gold)] italic">φ</span>
            <span className="tracking-[0.25em]">DECIDOR · STUDIO IA</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)]/40 bg-[color-mix(in_oklab,var(--color-gold)_12%,transparent)] px-3 py-1 text-xs uppercase tracking-[0.3em]">
            <Sparkles className="h-3.5 w-3.5" />
            Génération photoréaliste
          </span>
          <h1 className="mt-4 text-3xl text-primary sm:text-4xl">Décorez votre pièce avec l'IA</h1>
          <p className="mt-3 text-muted-foreground">
            Téléversez une photo, indiquez les dimensions exactes et vos souhaits. L'IA respecte la
            géométrie de votre espace pour générer une nouvelle décoration cohérente.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div>
              <label className="mb-2 block text-sm text-foreground">1. Photo de la pièce</label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative grid h-56 w-full place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition-colors hover:border-primary"
              >
                {preview ? (
                  <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Cliquer pour téléverser (JPG / PNG)</p>
                  </div>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">2. Type de pièce</label>
              <div className="flex flex-wrap gap-2">
                {ROOM_TYPES.map((r) => (
                  <Chip key={r} active={roomType === r} onClick={() => setRoomType(r)}>{r}</Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm">3. Dimensions réelles (mètres)</label>
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="Largeur" value={widthM} onChange={setWidthM} step={0.1} />
                <NumberField label="Longueur" value={lengthM} onChange={setLengthM} step={0.1} />
                <NumberField label="Hauteur" value={heightM} onChange={setHeightM} step={0.1} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Surface ≈ <span className="text-primary">{(widthM * lengthM).toFixed(1)} m²</span>
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm">4. Style souhaité</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm">5. Budget (optionnel)</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="ex : 250 000 DZD"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">6. Vos souhaits</label>
              <textarea
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="Couleurs, matériaux, ambiance, contraintes…"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !imageDataUrl}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[var(--shadow-luxe)] transition-all duration-300 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Générer ma décoration
                </>
              )}
            </button>
          </form>

          {/* RESULT */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl text-primary">Résultat</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              L'IA respecte les dimensions et la géométrie de votre pièce.
            </p>

            <div className="mt-5 grid place-items-center overflow-hidden rounded-xl border border-border bg-muted/40 aspect-[4/3]">
              {loading ? (
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Composition en cours… (~20-40 s)</p>
                </div>
              ) : result ? (
                <img src={result.imageDataUrl} alt="Décoration générée" className="h-full w-full object-cover" />
              ) : preview ? (
                <div className="relative h-full w-full">
                  <img src={preview} alt="Avant" className="h-full w-full object-cover opacity-60" />
                  <div className="absolute inset-0 grid place-items-center bg-background/40">
                    <p className="text-sm text-muted-foreground">Aperçu — cliquez sur Générer</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Téléversez une photo pour commencer.</p>
              )}
            </div>

            {result && (
              <div className="mt-5 space-y-4">
                {result.description && (
                  <p className="rounded-lg bg-muted/60 p-3 text-sm text-foreground">{result.description}</p>
                )}
                <a
                  href={result.imageDataUrl}
                  download={`decidor-${Date.now()}.png`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)] px-4 py-2 text-sm transition-colors hover:bg-[color-mix(in_oklab,var(--color-gold)_18%,transparent)]"
                >
                  <Download className="h-4 w-4" />
                  Télécharger l'image
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors duration-300 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="number"
        min={1}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}
