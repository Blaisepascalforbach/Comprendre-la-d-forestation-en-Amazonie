# Modèle « parcours vidéo accompagné » : mode d'emploi

Le dossier contient trois fichiers :

| Fichier | Rôle | À modifier ? |
|---|---|---|
| `index.html` | Le moteur : mise en page, vidéo, aides, vérification, trace, lexique | **Non** |
| `contenu.js` | Tout le contenu du parcours | **Oui, uniquement celui-ci** |
| `video.mp4` | La vidéo | Remplacer |

Le `contenu.js` fourni contient le parcours « Déforestation en Amazonie ». Servez-vous-en comme exemple.

---

## Créer un nouveau parcours en 5 minutes

1. **Copiez le dossier** et donnez-lui un nouveau nom (ex. `urbanisation-lagos`).
2. **Remplacez `video.mp4`** par votre vidéo (format MP4, idéalement moins de 25 Mo pour GitHub). Si elle porte un autre nom, indiquez-le dans `"video"`.
3. **Ouvrez `contenu.js`** avec un éditeur de texte (Bloc-notes, TextEdit en mode texte, ou VS Code).
4. **Remplacez les textes** entre guillemets. Les temps (`debut`, `fin`) sont en **secondes** : 1 min 20 s = `80`.
5. **Ouvrez `index.html`** dans le navigateur pour tester, puis déposez le dossier sur GitHub.

> **Astuce IA :** donnez à Claude la transcription de votre vidéo et le fichier `contenu.js` d'exemple, en demandant : « Rédige le contenu.js de ce nouveau parcours en gardant exactement la même structure ». Vous n'aurez plus qu'à relire.

### Les 3 erreurs les plus fréquentes
- Une **virgule oubliée** entre deux éléments, ou une virgule en trop après le dernier élément d'une liste.
- Des **guillemets droits `"` dans un texte**. Utilisez les guillemets « » ou les apostrophes typographiques ’.
- Si la page reste blanche, appuyez sur F12 puis ouvrez l'onglet « Console » : le numéro de ligne de l'erreur y est indiqué.

---

## Les rubriques de `contenu.js`

### En-tête
```js
"titre": "Comprendre la déforestation en Amazonie",
"discipline": "Géographie – Seconde",
"public": "Élèves allophones niveau Pré-B1/B1",
"accroche": "Je regarde une courte vidéo…",
"video": "video.mp4",
"cadrage": [["Thème du programme", "Sociétés et environnements"], ["Objectif élève", "…"]],
"objectifFinal": "À la fin de l’activité, je dois pouvoir : …",
```

### Langues d'appui
Ajoutez ou retirez des langues ici. Pour les langues écrites de droite à gauche, ajoutez `"rtl": true`.
```js
"langues": { "fr": {"nom":"Français"}, "frs": {"nom":"FR simple"}, "ar": {"nom":"العربية","rtl":true}, "tr": {"nom":"Türkçe"} },
```

### Sous-titres : `[début, fin, "texte"]` pour chaque langue
```js
"sousTitres": {
  "fr":  [[0, 18, "Chaque année, plus de 20 000 km²…"], [18, 35, "De grands fermiers…"]],
  "frs": [[0, 18, "Chaque année, une grande partie de la forêt brûle."]]
},
```

### Bulles d'aide (elles apparaissent sur la vidéo pendant la lecture)
```js
"bulles": [ {"id":"p1", "start":5, "end":12, "title":"Écoute le nombre", "text":"Tu vas entendre…", "action":"Je l’ai repéré."} ],
```

### Transcription complète (un texte par langue ; un retour à la ligne s'écrit `\n`)
```js
"transcription": { "fr": "Journaliste\nChaque année…", "ar": "كل عام…" },
```

### Les étapes
Toutes les étapes ont la même base :
```js
{
  "type": "reponse",            // reponse | qcm | associer | phrase | bilan
  "debut": 0, "fin": 18,        // le passage utile (la vidéo s'arrête à "fin")
  "badge": "Je repère", "titreCourt": "Le chiffre important",
  "titre": "Étape 1 – Je repère l’information principale",
  "sousTitre": "Je cherche seulement une information importante.",
  "consigne": "Regarde le début de la vidéo et complète l’information.",
  "consigneTraduite": { "ar": "…", "tr": "…" },
  "aide": { "objectif": "…", "question": "…", "indice": "…" },
  "pourReussir": "Cherche seulement le nombre et l’unité.",
  "bravo": "Réponse validée : …",          // message si c'est juste
  "encore": "Regarde encore le début…"     // message si ce n'est pas encore juste
  // + les champs propres au type (voir ci-dessous)
}
```

Vous pouvez mettre **autant d'étapes que vous voulez**, dans n'importe quel ordre. Le même type peut revenir plusieurs fois.

**`reponse`** : l'élève écrit une réponse courte.
```js
"etiquette": "Chaque année, plus de...", "exemple": "Écris la surface en km²",
"reponsesAcceptees": ["20000", "20 000"],      // une seule suffit (sans tenir compte des accents ni des majuscules)
"pourLaTrace": "J’ai repéré que chaque année, plus de {reponse} de forêt brûlent."
```

**`qcm`** : une question avec une seule bonne réponse.
```js
"question": "Quelle est la principale cause ?",
"choix": ["Le tourisme", "L’élevage bovin", "La pêche"],
"bonneReponse": 1                               // numérotation à partir de 0 : ici « L’élevage bovin »
```

**`associer`** : relier des éléments (les propositions sont mélangées automatiquement).
```js
"paires": [ {"gauche":"Grands fermiers", "droite":"Ils brûlent la forêt pour le soja."},
            {"gauche":"Forestiers", "droite":"Ils cherchent des bois précieux."} ]
```

**`phrase`** : banque de mots, modèle de phrase guidé, puis phrase libre.
```js
"banqueDeMots": ["forêt", "soja", "élevage", "commerce"], "motsMinimum": 3,
"modele": {
  "morceaux": [ {"nom":"Cause", "choix":["la culture du soja","l’élevage bovin"]},
                {"nom":"Action", "choix":["on brûle la forêt","on coupe des arbres"]} ],
  "gabarit": "À cause de {Cause}, {Action}."      // {Nom} = le choix de l'élève
},
"verification": {
  "longueurMinimum": 7,                          // nombre de mots minimum
  "doitContenirUnMotDeChaqueGroupe": [ ["soja","elevage","bois"], ["foret","brule","coupe"] ]
}
```
Les mots de vérification s'écrivent sans accents. Un début de mot suffit : `"coupe"` reconnaît aussi « coupent ».

**`bilan`** : un choix par ligne, puis une trace rédigée automatiquement.
```js
"lignes": [ {"nom":"Cause", "consigne":"Je choisis une cause", "choix":["…","…"]},
            {"nom":"Idée",  "consigne":"Je choisis l’idée que je retiens", "choix":["…","…"]} ],
"gabarit": "J’ai compris que {Idée}. Dans la vidéo, {Cause} explique…"
```

### Autoévaluation, lexique et éclairage enseignant
```js
"autoevaluation": ["Je sais prélever une information chiffrée.", "Je sais identifier des acteurs."],
"lexique": [
  {"mot":"Déforestation", "categorie":"notion", "definition":"Disparition d’une forêt.",
   "traductions": {"ar": {"mot":"إزالة الغابات", "definition":"…"}, "tr": {"mot":"Ormansızlaşma", "definition":"…"}}}
],
"eclairage": {
  "intro": "Cette ressource vise…",
  "cartes": [["Attention", "Vidéo stabilisée", "La vidéo reste visible…"]],
  "paragraphes": [["Intention générale", "L’application vise…"]]
}
```
Une rubrique dont vous n'avez pas besoin peut rester vide (`[]` ou `{}`). Le bouton ou la section correspondante disparaît alors.

---

## Ce que fait le moteur, sans réglage de votre part
- Le passage utile s'arrête automatiquement, ce qui évite à l'élève une double tâche.
- Les aides sont proposées à la demande : objectif, question, indice, consigne traduite, sous-titres, bulles, transcription et lexique.
- La progression est sauvegardée dans le navigateur de l'élève : il retrouve ses réponses s'il recharge la page. Le bouton « Recommencer le parcours » efface ces réponses.
- La trace finale ne se débloque qu'après validation de toutes les étapes. Elle se copie, s'imprime ou s'enregistre en PDF (l'impression ne contient que la trace).
- L'affichage s'adapte aux téléphones : la vidéo passe au-dessus de l'activité.
- La page fonctionne en local (double-clic sur `index.html`) comme sur GitHub Pages.

## Publier plusieurs parcours sur GitHub Pages
Placez chaque parcours dans son propre dossier du dépôt :
```
mon-depot/
  amazonie/   index.html  contenu.js  video.mp4
  lagos/      index.html  contenu.js  video.mp4
```
Chaque parcours a alors sa propre adresse, par exemple `https://<compte>.github.io/mon-depot/lagos/`.
