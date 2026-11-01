/* ================================================================
   Serveur relais « Assistant FLSco » pour les applis Je comprends…
   - garde la clé Albert API secrète (variable d'environnement)
   - applique la consigne pédagogique (l'IA accompagne, ne fait pas à la place)
   - limite l'usage (par élève/appareil et par jour) et n'enregistre aucun contenu
   Node 18+ — aucune dépendance à installer.
   ================================================================ */
"use strict";
const http = require("http");

const CFG = {
  port: +process.env.PORT || 10000,
  cle: process.env.ALBERT_API_KEY || "",
  base: (process.env.ALBERT_BASE_URL || "https://albert.api.etalab.gouv.fr/v1").replace(/\/$/, ""),
  modele: process.env.ALBERT_MODEL || "",                 // vide = choisi automatiquement
  modeleVision: process.env.ALBERT_MODEL_VISION || "",    // vide = choisi automatiquement s'il existe
  origines: (process.env.ALLOWED_ORIGINS || "https://blaisepascalforbach.github.io").split(",").map(s => s.trim()).filter(Boolean),
  codeClasse: (process.env.CODE_CLASSE || "").trim(),     // facultatif : code à donner aux élèves
  parMinute: +process.env.LIMITE_PAR_MINUTE || 6,
  parJourAppareil: +process.env.LIMITE_PAR_JOUR_ELEVE || 60,
  parJourTotal: +process.env.LIMITE_PAR_JOUR_TOTAL || 3000,
  maxTokens: +process.env.MAX_TOKENS || 450
};

/* ---------- Choix des modèles (via GET /v1/models) ---------- */
let modeles = { texte: CFG.modele, vision: CFG.modeleVision, verifie: false };
async function choisirModeles() {
  if (!CFG.cle) return;
  try {
    const r = await fetch(CFG.base + "/models", { headers: { Authorization: "Bearer " + CFG.cle } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const liste = (await r.json()).data || [];
    const score = m => { const n = (m.id + " " + (m.aliases || []).join(" ")).toLowerCase(); return (/large|medium|mistral-small|gpt-oss/.test(n) ? 2 : 0) + (/small/.test(n) ? 1 : 0); };
    const txt = liste.filter(m => m.type === "text-generation").sort((a, b) => score(b) - score(a));
    const vis = liste.filter(m => m.type === "image-text-to-text");
    if (!modeles.texte && txt[0]) modeles.texte = txt[0].id;
    if (!modeles.vision && vis[0]) modeles.vision = vis[0].id;
    modeles.verifie = true;
    console.log("Modèles :", modeles.texte, "| vision :", modeles.vision || "aucun");
  } catch (e) { console.error("Liste des modèles indisponible :", e.message); }
}

/* ---------- Limites d'usage (en mémoire, rien n'est écrit sur disque) ---------- */
const compteurs = new Map(); let jour = new Date().toDateString(), totalJour = 0;
function autoriser(cleAppareil) {
  const maintenant = Date.now(), aujourdHui = new Date().toDateString();
  if (aujourdHui !== jour) { jour = aujourdHui; totalJour = 0; compteurs.clear(); }
  if (totalJour >= CFG.parJourTotal) return "L’assistant a beaucoup travaillé aujourd’hui. Il revient demain !";
  const c = compteurs.get(cleAppareil) || { jour: 0, recents: [] };
  c.recents = c.recents.filter(t => maintenant - t < 60000);
  if (c.recents.length >= CFG.parMinute) return "Doucement ! Attends une minute avant de reposer une question, et essaie de chercher un peu seul.";
  if (c.jour >= CFG.parJourAppareil) return "Tu as posé beaucoup de questions aujourd’hui. Continue seul ou demande à ton professeur.";
  c.recents.push(maintenant); c.jour++; totalJour++; compteurs.set(cleAppareil, c);
  return null;
}

/* ---------- Consigne pédagogique ---------- */
const NOMS_LANGUES = { fr: "français", ar: "arabe", tr: "turc", uk: "ukrainien", sq: "albanais", ka: "géorgien", en: "anglais", es: "espagnol", pt: "portugais", ru: "russe", ro: "roumain", it: "italien" };
const NIVEAUX = {
  A1: "A1 (débutant) : phrases très courtes (5 à 8 mots), mots très fréquents, présent de l’indicatif, une seule idée par phrase. Réponse de 50 mots maximum en français.",
  A2: "A2 : phrases courtes et simples, vocabulaire courant, connecteurs simples (et, mais, parce que). Réponse de 80 mots maximum en français.",
  B1: "B1 : phrases simples mais complètes, tu peux introduire un mot du vocabulaire de la discipline en l’expliquant. Réponse de 120 mots maximum."
};
function consigneSysteme(c) {
  const langue = NOMS_LANGUES[c.langue] || "français", niveau = NIVEAUX[c.niveau] || NIVEAUX.A2;
  const appui = c.langue && c.langue !== "fr"
    ? `La langue maternelle de l’élève est le ${langue}. Écris d’abord en français simple, puis ajoute une courte aide en ${langue} (une ou deux phrases, marquée « 🌐 »), surtout pour expliquer une consigne ou un mot. Ensuite, ramène toujours l’élève vers le français.`
    : "Écris uniquement en français simple.";
  return `Tu es « Mon assistant », un tuteur bienveillant de FLSco (français langue de scolarisation) pour des élèves allophones de collège et lycée, qui apprennent le français.
L’élève travaille dans une appli « ${c.app === "video" ? "Je comprends une vidéo" : c.app === "image" ? "Je comprends une image" : "Je comprends un texte"} » en 4 étapes : je découvre, je repère, je retiens, j’explique.

NIVEAU DE L’ÉLÈVE — ${niveau}
LANGUE — ${appui}

TON RÔLE : accompagner, jamais faire à la place.
- Ne donne jamais la réponse complète d’une étape et n’écris jamais le texte final de l’élève. Tu peux donner un indice, une question qui guide, un exemple sur un autre sujet, un début de phrase, ou expliquer un mot.
- Si l’élève demande la réponse, encourage-le et donne seulement le prochain petit pas.
- Pour vérifier une réponse : dis d’abord ce qui est réussi, puis UNE seule chose à améliorer, sous forme de question ou d’indice. Ne corrige pas tout.
- Explique les mots difficiles avec des mots simples, un exemple, et (si langue d’appui) la traduction.
- Appuie-toi sur le document et les réponses de l’élève fournis ci-dessous. Si tu ne vois pas le document (vidéo par exemple), dis-le simplement et pose une question à l’élève.
- Ne fais pas d’erreurs de français. Tutoie l’élève. Sois encourageant, jamais moqueur.
- Termine souvent par une petite question qui fait avancer l’élève.

SÉCURITÉ :
- Reste sur le travail scolaire. Si l’élève parle d’autre chose, ramène-le gentiment à son activité.
- Ne demande jamais d’informations personnelles (nom, adresse, téléphone, photos).
- Si l’élève exprime de la détresse, une situation de danger ou de violence, réponds avec douceur et conseille-lui d’en parler tout de suite à un adulte de confiance : son professeur, le CPE, l’infirmière scolaire ou ses parents.
- Pas de contenu inapproprié pour des mineurs.

FORMAT : texte simple, sans titres ni tableaux, avec au plus 3 puces courtes. Pas de mise en forme Markdown complexe.`;
}
function contexteDocument(c) {
  const lignes = [];
  if (c.titre) lignes.push(`Titre du document : ${c.titre}`);
  if (c.matiere) lignes.push(`Matière : ${c.matiere}`);
  if (c.etape) lignes.push(`Étape en cours : ${c.etape}`);
  if (c.consigne) lignes.push(`Consigne de l’étape : ${c.consigne}`);
  if (c.document) lignes.push(`DOCUMENT ÉTUDIÉ :\n"""\n${c.document}\n"""`);
  if (c.reponses) lignes.push(`CE QUE L’ÉLÈVE A DÉJÀ FAIT :\n${c.reponses}`);
  return lignes.join("\n\n");
}
const couper = (s, n) => String(s || "").slice(0, n);

/* ---------- Appel Albert ---------- */
async function appelerAlbert(corps) {
  const c = corps.contexte || {};
  const ctx = { app: couper(c.app, 10), niveau: couper(c.niveau, 3), langue: couper(c.langue, 4), titre: couper(c.titre, 200), matiere: couper(c.matiere, 80),
    etape: couper(c.etape, 120), consigne: couper(c.consigne, 600), document: couper(c.document, 7000), reponses: couper(c.reponses, 3000) };
  const histo = (Array.isArray(corps.messages) ? corps.messages : []).slice(-8)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: couper(m.content, 1200) }));
  if (!histo.length || histo[histo.length - 1].role !== "user") throw Object.assign(new Error("question manquante"), { code: 400 });

  const image = typeof corps.image === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(corps.image) && corps.image.length < 1_400_000 ? corps.image : null;
  const avecVision = image && modeles.vision;
  const messages = [{ role: "system", content: consigneSysteme(ctx) + "\n\n" + contexteDocument(ctx) }, ...histo];
  if (avecVision) {
    const der = messages[messages.length - 1];
    der.content = [{ type: "text", text: der.content }, { type: "image_url", image_url: { url: image } }];
  }
  const r = await fetch(CFG.base + "/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + CFG.cle, "Content-Type": "application/json" },
    body: JSON.stringify({ model: avecVision ? modeles.vision : modeles.texte, messages, temperature: 0.3, max_tokens: CFG.maxTokens, stream: false }),
    signal: AbortSignal.timeout(60000)
  });
  if (!r.ok) { const t = await r.text().catch(() => ""); throw Object.assign(new Error(`Albert ${r.status} ${t.slice(0, 200)}`), { code: 502 }); }
  const j = await r.json();
  return { reponse: (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || "").trim(), image_vue: !!avecVision };
}

/* ---------- Serveur HTTP ---------- */
function entetes(req) {
  const o = req.headers.origin || "";
  const ok = CFG.origines.includes("*") || CFG.origines.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
  return { _autorise: ok || !o, "Access-Control-Allow-Origin": ok ? o || "*" : CFG.origines[0], "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,X-Code-Classe,X-Appareil",
    "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
}
function repondre(res, h, code, obj) { const { _autorise, ...hh } = h; res.writeHead(code, hh); res.end(JSON.stringify(obj)); }

const serveur = http.createServer(async (req, res) => {
  const h = entetes(req), url = req.url.split("?")[0];
  if (req.method === "OPTIONS") { const { _autorise, ...hh } = h; res.writeHead(204, hh); return res.end(); }
  if (req.method === "GET" && (url === "/" || url === "/sante")) {
    if (!modeles.verifie) await choisirModeles();
    return repondre(res, h, 200, { ok: !!CFG.cle && !!modeles.texte, cle: !!CFG.cle, modele: modeles.texte || null, vision: !!modeles.vision, code_requis: !!CFG.codeClasse });
  }
  if (req.method !== "POST" || url !== "/assistant") return repondre(res, h, 404, { erreur: "introuvable" });

  if (!h._autorise) return repondre(res, h, 403, { erreur: "Site non autorisé." });
  if (!CFG.cle) return repondre(res, h, 503, { erreur: "La clé Albert n’est pas configurée sur le serveur." });
  if (CFG.codeClasse && (req.headers["x-code-classe"] || "").trim().toLowerCase() !== CFG.codeClasse.toLowerCase())
    return repondre(res, h, 401, { erreur: "code_classe", message: "Le code de la classe n’est pas bon. Demande-le à ton professeur." });

  let brut = ""; let trop = false;
  req.on("data", d => { brut += d; if (brut.length > 2_000_000) { trop = true; req.destroy(); } });
  req.on("end", async () => {
    if (trop) return;
    let corps; try { corps = JSON.parse(brut); } catch { return repondre(res, h, 400, { erreur: "Requête illisible." }); }
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const refus = autoriser(ip + "|" + couper(req.headers["x-appareil"], 40));
    if (refus) return repondre(res, h, 429, { erreur: "limite", message: refus });
    try {
      if (!modeles.texte) await choisirModeles();
      if (!modeles.texte) return repondre(res, h, 503, { erreur: "Aucun modèle Albert disponible (vérifie la clé)." });
      repondre(res, h, 200, await appelerAlbert(corps));
    } catch (e) {
      console.error("Erreur :", e.message);        // aucun contenu d'élève n'est journalisé
      repondre(res, h, e.code || 500, { erreur: e.code === 400 ? e.message : "L’assistant ne répond pas pour le moment. Réessaie dans un instant." });
    }
  });
});
serveur.listen(CFG.port, () => { console.log("Assistant prêt sur le port", CFG.port, "| origines :", CFG.origines.join(", ")); choisirModeles(); });
