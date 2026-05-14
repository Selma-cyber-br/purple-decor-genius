import peinture from "@/assets/cat-peinture.jpg";
import carrelage from "@/assets/cat-carrelage.jpg";
import parquet from "@/assets/cat-parquet.jpg";
import mobilier from "@/assets/cat-mobilier.jpg";
import luminaire from "@/assets/cat-luminaire.jpg";
import plafond from "@/assets/cat-plafond.jpg";
import menuiserie from "@/assets/cat-menuiserie.jpg";
import clim from "@/assets/cat-clim.jpg";
import accessoires from "@/assets/cat-accessoires.jpg";
import rideaux from "@/assets/cat-rideaux.jpg";
import cuisine from "@/assets/cat-cuisine.jpg";
import sanitaire from "@/assets/cat-sanitaire.jpg";
import art from "@/assets/cat-art.jpg";
import tapis from "@/assets/cat-tapis.jpg";

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "peinture", name: "Peinture murale", tagline: "Couleurs & finitions nobles", image: peinture },
  { slug: "carrelage", name: "Carrelage & faïence", tagline: "Zellige, marbre, céramique", image: carrelage },
  { slug: "parquet", name: "Dalle de sol & parquet", tagline: "Bois massif et grès cérame", image: parquet },
  { slug: "mobilier", name: "Mobilier", tagline: "Canapés, lits, tables, fauteuils", image: mobilier },
  { slug: "luminaires", name: "Luminaires & lustres", tagline: "Cristal, laiton, lumière chaude", image: luminaire },
  { slug: "plafond", name: "Faux plafond", tagline: "BA13, plâtre, LED intégrées", image: plafond },
  { slug: "menuiserie", name: "Menuiserie", tagline: "Portes, fenêtres, placards", image: menuiserie },
  { slug: "climatisation", name: "Climatisation & ventilation", tagline: "Confort toute saison", image: clim },
  { slug: "accessoires", name: "Accessoires déco", tagline: "Bougies, vases, bibelots", image: accessoires },
  { slug: "rideaux", name: "Rideaux & stores", tagline: "Velours, lin, occultants", image: rideaux },
  { slug: "cuisine", name: "Cuisine équipée", tagline: "Sur mesure, marbre & laiton", image: cuisine },
  { slug: "sanitaire", name: "Sanitaire & salle de bain", tagline: "Robinetterie, baignoires", image: sanitaire },
  { slug: "art", name: "Art mural & tableaux", tagline: "Œuvres encadrées, galerie", image: art },
  { slug: "tapis", name: "Tapis & moquette", tagline: "Orient, laine, soie", image: tapis },
];
