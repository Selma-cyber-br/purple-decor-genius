import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { categories } from "@/lib/categories";
import { productsByCategory, formatDZD } from "@/lib/catalog";

export const Route = createFileRoute("/catalog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Catalogue ${params.slug} — DECIDOR` },
      { name: "description", content: `Catalogue ${params.slug} : produits, prix en DA, fournisseurs algériens.` },
    ],
  }),
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { category: cat, products: productsByCategory(params.slug) };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <h1 className="text-3xl text-primary">Catégorie introuvable</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Retour à l'accueil</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center p-4 text-center">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  component: CatalogPage,
});

function CatalogPage() {
  const { category, products } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
          <span className="text-sm tracking-[0.2em] text-primary">DECIDOR · CATALOGUE</span>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold-foreground)]">Catégorie</p>
        <h1 className="mt-2 text-3xl text-primary sm:text-4xl">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.tagline}</p>

        {products.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Catalogue en cours de constitution.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-luxe)]">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="text-base text-primary">{p.name}</h3>
                  {p.vendor && <p className="mt-0.5 text-xs text-muted-foreground">par {p.vendor}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg text-primary">{formatDZD(p.priceDZD)}</span>
                    <button className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-secondary">
                      Ajouter
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
