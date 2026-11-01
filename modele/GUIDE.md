# Parcours vidéo accompagné : mode d'emploi

Cet outil sert à créer, **sans écrire de code**, un parcours élève guidé autour de **n'importe quelle vidéo** : YouTube, ou fichier MP4. Chaque parcours comprend des étapes avec passage utile, des aides à la demande, des sous-titres et des consignes traduites, un lexique, une trace finale et une autoévaluation.

## Trois façons de l’utiliser

| Page | Pour qui | Adresse |
|---|---|---|
| **`ma-video.html`** | l’élève, avec **n’importe quelle vidéo** | `…/modele/` |
| **`editeur.html`** | l’enseignant, pour préparer un parcours précis | `…/modele/editeur.html` |
| **`index.html?parcours=…`** | l’élève, sur un parcours préparé | `…/modele/?parcours=amazonie` |

### 1. L’élève choisit sa vidéo (aucune préparation)
L’élève colle un lien YouTube, un lien vers une vidéo MP4, ou choisit un fichier sur son ordinateur. L’appli le guide ensuite avec la même démarche, quelle que soit la vidéo :
1. **Je découvre** : type de vidéo, thème, qui, où, première phrase de compréhension.
2. **Je repère** : qui, quoi, où, quand, combien, pourquoi. Le bouton ⏱ garde le moment de la vidéo pour pouvoir le revoir.
3. **Je retiens** : son propre lexique (au moins 5 mots, avec leur sens, leur catégorie, le moment de la vidéo et un lien de traduction).
4. **J’explique** : un texte d’au moins 3 phrases, construit avec des débuts de phrase et ses mots.

Viennent ensuite le bilan, l’autoévaluation et la trace (copier, imprimer, télécharger). Les aides sont proposées à la demande : objectif, méthode, consigne traduite dans 10 langues, vitesse lente, retour de 5 secondes, sous-titres YouTube (bouton CC). Rien n’est envoyé sur internet, et le travail est gardé dans le navigateur.

**Astuce :** pour imposer une vidéo à la classe, donnez un lien de la forme
`…/modele/ma-video.html?video=LIEN_YOUTUBE&titre=Les volcans`
L’élève arrive directement sur la vidéo.

### Et pour une image : `ma-image.html` (niveaux A1 / A2 / B1)
Cette appli fonctionne sur le même principe, avec **n’importe quelle image** : photo, carte, affiche, tableau, dessin de presse, graphique, page de manuel prise en photo… L’élève choisit un fichier, colle un lien ou fait un copier-coller.
1. **Je découvre** : nature du document, titre, auteur, date, source, sujet, première impression.
2. **Je décris** : il clique sur l’image pour poser des **repères numérotés** (au moins 4), dit ce qu’il voit et où (premier plan, en haut à gauche…).
3. **Je retiens** : son lexique, relié aux repères.
4. **J’explique** : il décrit, interprète et dit l’intention de l’auteur, avec des débuts de phrase.

L’élève choisit son **niveau** (A1, A2 ou B1) : le nombre de repères, de mots et la longueur de l’explication s’adaptent, et des mots de liaison sont proposés en B1. Les consignes sont traduites en **arabe, turc, ukrainien, albanais et géorgien**.

Outils d’observation : **loupe**, **grille des zones** (le vocabulaire de localisation), affichage en grand. La trace s’imprime **avec l’image annotée**, et l’image annotée peut être téléchargée.
Lien direct pour la classe : `…/modele/ma-image.html?image=LIEN_DE_L_IMAGE&titre=…`


### Et pour un texte : `ma-texte.html` (niveaux A1 / A2 / B1)
L’élève **importe son texte** : fichier Word (.docx), PDF, LibreOffice (.odt), RTF, page web (.html), texte (.txt), **photo d’un texte** (les mots sont lus automatiquement), copier-coller ou glisser-déposer. Il choisit son niveau et sa langue d’appui (arabe, turc, ukrainien, albanais, géorgien).
- Mots cliquables : écouter, traduire, ajouter au lexique ; lecture à voix haute ; lecture ligne par ligne ; taille du texte réglable.
- Repérage : il sélectionne des mots dans le texte puis clique sur 📌.
- Exigences adaptées au niveau ; une phrase recopiée du texte est signalée.
- Trace téléchargeable pour **Word**, pour **LibreOffice**, en **.txt**, ou imprimable en PDF.

### 2. L’enseignant prépare un parcours précis (facultatif)
Il ajoute des questions propres à la vidéo, des réponses vérifiées, des sous-titres traduits et un lexique fourni. La suite de ce guide explique comment faire.

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

## Assistant IA « Mon assistant » (Albert)
Un bouton **🤖 Mon assistant** peut apparaître dans les trois applis élèves. L’assistant connaît l’appli, l’étape, le niveau, la langue maternelle, le document (texte, image) et ce que l’élève a déjà fait. Il explique la consigne et les mots, donne des indices et vérifie le travail, sans faire à la place de l’élève. Il répond en français simple, avec une aide en langue maternelle.

Mise en service : voir `serveur-assistant/README.md` (Render + clé Albert), puis indiquer l’adresse du serveur dans `modele/config-assistant.js`. Tant que cette adresse est vide, le bouton n’apparaît pas.
