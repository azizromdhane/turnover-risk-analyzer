# Turnover Risk Analyzer (projet React + Vite)

## Lancer le projet
Installer Node.js (version LTS) depuis https://nodejs.org, une seule fois.
1. Dézippez le dossier, ouvrez un terminal dedans (Windows : clic droit > « Ouvrir dans le terminal »).
2. `npm install`   (une fois, nécessite internet)
3. `npm run dev`   puis ouvrez l'adresse affichée (http://localhost:5173)
4. Page Importation > choisissez `donnees-test/base_rh_avec_noms.xlsx`.

## Où modifier quoi
- Variables, poids, règles, recommandations : `src/scoring.js` (bloc `VARS`)
- Seuils par défaut : `src/scoring.js` (`THRESH`) ; modifiables aussi dans la page Méthodologie
- Règle de l'ancienneté : `src/scoring.js` (`tenRisk`)
- Navigation et état : `src/App.jsx` ; pages et graphiques (Recharts) : `src/Pages.jsx` ; couleurs et style : `src/index.css`
- Ajouter une variable : ajouter une ligne dans `VARS` (libellé, poids, noms de colonnes, sens, facteur, reco)
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
