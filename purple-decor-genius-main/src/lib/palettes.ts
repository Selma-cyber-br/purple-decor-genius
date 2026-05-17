export type Palette = {
  id: string;
  name: string;
  tagline: string;
  essentials: string[]; // 4 essentielles
  nearby: string[]; // 4 proches
};

export const palettes: Palette[] = [
  {
    id: "mauve-royal",
    name: "Mauve Royal",
    tagline: "Velours, or champagne, ivoire",
    essentials: ["#6B4E8C", "#9B7BB8", "#C8A96E", "#FAF8F5"],
    nearby: ["#3F2A57", "#B89BD1", "#E2C99A", "#EDE7DC"],
  },
  {
    id: "sable-dore",
    name: "Sable Doré",
    tagline: "Beige, terracotta, laiton",
    essentials: ["#C8A96E", "#A8703F", "#E8DAC2", "#3D2B1F"],
    nearby: ["#E2C99A", "#C68A5A", "#F5EBDB", "#5B3F2B"],
  },
  {
    id: "vert-olive",
    name: "Vert Olive",
    tagline: "Sauge, mousse, lin écru",
    essentials: ["#5C6B3F", "#8FA86B", "#E6E2D3", "#2C3221"],
    nearby: ["#3F4A2B", "#B0C290", "#F0EEE2", "#1F2317"],
  },
  {
    id: "bleu-nuit",
    name: "Bleu Nuit",
    tagline: "Profondeur, cuivre, marbre blanc",
    essentials: ["#1E2A47", "#3C5A88", "#C97D4E", "#F2F0EA"],
    nearby: ["#0F1830", "#5C7BB0", "#E59A6B", "#FFFFFF"],
  },
];
