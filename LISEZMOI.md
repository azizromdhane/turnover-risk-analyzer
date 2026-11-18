# Turnover Risk Analyzer (projet React + Vite)

## Lancer le projet
Installer Node.js (version LTS) depuis https://nodejs.org, une seule fois.
1. Dézippez le dossier, ouvrez un terminal dedans (Windows : clic droit > « Ouvrir dans le terminal »).
2. `npm install`   (une fois, nécessite internet)
3. `npm run dev`   puis ouvrez l'adresse affichée (http://localhost:5173)
4. Page Importation > choisissez `donnees-test/base_rh_avec_noms.xlsx`.

## Où modifier quoi
- Variables, poids, recommandations : `src/scoring.js` (bloc `VARS`)
- Grilles de risque par facteur (tranches et scores 0–100) : `src/scoring.js` (bloc `GRID`) ; modifiables aussi dans la page Méthodologie
- Seuils du score final (faible / moyen / élevé) : `src/scoring.js` (`THRESH`) ; modifiables aussi dans la page Méthodologie
- Navigation et état : `src/App.jsx` ; pages et graphiques (Recharts) : `src/Pages.jsx` ; couleurs et style : `src/index.css`
- Ajouter une variable : ajouter une ligne dans `VARS` et une grille dans `GRID` (libellé, poids, noms de colonnes, facteur, reco)
- Version finale : `npm run build` puis `npm run preview`

## Nouveautés v2
Dashboard avec 8 graphiques (Recharts), synthèse automatique, top des salariés à risque, radar salarié vs organisation, contribution par variable, export CSV, impression PDF, pagination, recherche globale par ID.

## Version finale
Page d'accueil refaite, noms facultatifs (colonne `Name` ou `Nom`) avec mode anonyme 🔒, mode sombre 🌙, filtre par département, simulateur d'actions RH, navigation entre profils, animations.
La base `donnees-test/base_rh_avec_noms.xlsx` contient 150 salariés ENTIÈREMENT FICTIFS (noms générés au hasard).

## v3
Nouvelle page d'accueil (aperçu en direct, problématique, pondérations), pages Comparaison et Plan d'action RH (priorités, entretiens, exposition financière avec hypothèse modifiable).

## v4
Graphiques enrichis : infobulles personnalisées, seuils de risque, étiquettes, aires dégradées, histogramme des scores, nuage satisfaction/absentéisme, carte de chaleur département × ancienneté, jauge en demi-cercle dans le profil.

## v5 — Scoring simple par grilles de risque (pédagogique)
La page **Méthodologie** présente une méthode simple en 3 étapes : lire la valeur, donner un score de risque de 0 à 100 grâce à la grille du facteur, puis multiplier par le poids et additionner. Le tableau central montre pour chaque facteur ce qu'il mesure, sa conversion en risque et son poids. Un exemple complet pour **Ines Haddad** (EMP-011) détaille le calcul, vérifiable à la main. Les poids, seuils et grilles restent personnalisables (option masquée). Le même tableau « 🧮 Détail du calcul, pas à pas » est affiché dans chaque profil individuel.
