import { createFileRoute } from "@tanstack/react-router";
import { Search, Globe, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-decidor.jpg";
import { categories } from "@/lib/categories";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DECIDOR — Décoration intérieure haut de gamme en Algérie" },
      {
        name: "description",
        content:
          "Plateforme de décoration intelligente : catalogue de matériaux, mobilier et accessoires des meilleurs fournisseurs algériens. Prix en DZD.",
      },
      { property: "og:title", content: "DECIDOR — Luxe accessible, décoration sur mesure" },
      { property: "og:description", content: "De la peinture au mobilier, redessinez vos espaces avec DECIDOR." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span
        className="grid h-9 w-9 place-items-center rounded-full bg-primary text-[var(--color-gold)] text-lg leading-none"
        style={{ fontStyle: "italic" }}
        aria-hidden
      >
        φ
      </span>
      <span className="text-2xl tracking-[0.25em] text-primary">DECIDOR</span>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Logo />
          <div className="hidden flex-1 max-w-xl md:block">
            <SearchBar />
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
          >
            <Globe className="h-4 w-4" />
            <span>FR / ع</span>
          </button>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 md:hidden">
          <SearchBar />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)]/40 bg-[color-mix(in_oklab,var(--color-gold)_12%,transparent)] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[var(--color-gold-foreground)]">
                <Sparkles className="h-3.5 w-3.5" />
                Nouveauté · IA décorative
              </span>
              <h1 className="mt-5 text-4xl leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
                L’élégance, dans la juste proportion.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                DECIDOR réunit les meilleurs fournisseurs de décoration en Algérie. Catalogue libre,
                prix en Dinars, et une intelligence artificielle qui transforme une simple photo en
                projet de décoration complet.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[var(--shadow-luxe)] transition-all duration-300 hover:bg-secondary"
                >
                  Explorer le catalogue
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--color-gold)] bg-transparent px-6 py-3 text-foreground transition-colors duration-300 hover:bg-[color-mix(in_oklab,var(--color-gold)_18%,transparent)]"
                >
                  Essayer la déco IA
                </button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6">
                {[
                  { k: "14", v: "Catégories" },
                  { k: "100%", v: "Fournisseurs algériens" },
                  { k: "DZD", v: "Devise unique" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="text-3xl text-primary">{s.k}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_35%,transparent),transparent_70%)] blur-2xl" />
              <div className="overflow-hidden rounded-[1.5rem] border border-border shadow-[var(--shadow-luxe)]">
                <img
                  src={heroImage}
                  alt="Salon algérien luxueux mauve et or"
                  width={1600}
                  height={1024}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-[var(--color-gold)]/40 bg-card px-5 py-4 shadow-[var(--shadow-card)] sm:block">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Proportion</p>
                <p className="mt-1 text-2xl text-primary">φ = 1.618</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="catalogue" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold-foreground)]">
              Catalogue
            </p>
            <h2 className="mt-2 text-3xl text-primary sm:text-4xl">
              Choisissez l’univers de votre projet
            </h2>
          </div>
          <a
            href="#"
            className="hidden text-sm text-primary underline-offset-4 hover:underline sm:inline"
          >
            Tout voir
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <article
              key={cat.slug}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-luxe)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  width={1024}
                  height={768}
                  loading={i < 3 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-[600ms] group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--primary)_85%,transparent)] via-[color-mix(in_oklab,var(--primary)_25%,transparent)] to-transparent opacity-90" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-xl text-[var(--color-background)]">{cat.name}</h3>
                <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--color-background)_80%,transparent)]">
                  {cat.tagline}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-[var(--color-gold)]">
                  Découvrir →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-[color-mix(in_oklab,var(--primary)_4%,var(--background))]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Décoration intérieure intelligente · Alger, Algérie
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold-foreground)]">
            Proportion φ — Beauté mathématique
          </p>
        </div>
      </footer>
    </div>
  );
}

function SearchBar() {
  return (
    <label className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 text-sm shadow-sm transition-colors duration-300 focus-within:border-primary">
      <Search className="h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Rechercher un produit, un style, un fournisseur…"
        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </label>
  );
}
