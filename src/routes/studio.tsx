import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useRef, useState } from "react";
import { Sparkles, Upload, Wand2, ArrowLeft, Download, Loader2, ShoppingBag, X, Plus, Check } from "lucide-react";
import { generateDecorImage, detectDecorItems, type GenerateDecorResult, type DetectedItem } from "@/lib/decor.functions";
import { palettes, type Palette } from "@/lib/palettes";
import { findProductFuzzy, formatDZD, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio IA — DECIDOR" },
      { name: "description", content: "Téléversez votre pièce, choisissez palette et budget, l'IA propose 3 décorations photoréalistes — chaque élément est cliquable et achetable." },
    ],
  }),
  component: Studio,
});

const ROOM_TYPES = ["Salon", "Chambre", "Cuisine", "Salle à manger", "Salle de bain", "Bureau", "Entrée"];
const STYLES = ["Moderne", "Classique", "Bohème", "Minimaliste", "Art Déco", "Oriental contemporain", "Industriel", "Scandinave"];
const INTENSITIES: { id: "doux" | "equilibre" | "audacieux"; label: string; desc: string }[] = [
  { id: "doux", label: "Doux", desc: "Touches subtiles, fonds neutres" },
  { id: "equilibre", label: "Équilibré", desc: "Un mur ou meuble d'accent" },
  { id: "audacieux", label: "Audacieux", desc: "Couleurs sur grandes surfaces" },
];

type Variant = {
  result: GenerateDecorResult;
  items: DetectedItem[] | null;
  loadingItems: boolean;
};

type CartLine = { product: Product; qty: number };

function Studio() {
  const generate = useServerFn(generateDecorImage);
  const detect = useServerFn(detectDecorItems);

  const [preview, setPreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("Salon");
  const [palette, setPalette] = useState<Palette>(palettes[0]);
  const [dominantColor, setDominantColor] = useState<string>(palettes[0].essentials[0]);
  const [paletteIntensity, setPaletteIntensity] = useState<"doux" | "equilibre" | "audacieux">("equilibre");
  const [style, setStyle] = useState<string>("Moderne");
  const [budget, setBudget] = useState<number>(0);
  const [wishes, setWishes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<{ item: DetectedItem; product?: Product } | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Veuillez choisir une image.");
    if (file.size > 6 * 1024 * 1024) return setError("Image trop lourde (max 6 Mo).");
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
    setVariants([]);
    setSelected(null);
    if (!imageDataUrl) return setError("Téléversez d'abord une photo.");
    setLoading(true);
    try {
      const hints = ["Ambiance principale, équilibrée", "Variation plus sombre et intime", "Variation plus lumineuse et aérée"];
      const results = await Promise.all(
        hints.map((h) =>
          generate({ data: { imageDataUrl, roomType, palette, budgetDZD: budget || undefined, wishes, variantHint: h } })
        )
      );
      const v: Variant[] = results.map((r) => ({ result: r, items: null, loadingItems: true }));
      setVariants(v);
      setActive(0);
      // Détection en parallèle (non bloquante)
      results.forEach((r, idx) => {
        detect({ data: { imageDataUrl: r.imageDataUrl, roomType } })
          .then((d) => setVariants((prev) => prev.map((vv, i) => i === idx ? { ...vv, items: d.items, loadingItems: false } : vv)))
          .catch(() => setVariants((prev) => prev.map((vv, i) => i === idx ? { ...vv, items: [], loadingItems: false } : vv)));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  const openItem = (item: DetectedItem) => {
    const product = findProductFuzzy(item.label, item.category);
    setSelected({ item, product });
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((l) => l.product.id === product.id);
      if (found) return prev.map((l) => l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
    setSelected(null);
  };

  const cartTotal = useMemo(() => cart.reduce((s, l) => s + l.product.priceDZD * l.qty, 0), [cart]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <div className="flex items-center gap-2 text-primary text-sm sm:text-base">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[var(--color-gold)] italic">φ</span>
            <span className="tracking-[0.2em]">DECIDOR · STUDIO</span>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary">
            <ShoppingBag className="h-4 w-4" />
            <span>{cart.length}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)]/40 bg-[color-mix(in_oklab,var(--color-gold)_12%,transparent)] px-3 py-1 text-xs uppercase tracking-[0.3em]">
            <Sparkles className="h-3.5 w-3.5" /> 3 propositions photoréalistes
          </span>
          <h1 className="mt-4 text-3xl text-primary sm:text-4xl">Décorez avec l'IA, achetez en un clic</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            La photo réelle est respectée : fenêtres, portes, lavabo, fonction de la pièce restent à leur place.
            Cliquez ensuite sur n'importe quel élément du rendu pour voir le produit, le prix en DA et l'ajouter au panier.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div>
              <label className="mb-2 block text-sm">1. Photo de la pièce</label>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="group relative grid h-48 w-full place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 hover:border-primary">
                {preview
                  ? <img src={preview} alt="" className="h-full w-full object-cover" />
                  : <div className="text-center">
                      <Upload className="mx-auto h-7 w-7 text-muted-foreground group-hover:text-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">Cliquer pour téléverser</p>
                    </div>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
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
              <label className="mb-2 block text-sm">3. Palette de couleurs (4 essentielles + nuances proches)</label>
              <div className="grid grid-cols-2 gap-3">
                {palettes.map((p) => {
                  const sel = palette.id === p.id;
                  return (
                    <button key={p.id} type="button" onClick={() => setPalette(p)}
                      className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all ${sel ? "border-primary shadow-[var(--shadow-card)]" : "border-border hover:border-primary/60"}`}>
                      <div className="flex h-8 w-full overflow-hidden rounded">
                        {p.essentials.map((c) => <div key={c} style={{ background: c }} className="flex-1" />)}
                      </div>
                      <div className="mt-1 flex h-3 w-full overflow-hidden rounded opacity-70">
                        {p.nearby.map((c) => <div key={c} style={{ background: c }} className="flex-1" />)}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-primary">{p.name}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.tagline}</p>
                        </div>
                        {sel && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>4. Budget (optionnel)</span>
                <span className="text-primary">{budget > 0 ? formatDZD(budget) : "Sans contrainte"}</span>
              </div>
              <input type="range" min={0} max={2_000_000} step={50_000} value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]" />
              <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>0</span><span>2 000 000 DA</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm">5. Vos souhaits (optionnel)</label>
              <textarea value={wishes} onChange={(e) => setWishes(e.target.value)} rows={3}
                placeholder="Ex : ambiance chaleureuse, tapis oriental, lumière douce…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>

            {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

            <button type="submit" disabled={loading || !imageDataUrl}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[var(--shadow-luxe)] transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Génération de 3 propositions…</>
                : <><Wand2 className="h-4 w-4" /> Générer 3 propositions</>}
            </button>
          </form>

          {/* RESULT */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl text-primary">Résultats</h2>
              {variants.length > 0 && (
                <div className="flex gap-1 rounded-full border border-border p-1">
                  {variants.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className={`rounded-full px-3 py-1 text-xs ${active === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"}`}>
                      Proposition {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative grid place-items-center overflow-hidden rounded-xl border border-border bg-muted/40 aspect-[4/3]">
              {loading ? (
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">Composition en cours… (~30-60 s)</p>
                </div>
              ) : variants.length > 0 ? (
                <ImageWithHotspots variant={variants[active]} onPick={openItem} />
              ) : preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover opacity-60" />
              ) : (
                <p className="text-sm text-muted-foreground">Téléversez une photo pour commencer.</p>
              )}
            </div>

            {variants[active] && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {variants[active].loadingItems
                    ? "Détection des éléments en cours…"
                    : `${variants[active].items?.length ?? 0} élément(s) cliquable(s) sur l'image.`}
                </p>
                <a href={variants[active].result.imageDataUrl} download={`decidor-${active + 1}.png`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)] px-4 py-1.5 text-sm hover:bg-[color-mix(in_oklab,var(--color-gold)_18%,transparent)]">
                  <Download className="h-4 w-4" /> Télécharger
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Item modal */}
      {selected && (
        <ItemModal selected={selected} onClose={() => setSelected(null)} onAdd={addToCart} />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer cart={cart} total={cartTotal} onClose={() => setCartOpen(false)}
          onRemove={(id) => setCart((c) => c.filter((l) => l.product.id !== id))} />
      )}
    </div>
  );
}

function ImageWithHotspots({ variant, onPick }: { variant: Variant; onPick: (i: DetectedItem) => void }) {
  return (
    <div className="relative h-full w-full">
      <img src={variant.result.imageDataUrl} alt="" className="h-full w-full object-cover" />
      {variant.items?.map((it, idx) => (
        <button key={idx} type="button" onClick={() => onPick(it)}
          style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, width: `${it.w * 100}%`, height: `${it.h * 100}%` }}
          className="group absolute rounded-md border-2 border-transparent transition-colors hover:border-[var(--color-gold)] hover:bg-[color-mix(in_oklab,var(--color-gold)_15%,transparent)]"
          aria-label={it.label}>
          <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-[var(--color-gold)] text-xs shadow opacity-90 group-hover:scale-110 transition-transform">
            <Plus className="h-3 w-3" />
          </span>
          <span className="absolute bottom-1 left-1 hidden rounded bg-[color-mix(in_oklab,var(--primary)_85%,transparent)] px-2 py-0.5 text-[10px] text-primary-foreground group-hover:block">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function ItemModal({ selected, onClose, onAdd }: { selected: { item: DetectedItem; product?: Product }; onClose: () => void; onAdd: (p: Product) => void }) {
  const { item, product } = selected;
  const price = product?.priceDZD ?? item.estimatedPriceDZD;
  const image = product?.image;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-luxe)]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 hover:bg-background"><X className="h-4 w-4" /></button>
        {image
          ? <img src={image} alt={item.label} className="aspect-[4/3] w-full object-cover" />
          : <div className="aspect-[4/3] grid place-items-center bg-muted text-muted-foreground text-sm">Photo produit indisponible</div>}
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold-foreground)]">{item.category}</p>
          <h3 className="mt-1 text-xl text-primary">{product?.name ?? item.label}</h3>
          {product?.vendor && <p className="text-xs text-muted-foreground">par {product.vendor}</p>}
          <p className="mt-3 text-2xl text-primary">{formatDZD(price)}</p>
          {!product && <p className="mt-2 text-xs text-muted-foreground">Prix estimé. Voir le catalogue pour des références exactes.</p>}
          <div className="mt-5 flex gap-2">
            {product && (
              <button onClick={() => onAdd(product)} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:bg-secondary">
                Ajouter au panier
              </button>
            )}
            <Link to="/catalog/$slug" params={{ slug: item.category }}
              className="rounded-full border border-[var(--color-gold)] px-4 py-2.5 text-sm hover:bg-[color-mix(in_oklab,var(--color-gold)_18%,transparent)]">
              Voir le catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, total, onClose, onRemove }: { cart: CartLine[]; total: number; onClose: () => void; onRemove: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="flex h-full w-full max-w-sm flex-col bg-card shadow-[var(--shadow-luxe)]" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-lg text-primary">Mon panier</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Votre panier est vide. Cliquez sur les éléments du rendu pour les ajouter.</p>
          ) : cart.map((l) => (
            <div key={l.product.id} className="mb-3 flex gap-3 rounded-lg border border-border p-2">
              <img src={l.product.image} alt="" className="h-16 w-16 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm">{l.product.name}</p>
                <p className="text-xs text-muted-foreground">×{l.qty}</p>
                <p className="text-sm text-primary">{formatDZD(l.product.priceDZD * l.qty)}</p>
              </div>
              <button onClick={() => onRemove(l.product.id)} className="text-xs text-muted-foreground hover:text-destructive">Retirer</button>
            </div>
          ))}
        </div>
        <footer className="border-t border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl text-primary">{formatDZD(total)}</span>
          </div>
          <button disabled={cart.length === 0}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground hover:bg-secondary disabled:opacity-50">
            Passer commande
          </button>
        </footer>
      </aside>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
      {children}
    </button>
  );
}
