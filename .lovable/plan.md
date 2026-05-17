# Build statique DECIDOR (ZIP avec index.html)

## Objectif
Vous obtenez un fichier `.zip` contenant le site DECIDOR déjà compilé. À l'intérieur, un fichier **`index.html`** que vous double-cliquez pour ouvrir le site dans votre navigateur — aucune installation requise.

## Étapes (côté Lovable)

1. **Compiler le projet** en mode statique (`vite build` → dossier `dist/`).
2. **Vérifier** que `dist/index.html` existe bien et que les assets (CSS, JS, images) sont présents.
3. **Créer le ZIP** `decidor-static.zip` à la racine de `/mnt/documents/` avec cette structure :
   ```text
   decidor-static.zip
   └── decidor/
       ├── index.html      ← le fichier d'entrée
       ├── assets/         ← CSS, JS, images compilés
       └── ...
   ```
4. **Livrer** le ZIP via un bloc `<presentation-artifact>` téléchargeable.

## Limites importantes à connaître

- **Frontend uniquement.** Le build statique contient les pages (accueil, studio, catalogue) mais **PAS le backend** :
  - L'appel à l'IA pour générer les images de décoration **ne fonctionnera pas** (il nécessite un serveur).
  - Les server functions TanStack (`src/lib/decor.functions.ts`) ne tournent pas dans un fichier ouvert en local.
- **Navigation locale.** Ouvrir `index.html` directement (`file://`) fonctionne pour la home, mais certaines routes profondes (ex. `/catalog/cuisine`) peuvent nécessiter un mini serveur local (`python3 -m http.server` par ex.).

## Si vous voulez aussi le backend fonctionnel

Dites-le moi — je peux à la place préparer :
- Le **code source complet** (frontend + backend) en ZIP, prêt à `bun install && bun run dev`, OU
- Vous guider pour **publier** l'app sur Lovable (bouton Publish) — le backend reste hébergé et tout fonctionne réellement.

## Prochaine étape
Confirmez-moi « build statique OK » et je lance la compilation + génération du ZIP.
