# Parcours vidéo accompagné : mode d'emploi

Cet outil sert à créer, **sans écrire de code**, un parcours élève guidé autour de **n'importe quelle vidéo** : YouTube, ou fichier MP4. Chaque parcours comprend des étapes avec passage utile, des aides à la demande, des sous-titres et des consignes traduites, un lexique, une trace finale et une autoévaluation.

## Les deux pages

| Page | Pour qui | Adresse |
|---|---|---|
| **`editeur.html`** | l'enseignant | `…/modele/editeur.html` |
| **`index.html`** | les élèves | `…/modele/?parcours=nom-du-parcours` |

Un seul lecteur sert à tous les parcours. Chaque parcours est un petit fichier rangé dans `parcours/` :

```
modele/
  index.html          ← lecteur élève (ne pas modifier)
  editeur.html        ← éditeur enseignant (ne pas modifier)
  lecteur-video.js    ← (ne pas modifier)
  parcours/
    amazonie.js       ← un parcours = un fichier
    volcans.js
  videos/             ← seulement si la vidéo est un fichier MP4 (pas pour YouTube)
```

## Créer un parcours

1. Ouvrez **`editeur.html`**.
2. **Vidéo** : collez un lien YouTube et cliquez sur « Charger ce lien », ou choisissez un fichier MP4 sur l'ordinateur.
3. Remplissez les rubriques : informations générales, langues d'appui, sous-titres, bulles, étapes, autoévaluation, lexique.
   - Pour chaque temps, mettez la vidéo en pause au bon moment, puis cliquez sur **⏱ ici** à côté du champ.
   - Cinq types d'étapes sont proposés : réponse courte, QCM, association, construction de phrase, bilan guidé. Vous pouvez en ajouter autant que vous voulez.
4. Cliquez sur **Vérifier** : l'éditeur signale ce qui manque (temps qui dépassent la durée de la vidéo, consignes vides, etc.).
5. Cliquez sur **Aperçu élève** pour tester le parcours comme un élève.
6. Cliquez sur **Enregistrer le parcours** : un fichier `nom.js` est téléchargé.

Le brouillon est enregistré automatiquement dans le navigateur. Vous pouvez fermer la page et reprendre plus tard.

## Mettre en ligne (GitHub)

1. Dans le dépôt, ouvrez le dossier `modele/parcours/`, cliquez sur **Add file → Upload files**, déposez `nom.js`, puis cliquez sur **Commit changes**.
2. *Si la vidéo est un fichier MP4* : déposez-la de la même façon dans `modele/videos/`, sous le nom indiqué par l'éditeur. GitHub refuse les fichiers de plus de 100 Mo ; pour une longue vidéo, préférez YouTube (en vidéo « non répertoriée » si besoin).
3. Après une à deux minutes, le lien élève est `https://<compte>.github.io/<dépôt>/modele/?parcours=nom`.

## Modifier un parcours existant

Dans l'éditeur, cliquez sur **Ouvrir un fichier parcours** et choisissez le fichier `.js` (téléchargez-le d'abord depuis GitHub si besoin). Corrigez, enregistrez, puis déposez la nouvelle version dans `parcours/` : elle remplace l'ancienne.

## Gagner du temps avec une IA

Bouton **✨ Préparer avec une IA** :
1. Saisissez d'abord le titre, le public, les langues et la transcription.
2. Copiez la consigne proposée et collez-la dans Claude.
3. Collez la réponse de l'IA dans l'éditeur, puis cliquez sur **Importer**.

Vous obtenez un brouillon complet (étapes, traductions, lexique). Relisez-le et ajustez-le, en particulier les temps, avec ⏱.

## Bon à savoir

- Les réponses des élèves sont gardées dans leur navigateur : s'ils rechargent la page, ils retrouvent leur travail.
- Les vidéos YouTube ne fonctionnent qu'en ligne (sur GitHub Pages), pas en ouvrant le fichier par double-clic sur l'ordinateur.
- L'exemple `amazonie.js` reprend l'appli d'origine. L'éditeur y signale un décalage : certains temps vont au-delà de la fin de la vidéo (1:35 pour une vidéo de 1:14).
