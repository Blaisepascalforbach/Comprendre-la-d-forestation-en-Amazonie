/* ================================================================
   « Mon assistant » — tuteur IA (Albert) commun aux applis Je comprends…
   Chaque appli définit window.contexteAssistant() qui renvoie :
   { app, niveau, langue, titre, matiere, etape, consigne, document, reponses, image }
   Les échanges passent par le serveur relais (config-assistant.js) : la clé Albert n'est jamais dans la page.
   ================================================================ */
(function(){
  const q=new URLSearchParams(location.search);
  try{ if(q.get("assistant")) localStorage.setItem("assistant:url",q.get("assistant")); }catch(e){}
  let URL_SRV=(window.ASSISTANT_URL||"").trim(); try{ URL_SRV=localStorage.getItem("assistant:url")||URL_SRV; }catch(e){}
  URL_SRV=URL_SRV.replace(/\/$/,"");
  if(!URL_SRV) return;

  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const lsGet=(k,d)=>{ try{ return localStorage.getItem(k)??d; }catch(e){ return d; } }, lsSet=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  let appareil=lsGet("assistant:appareil",""); if(!appareil){ appareil=Math.random().toString(36).slice(2,12); lsSet("assistant:appareil",appareil); }

  const RACCOURCIS=[
    ["consigne","❓ Je ne comprends pas la consigne","Je ne comprends pas la consigne de cette étape. Tu peux me l’expliquer simplement ?"],
    ["mot","📖 Explique-moi un mot",null],
    ["indice","💡 Donne-moi un indice","Je bloque. Tu peux me donner un indice, sans me donner la réponse ?"],
    ["verifier","✅ Vérifie mon travail","Peux-tu regarder ce que j’ai déjà fait à cette étape et me dire ce qui est bien et ce que je peux améliorer ?"],
    ["phrase","✏️ Aide-moi à écrire une phrase","Aide-moi à commencer une phrase en français pour cette étape, sans l’écrire à ma place."]
  ];
  const TITRE_LANGUE={ar:"مساعدي",tr:"Asistanım",uk:"Мій помічник",sq:"Asistenti im",ka:"ჩემი ასისტენტი",en:"My assistant",es:"Mi asistente",pt:"O meu assistente",ru:"Мой помощник",ro:"Asistentul meu",it:"Il mio assistente"};

  /* ---------- Interface ---------- */
  const css=document.createElement("style");
  css.textContent=`
  .ia-bouton{position:fixed;right:18px;bottom:18px;z-index:60;border:0;border-radius:999px;padding:12px 18px;background:linear-gradient(135deg,#7c3aed,#1d4ed8);color:#fff;font-weight:900;font-size:.98rem;box-shadow:0 12px 28px -10px rgba(76,29,149,.7);cursor:pointer;font-family:inherit}
  .ia-bouton:hover{filter:brightness(1.08)}
  .ia-panneau{position:fixed;right:18px;bottom:18px;z-index:61;width:min(410px,calc(100vw - 24px));height:min(640px,calc(100vh - 36px));background:#fff;border:1px solid #ddd6fe;border-radius:20px;box-shadow:0 24px 60px -18px rgba(15,23,42,.55);display:flex;flex-direction:column;overflow:hidden;font-family:inherit}
  @media(max-width:560px){.ia-panneau{right:0;bottom:0;width:100vw;height:88vh;border-radius:18px 18px 0 0}}
  .ia-tete{background:linear-gradient(135deg,#4c1d95,#1e3a8a);color:#fff;padding:12px 14px;display:flex;align-items:center;gap:8px}
  .ia-tete b{font-size:1.02rem}.ia-tete small{display:block;opacity:.85;font-size:.76rem}
  .ia-tete button{margin-left:auto;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;border-radius:10px;padding:4px 9px;cursor:pointer;font-weight:800}
  .ia-fil{flex:1;overflow:auto;padding:12px;background:#faf7ff;display:flex;flex-direction:column;gap:8px}
  .ia-msg{max-width:88%;padding:9px 12px;border-radius:14px;line-height:1.45;font-size:.95rem;white-space:pre-wrap;word-wrap:break-word}
  .ia-msg.eleve{align-self:flex-end;background:#1d4ed8;color:#fff;border-bottom-right-radius:4px}
  .ia-msg.ia{align-self:flex-start;background:#fff;border:1px solid #e9e3fb;border-bottom-left-radius:4px}
  .ia-msg.info{align-self:center;background:#fffbeb;border:1px solid #fde68a;font-size:.85rem;max-width:95%}
  .ia-msg .ia-ecouter{display:inline-block;margin-top:6px;border:1px solid #ddd6fe;background:#f5f3ff;border-radius:8px;padding:2px 8px;font-size:.78rem;font-weight:800;cursor:pointer;color:#5b21b6}
  .ia-raccourcis{display:flex;flex-wrap:wrap;gap:6px;max-height:96px;overflow-y:auto;padding:8px 10px;border-top:1px solid #eee;background:#fff}
  .ia-raccourcis button{flex:none;border:1px solid #ddd6fe;background:#f5f3ff;color:#4c1d95;border-radius:999px;padding:6px 10px;font-weight:800;font-size:.8rem;cursor:pointer;font-family:inherit}
  .ia-saisie{display:flex;gap:6px;padding:10px;border-top:1px solid #eee;background:#fff}
  .ia-saisie textarea{flex:1;resize:none;height:46px;border:2px solid #ddd6fe;border-radius:12px;padding:8px 10px;font-family:inherit;font-size:.95rem}
  .ia-saisie textarea:focus{outline:none;border-color:#7c3aed}
  .ia-saisie button{border:0;border-radius:12px;background:#7c3aed;color:#fff;font-weight:900;padding:0 14px;cursor:pointer}
  .ia-saisie button:disabled{opacity:.5;cursor:wait}
  .ia-pied{font-size:.72rem;color:#64748b;padding:0 12px 8px;background:#fff}
  .ia-points span{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:#7c3aed;animation:ia-b 1s infinite}
  .ia-points span:nth-child(2){animation-delay:.15s}.ia-points span:nth-child(3){animation-delay:.3s}
  @keyframes ia-b{0%,80%,100%{opacity:.25}40%{opacity:1}}
  @media print{.ia-bouton,.ia-panneau{display:none!important}}`;
  document.head.appendChild(css);

  const bouton=document.createElement("button"); bouton.className="ia-bouton"; bouton.type="button"; bouton.innerHTML="🤖 Mon assistant";
  const panneau=document.createElement("div"); panneau.className="ia-panneau"; panneau.style.display="none"; panneau.setAttribute("role","dialog"); panneau.setAttribute("aria-label","Mon assistant");
  panneau.innerHTML=`<div class="ia-tete"><span style="font-size:1.5rem">🤖</span><div><b>Mon assistant</b><small id="iaSous">Je t’aide à chercher, je ne fais pas à ta place.</small></div>
      <button type="button" id="iaNouveau" title="Nouvelle conversation">↺</button><button type="button" id="iaFermer" title="Fermer" style="margin-left:4px">✕</button></div>
    <div class="ia-fil" id="iaFil" aria-live="polite"></div>
    <div class="ia-raccourcis" id="iaRacc">${RACCOURCIS.map(r=>`<button type="button" data-r="${r[0]}">${r[1]}</button>`).join("")}</div>
    <div class="ia-saisie"><textarea id="iaQuestion" placeholder="J’écris ma question…" aria-label="Ma question"></textarea><button type="button" id="iaEnvoyer" aria-label="Envoyer">➤</button></div>
    <div class="ia-pied">L’assistant peut se tromper. Je n’écris pas d’informations personnelles (nom, adresse…).</div>`;
  document.body.appendChild(bouton); document.body.appendChild(panneau);
  const $=id=>document.getElementById(id), fil=$("iaFil");

  /* ---------- Conversation (gardée le temps de la séance) ---------- */
  let messages=[], enCours=false, etatServeur=null, cleConv="";
  const ctx=()=>{ try{ return (window.contexteAssistant&&window.contexteAssistant())||{}; }catch(e){ return {}; } };
  function cleCourante(){ const c=ctx(); return "assistant:conv:"+(c.app||"")+":"+(c.titre||"")+":"+(c.etape||""); }
  function charger(){ cleConv=cleCourante(); try{ messages=JSON.parse(sessionStorage.getItem(cleConv)||"[]"); }catch(e){ messages=[]; } }
  function garder(){ try{ sessionStorage.setItem(cleConv,JSON.stringify(messages.slice(-20))); }catch(e){} }
  function afficherFil(){
    const c=ctx(); fil.innerHTML="";
    ajouterBulle("ia",`Bonjour ! Je suis ton assistant.${c.etape?" Tu travailles sur : « "+c.etape+" ».":""}\nTu peux me poser une question ou cliquer sur un bouton en bas. Je vais t’aider à trouver toi-même.`,false);
    messages.forEach(m=>ajouterBulle(m.role==="user"?"eleve":"ia",m.content,m.role!=="user"));
    $("iaSous").textContent=(TITRE_LANGUE[c.langue]?TITRE_LANGUE[c.langue]+" · ":"")+"Je t’aide à chercher, je ne fais pas à ta place.";
  }
  function ajouterBulle(type,txt,ecoute){
    const d=document.createElement("div"); d.className="ia-msg "+type; d.textContent=txt;
    if(type==="ia"&&ecoute&&"speechSynthesis" in window){ const b=document.createElement("button"); b.type="button"; b.className="ia-ecouter"; b.textContent="🔊 Écouter";
      b.onclick=()=>{ speechSynthesis.cancel(); const fr=txt.split(/\n?🌐/)[0]; const u=new SpeechSynthesisUtterance(fr); u.lang="fr-FR"; u.rate=.9; const v=speechSynthesis.getVoices().find(x=>/^fr/i.test(x.lang)); if(v) u.voice=v; speechSynthesis.speak(u); };
      d.appendChild(document.createElement("br")); d.appendChild(b); }
    fil.appendChild(d); fil.scrollTop=fil.scrollHeight; return d;
  }

  /* ---------- Réveil du serveur (Render gratuit s'endort après 15 min) ---------- */
  async function verifierServeur(){
    if(etatServeur&&etatServeur.ok) return true;
    const info=ajouterBulle("info","⏳ L’assistant se réveille… (cela peut prendre jusqu’à une minute la première fois)",false);
    try{ const r=await fetch(URL_SRV+"/sante",{signal:AbortSignal.timeout(75000)}); etatServeur=await r.json(); info.remove();
      if(!etatServeur.ok){ ajouterBulle("info","L’assistant n’est pas encore configuré. Préviens ton professeur.",false); return false; } return true; }
    catch(e){ info.textContent="L’assistant ne répond pas pour le moment. Réessaie dans un instant ou continue seul."; return false; }
  }

  /* ---------- Image réduite (appli image) ---------- */
  function imageReduite(src){ return new Promise(ok=>{ if(!src) return ok(null); const im=new Image(); im.crossOrigin="anonymous";
    im.onload=()=>{ try{ const k=Math.min(1,768/Math.max(im.naturalWidth,im.naturalHeight)); const c=document.createElement("canvas"); c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k);
      c.getContext("2d").drawImage(im,0,0,c.width,c.height); ok(c.toDataURL("image/jpeg",.8)); }catch(e){ ok(null); } }; im.onerror=()=>ok(null); im.src=src; }); }

  /* ---------- Envoi ---------- */
  async function envoyer(texte){
    texte=String(texte||"").trim(); if(!texte||enCours) return;
    if(cleCourante()!==cleConv){ charger(); afficherFil(); }
    if(!(await verifierServeur())) return;
    enCours=true; $("iaEnvoyer").disabled=true;
    messages.push({role:"user",content:texte}); ajouterBulle("eleve",texte,false); $("iaQuestion").value="";
    const attente=ajouterBulle("ia","",false); attente.innerHTML='<span class="ia-points"><span></span><span></span><span></span></span>';
    const c=ctx(); const image=etatServeur&&etatServeur.vision?await imageReduite(c.image):null;
    const corps={contexte:{app:c.app,niveau:c.niveau,langue:c.langue,titre:c.titre,matiere:c.matiere,etape:c.etape,consigne:c.consigne,document:c.document,reponses:c.reponses},messages:messages.slice(-8),image};
    try{
      const r=await fetch(URL_SRV+"/assistant",{method:"POST",headers:{"Content-Type":"application/json","X-Code-Classe":lsGet("assistant:code",""),"X-Appareil":appareil},body:JSON.stringify(corps),signal:AbortSignal.timeout(90000)});
      const j=await r.json().catch(()=>({}));
      attente.remove();
      if(r.status===401&&j.erreur==="code_classe"){
        messages.pop(); const code=prompt("Code de la classe (donné par ton professeur) :",""); if(code){ lsSet("assistant:code",code.trim()); enCours=false; $("iaEnvoyer").disabled=false; fil.lastChild&&fil.lastChild.remove(); return envoyer(texte); }
        ajouterBulle("info",j.message||"Il faut le code de la classe.",false);
      } else if(!r.ok){ messages.pop(); ajouterBulle("info",j.message||j.erreur||"L’assistant ne répond pas pour le moment.",false); }
      else { const rep=j.reponse||"Je n’ai pas compris. Peux-tu reformuler ta question ?"; messages.push({role:"assistant",content:rep}); ajouterBulle("ia",rep,true); garder(); }
    }catch(e){ attente.remove(); messages.pop(); ajouterBulle("info","La connexion a été coupée. Réessaie.",false); }
    enCours=false; $("iaEnvoyer").disabled=false;
  }

  /* ---------- Événements ---------- */
  let selectionMemo="";
  document.addEventListener("selectionchange",()=>{ const s=String(getSelection()).trim(); if(s&&s.length<80&&!panneau.contains(getSelection().anchorNode)) selectionMemo=s; });
  bouton.onclick=()=>{ panneau.style.display="flex"; bouton.style.display="none"; charger(); afficherFil(); verifierServeur().then(()=>{ fil.querySelectorAll(".ia-msg.info").forEach(x=>{ if(/réveille/.test(x.textContent)) x.remove(); }); }); setTimeout(()=>$("iaQuestion").focus(),50); };
  $("iaFermer").onclick=()=>{ panneau.style.display="none"; bouton.style.display=""; };
  $("iaNouveau").onclick=()=>{ messages=[]; garder(); afficherFil(); };
  $("iaEnvoyer").onclick=()=>envoyer($("iaQuestion").value);
  $("iaQuestion").addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); envoyer($("iaQuestion").value); } });
  $("iaRacc").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; const r=RACCOURCIS.find(x=>x[0]===b.dataset.r);
    if(r[0]==="mot"){ const m=selectionMemo||prompt("Quel mot veux-tu comprendre ?",""); selectionMemo=""; if(m) envoyer(`Explique-moi le mot « ${m} » simplement, avec un exemple.`); return; }
    envoyer(r[2]); });
  window.ouvrirAssistant=(question)=>{ bouton.onclick(); if(question) setTimeout(()=>envoyer(question),100); };

  /* Résumé générique des réponses d'une appli (objet -> lignes « clé : valeur ») */
  window.resumerReponses=function(obj){
    const L=[]; const ignorer=new Set(["bilan","auto","notes","src","t","x","y","rep","date"]);
    (function marche(o,pref){ if(o==null) return; if(Array.isArray(o)){ o.forEach((v,i)=>marche(v,pref+" "+(i+1))); return; }
      if(typeof o==="object"){ for(const[k,v] of Object.entries(o)) if(!ignorer.has(k)) marche(v,(pref?pref+" › ":"")+k); return; }
      const s=String(o).trim(); if(s) L.push(pref+" : "+s); })(obj,"");
    return L.join("\n").slice(0,3000);
  };
})();
