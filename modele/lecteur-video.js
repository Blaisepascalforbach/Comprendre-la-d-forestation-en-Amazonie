/* Lecteur vidéo commun (élève + éditeur) : fichier MP4/WebM ou YouTube.
   creerLecteur(conteneur, source, surTemps) -> { temps(), aller(t), lire(), pause(), duree() } */
(function(){
  function idYouTube(url){
    const m = String(url||"").match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
    return m ? m[1] : null;
  }
  let apiYT = null;
  function chargerApiYT(){
    if(apiYT) return apiYT;
    apiYT = new Promise(res=>{
      if(window.YT && window.YT.Player) return res(window.YT);
      const ancien = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = ()=>{ if(ancien) ancien(); res(window.YT); };
      const s=document.createElement("script"); s.src="https://www.youtube.com/iframe_api"; document.head.appendChild(s);
    });
    return apiYT;
  }
  window.idYouTube = idYouTube;
  window.creerLecteur = function(conteneur, source, surTemps){
    conteneur.innerHTML = "";
    const yt = idYouTube(source);
    if(yt){
      const div=document.createElement("div"); conteneur.appendChild(div);
      let p=null, pret=false, file=[];
      chargerApiYT().then(YT=>{
        p=new YT.Player(div,{videoId:yt,width:"100%",height:"100%",playerVars:{rel:0,modestbranding:1,playsinline:1,cc_load_policy:0},
          events:{onReady:()=>{pret=true; file.forEach(f=>f()); file=[];}}});
      });
      const quand = f => pret ? f() : file.push(f);
      setInterval(()=>{ if(pret && p.getCurrentTime) surTemps && surTemps(p.getCurrentTime()); }, 200);
      return {
        type:"youtube",
        temps:()=> pret ? p.getCurrentTime() : 0,
        duree:()=> pret ? p.getDuration() : 0,
        aller:(t,jouer)=>quand(()=>{ p.seekTo(t,true); if(jouer) p.playVideo(); }),
        lire:()=>quand(()=>p.playVideo()),
        pause:()=>quand(()=>p.pauseVideo())
      };
    }
    const v=document.createElement("video");
    v.controls=true; v.preload="metadata"; v.playsInline=true; v.src=source||"";
    v.textContent="Ton navigateur ne peut pas lire cette vidéo.";
    conteneur.appendChild(v);
    if(surTemps){ v.addEventListener("timeupdate",()=>surTemps(v.currentTime)); v.addEventListener("seeked",()=>surTemps(v.currentTime)); }
    return {
      type:"fichier", element:v,
      temps:()=>v.currentTime, duree:()=>v.duration||0,
      aller:(t,jouer)=>{ try{v.currentTime=t;}catch(e){} if(jouer) v.play().catch(()=>{}); },
      lire:()=>v.play().catch(()=>{}), pause:()=>v.pause()
    };
  };
  window.formatTemps = s => { s=Math.max(0,Math.round(+s||0)); return Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); };
  window.lireTemps = str => { str=String(str||"").trim().replace(",","."); if(!str) return 0;
    if(str.includes(":")){ const p=str.split(":").map(Number); return p.reduce((a,b)=>a*60+b,0); } return +str||0; };
})();
