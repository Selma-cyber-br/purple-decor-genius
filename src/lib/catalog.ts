// Catalogue produits par catégorie. Prix en DZD (Dinars algériens).
// Images via Unsplash (libres). Remplaçables par des photos fournisseurs réels.

export type Product = {
  id: string;
  name: string;
  category: string; // slug
  priceDZD: number;
  image: string;
  vendor?: string;
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const products: Product[] = [
  // Mobilier
  { id: "p1", name: "Canapé velours 3 places mauve", category: "mobilier", priceDZD: 185000, image: u("1555041469-a586c61ea9bc"), vendor: "Décor Alger" },
  { id: "p2", name: "Fauteuil capitonné or", category: "mobilier", priceDZD: 92000, image: u("1567538096630-e0c55bd6374c"), vendor: "Maison Bab Ezzouar" },
  { id: "p3", name: "Table basse marbre & laiton", category: "mobilier", priceDZD: 68000, image: u("1493663284031-b7e3aefcae8e"), vendor: "Atelier Hydra" },
  { id: "p4", name: "Lit double cuir capitonné", category: "mobilier", priceDZD: 240000, image: u("1505693416388-ac5ce068fe85"), vendor: "Décor Alger" },
  { id: "p5", name: "Table à manger chêne 6 places", category: "mobilier", priceDZD: 155000, image: u("1577140917170-285929fb55b7"), vendor: "Bois Noble" },

  // Luminaires
  { id: "l1", name: "Lustre cristal 8 branches", category: "luminaires", priceDZD: 145000, image: u("1513506003901-1e6a229e2d15") },
  { id: "l2", name: "Lampadaire laiton trépied", category: "luminaires", priceDZD: 38000, image: u("1507473885765-e6ed057f782c") },
  { id: "l3", name: "Suspension dôme noir & or", category: "luminaires", priceDZD: 24000, image: u("1524634126442-357e0eac3c14") },
  { id: "l4", name: "Lampe à poser céramique", category: "luminaires", priceDZD: 12500, image: u("1540932239986-30128078f3c5") },

  // Tapis
  { id: "t1", name: "Tapis berbère laine 200×300", category: "tapis", priceDZD: 78000, image: u("1600166898405-da9535204843") },
  { id: "t2", name: "Tapis oriental rouge & or", category: "tapis", priceDZD: 62000, image: u("1583845112203-29329902332e") },
  { id: "t3", name: "Tapis shaggy ivoire", category: "tapis", priceDZD: 34000, image: u("1493663284031-b7e3aefcae8e") },
  { id: "t4", name: "Kilim géométrique mauve", category: "tapis", priceDZD: 28000, image: u("1615529182904-14819c35db37") },

  // Rideaux
  { id: "r1", name: "Rideau velours occultant", category: "rideaux", priceDZD: 18500, image: u("1513161455079-7dc1de15ef3e") },
  { id: "r2", name: "Voilage lin naturel", category: "rideaux", priceDZD: 8500, image: u("1505691938895-1758d7feb511") },

  // Peinture
  { id: "pe1", name: "Peinture mate Mauve Royal 5L", category: "peinture", priceDZD: 9800, image: u("1562184552-997c461abbe6") },
  { id: "pe2", name: "Peinture satinée Ivoire 5L", category: "peinture", priceDZD: 7400, image: u("1562184760-c3d1c7fa5ce8") },

  // Carrelage
  { id: "c1", name: "Zellige marocain 10×10", category: "carrelage", priceDZD: 4500, image: u("1565515003834-4316c3f88e3e") },
  { id: "c2", name: "Marbre Calacatta 60×60", category: "carrelage", priceDZD: 7800, image: u("1604147495798-57beb5d6af73") },

  // Accessoires
  { id: "a1", name: "Vase céramique mat or", category: "accessoires", priceDZD: 7800, image: u("1602874801007-bd458bb1b8b6") },
  { id: "a2", name: "Bougie parfumée oud & ambre", category: "accessoires", priceDZD: 3500, image: u("1602874801006-94c34cc2a73b") },
  { id: "a3", name: "Plateau laiton ciselé", category: "accessoires", priceDZD: 9200, image: u("1556909114-f6e7ad7d3136") },

  // Art
  { id: "ar1", name: "Tableau abstrait mauve & or 80×120", category: "art", priceDZD: 32000, image: u("1549887534-1541e9326642") },
  { id: "ar2", name: "Calligraphie arabe encadrée", category: "art", priceDZD: 18000, image: u("1513519245088-0e12902e5a38") },

  // Sanitaire
  { id: "s1", name: "Robinetterie laiton brossé", category: "sanitaire", priceDZD: 22000, image: u("1552321554-5fefe8c9ef14") },
  { id: "s2", name: "Lavabo céramique sur pied", category: "sanitaire", priceDZD: 38000, image: u("1552321554-5fefe8c9ef15") },

  // Cuisine
  { id: "k1", name: "Îlot central marbre 2.4m", category: "cuisine", priceDZD: 320000, image: u("1556909114-f6e7ad7d3137") },
  { id: "k2", name: "Hotte cuivrée artisanale", category: "cuisine", priceDZD: 78000, image: u("1556909114-f6e7ad7d3138") },

  // Parquet
  { id: "pa1", name: "Parquet chêne huilé 14mm m²", category: "parquet", priceDZD: 6200, image: u("1565538810643-b5bdb714032a") },

  // Plafond
  { id: "pl1", name: "Faux plafond plâtre + LED ml", category: "plafond", priceDZD: 4800, image: u("1503602642458-232111445657") },

  // Menuiserie
  { id: "m1", name: "Porte intérieure chêne massif", category: "menuiserie", priceDZD: 58000, image: u("1558618666-fcd25c85cd64") },

  // Climatisation
  { id: "cl1", name: "Climatiseur split inverter 18000 BTU", category: "climatisation", priceDZD: 145000, image: u("1581094288338-2314dddb7ece") },
];

export function productsByCategory(slug: string) {
  return products.filter((p) => p.category === slug);
}

export function findProductFuzzy(query: string, category?: string): Product | undefined {
  const q = query.toLowerCase();
  const pool = category ? productsByCategory(category) : products;
  return (
    pool.find((p) => p.name.toLowerCase().includes(q)) ??
    products.find((p) => p.name.toLowerCase().includes(q))
  );
}

export function formatDZD(n: number) {
  return new Intl.NumberFormat("fr-DZ").format(n) + " DA";
}
