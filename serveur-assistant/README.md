# Assistant IA (Albert) : mise en service sur Render

Ce petit serveur fait le lien entre les applis élèves (vidéo, image, texte) et **Albert API**. Il :
- **garde la clé Albert secrète** : elle n'apparaît jamais dans les pages publiques ;
- applique la **consigne pédagogique** : l'assistant explique, donne des indices et vérifie, mais ne fait pas le travail à la place de l'élève ; il adapte sa langue au niveau (A1, A2, B1) et ajoute une aide en langue maternelle ;
- **limite l'usage** : 6 questions par minute et 60 par jour et par élève, 3 000 par jour au total (réglable) ;
- n'accepte que les demandes venant de votre site GitHub Pages ;
- **n'enregistre aucun contenu d'élève**.

Il ne demande aucune installation : Node 18 ou plus suffit, sans dépendance.

## 1. Obtenir une clé Albert
Sur le Playground Albert (https://albert.playground.etalab.gouv.fr/keys), créez une clé API et gardez-la de côté.

## 2. Créer le service sur Render
**Méthode simple (Blueprint)**
1. Sur https://render.com, cliquez sur **New → Blueprint** et choisissez le dépôt `Comprendre-la-d-forestation-en-Amazonie`.
2. Render lit le fichier `render.yaml` et prépare le service `assistant-flsco`.
3. Renseignez **ALBERT_API_KEY**, la clé de l'étape 1. Renseignez aussi **CODE_CLASSE** si vous voulez un code d'accès (voir plus bas), sinon laissez la case vide.
4. Cliquez sur **Apply**. Après une à deux minutes, Render affiche l'adresse du service, par exemple `https://assistant-flsco.onrender.com`.

**Méthode manuelle (Web Service)**
Choisissez New → Web Service, puis le dépôt, avec les réglages suivants :
- *Root Directory* : `serveur-assistant` ;
- *Build Command* : `echo ok` ;
- *Start Command* : `node server.js` ;
- variables d'environnement : voir le tableau ci-dessous.

## 3. Brancher les applis
Dans le dépôt, ouvrez `modele/config-assistant.js` et collez l'adresse Render :
```js
window.ASSISTANT_URL = "https://assistant-flsco.onrender.com";
```
Enregistrez avec **Commit changes**. Une à deux minutes plus tard, le bouton **🤖 Mon assistant** apparaît dans les trois applis.

Pour vérifier que le serveur fonctionne, ouvrez `https://VOTRE-ADRESSE.onrender.com/sante`. La page doit afficher `"ok":true` et le nom du modèle utilisé.

## Variables d'environnement

| Variable | Rôle | Valeur par défaut |
|---|---|---|
| `ALBERT_API_KEY` | clé Albert (**obligatoire**, secrète) | — |
| `ALLOWED_ORIGINS` | sites autorisés, séparés par des virgules | `https://blaisepascalforbach.github.io` |
| `CODE_CLASSE` | code à donner aux élèves (facultatif, majuscules et minuscules indifférentes) | vide (pas de code) |
| `ALBERT_MODEL` | modèle de texte à utiliser | choisi automatiquement |
| `ALBERT_MODEL_VISION` | modèle qui « voit » les images (appli image) | choisi automatiquement s'il existe |
| `LIMITE_PAR_MINUTE` | questions par minute et par élève | 6 |
| `LIMITE_PAR_JOUR_ELEVE` | questions par jour et par élève | 60 |
| `LIMITE_PAR_JOUR_TOTAL` | questions par jour pour tout le monde | 3000 |
| `MAX_TOKENS` | longueur maximale des réponses | 450 |

## Bon à savoir
- **Mise en veille** : sur l'offre gratuite de Render, le serveur s'endort après 15 minutes sans activité. La première question met alors jusqu'à une minute (l'appli affiche « L'assistant se réveille… »). Pour éviter cette attente en classe, ouvrez l'adresse `/sante` quelques minutes avant le cours, ou passez à une offre payante.
- **Code de classe** : sans code, n'importe qui disposant du lien des applis peut utiliser votre quota Albert. Avec `CODE_CLASSE`, l'élève saisit le code une seule fois, puis son navigateur le garde en mémoire. Changez-le en cours d'année si besoin.
- **Données** : les questions et le document de l'élève sont transmis à Albert (hébergé par l'État) uniquement le temps de produire la réponse. Le serveur ne garde rien. Comme pour tout outil numérique, informez les familles et le référent RGPD de l'établissement.
