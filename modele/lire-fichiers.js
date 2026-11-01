/* Lecture de textes depuis différents formats de fichier, directement dans le navigateur.
   Rien n'est envoyé sur internet (sauf le téléchargement unique des outils PDF / photo, si on les utilise).
   lireFichierTexte(fichier, surProgres) -> Promise<string>
   Formats : .txt .md .csv | .html .htm | .rtf | .docx (Word) | .odt (LibreOffice/OpenOffice) | .pdf | images (photo d'un texte) */
(function(){
  const ext = f => (f.name.split(".").pop()||"").toLowerCase();
  const nettoyer = s => s.replace(/\r/g,"").replace(/[ \t ]+/g," ").replace(/ *\n */g,"\n").replace(/\n{3,}/g,"\n\n").trim();
  const lireComme = (f,mode) => new Promise((ok,ko)=>{ const r=new FileReader(); r.onload=()=>ok(r.result); r.onerror=()=>ko(new Error("lecture impossible")); r[mode](f); });
  function chargerScript(src){ return new Promise((ok,ko)=>{ const s=document.createElement("script"); s.src=src; s.onload=ok; s.onerror=()=>ko(new Error("outil indisponible (connexion internet nécessaire)")); document.head.appendChild(s); }); }

  /* --- Mini-lecteur ZIP (docx et odt sont des archives ZIP) --- */
  async function extraireZip(buffer, nom){
    const v=new DataView(buffer), u8=new Uint8Array(buffer);
    let fin=-1; for(let i=u8.length-22;i>=Math.max(0,u8.length-66000);i--){ if(v.getUint32(i,true)===0x06054b50){ fin=i; break; } }
    if(fin<0) throw new Error("fichier abîmé ou mauvais format");
    let p=v.getUint32(fin+16,true); const n=v.getUint16(fin+10,true), dec=new TextDecoder();
    for(let k=0;k<n;k++){
      if(v.getUint32(p,true)!==0x02014b50) break;
      const meth=v.getUint16(p+10,true), taille=v.getUint32(p+20,true), ln=v.getUint16(p+28,true), le=v.getUint16(p+30,true), lc=v.getUint16(p+32,true), off=v.getUint32(p+42,true);
      const fn=dec.decode(u8.subarray(p+46,p+46+ln));
      if(fn===nom){
        const d=off+30+v.getUint16(off+26,true)+v.getUint16(off+28,true), brut=u8.subarray(d,d+taille);
        if(meth===0) return dec.decode(brut);
        if(meth!==8) throw new Error("compression non prise en charge");
        if(!("DecompressionStream" in window)) throw new Error("navigateur trop ancien pour lire ce fichier");
        const flux=new Blob([brut]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
        return await new Response(flux).text();
      }
      p+=46+ln+le+lc;
    }
    throw new Error("contenu introuvable dans le fichier");
  }
  function texteDocx(xml){
    const doc=new DOMParser().parseFromString(xml,"application/xml"), out=[];
    for(const p of doc.getElementsByTagNameNS("*","p")){
      if(p.localName!=="p") continue;
      let t=""; const parcours=n=>{ for(const c of n.childNodes){ if(c.nodeType!==1) continue;
        if(c.localName==="t") t+=c.textContent; else if(c.localName==="tab") t+=" "; else if(c.localName==="br"||c.localName==="cr") t+="\n";
        else if(c.localName!=="p"&&c.localName!=="instrText"&&c.localName!=="delText") parcours(c); } };
      parcours(p); out.push(t);
    }
    return out.join("\n\n");
  }
  function texteOdt(xml){
    const doc=new DOMParser().parseFromString(xml,"application/xml"), out=[];
    const corps=doc.getElementsByTagNameNS("*","text")[0]||doc.documentElement;
    const bloc=n=>{ let t=""; for(const c of n.childNodes){ if(c.nodeType===3) t+=c.textContent; else if(c.nodeType===1){
      if(c.localName==="s") t+=" ".repeat(+c.getAttribute("text:c")||1); else if(c.localName==="tab") t+=" "; else if(c.localName==="line-break") t+="\n";
      else if(c.localName!=="note") t+=bloc(c); } } return t; };
    const marche=n=>{ for(const c of n.childNodes){ if(c.nodeType!==1) continue; if(c.localName==="p"||c.localName==="h") out.push(bloc(c)); else marche(c); } };
    marche(corps); return out.join("\n\n");
  }
  function texteHtml(html){
    const d=new DOMParser().parseFromString(html,"text/html");
    d.querySelectorAll("script,style,noscript,nav,header,footer,aside,form,iframe").forEach(x=>x.remove());
    const racine=d.querySelector("article,main")||d.body;
    racine.querySelectorAll("p,h1,h2,h3,h4,h5,h6,li,div,br,tr").forEach(x=>x.append("\n\n"));
    return racine.textContent;
  }
  function texteRtf(rtf){
    let s=rtf.replace(/\\par[d]?\b/g,"\n").replace(/\\line\b/g,"\n").replace(/\\tab\b/g," ");
    s=s.replace(/\{\\\*[^{}]*(\{[^{}]*\}[^{}]*)*\}/g,"").replace(/\{\\(fonttbl|colortbl|stylesheet|info)[\s\S]*?\}\s*\}/g,"");
    s=s.replace(/\\'([0-9a-f]{2})/gi,(_,h)=>new TextDecoder("windows-1252").decode(new Uint8Array([parseInt(h,16)])));
    s=s.replace(/\\u(-?\d+)\??/g,(_,n)=>String.fromCharCode((+n+65536)%65536));
    return s.replace(/\\[a-z]+-?\d* ?/gi,"").replace(/\\([{}\\])/g,"$1").replace(/[{}]/g,"");
  }
  async function textePdf(f,progres){
    if(!window.pdfjsLib){ progres&&progres("Je prépare la lecture du PDF…"); await chargerScript("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js");
      pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js"; }
    const pdf=await pdfjsLib.getDocument({data:await lireComme(f,"readAsArrayBuffer")}).promise, pages=[];
    for(let i=1;i<=pdf.numPages;i++){ progres&&progres(`Je lis la page ${i} sur ${pdf.numPages}…`);
      const c=await (await pdf.getPage(i)).getTextContent(); let t="", y=null;
      for(const it of c.items){ const ny=it.transform[5]; if(y!==null&&Math.abs(ny-y)>(it.height||10)*1.6) t+="\n\n"; else if(y!==null&&Math.abs(ny-y)>1) t+=" "; t+=it.str; if(it.hasEOL) t+=" "; y=ny; }
      pages.push(t); }
    const txt=pages.join("\n\n"); if(txt.replace(/\s/g,"").length<20) throw new Error("ce PDF ne contient pas de texte (c’est peut-être une image scannée : enregistre la page comme image et utilise « Photo d’un texte »)");
    return txt;
  }
  async function texteImage(f,progres){
    if(!window.Tesseract){ progres&&progres("Je prépare la lecture de la photo (cela peut prendre un peu de temps la première fois)…"); await chargerScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"); }
    const r=await Tesseract.recognize(f,"fra",{logger:m=>{ if(m.status==="recognizing text"&&progres) progres(`Je lis la photo… ${Math.round(m.progress*100)} %`); }});
    return r.data.text.replace(/-\n(\p{Ll})/gu,"$1").replace(/([^\n])\n(?!\n)/g,"$1 ");
  }

  window.FORMATS_TEXTE=".txt,.md,.csv,.html,.htm,.rtf,.docx,.odt,.pdf,image/*";
  window.lireFichierTexte = async function(f,progres){
    const e=ext(f);
    if(f.type.startsWith("image/")||["jpg","jpeg","png","webp","heic","bmp","gif"].includes(e)) return nettoyer(await texteImage(f,progres));
    if(e==="docx") return nettoyer(texteDocx(await extraireZip(await lireComme(f,"readAsArrayBuffer"),"word/document.xml")));
    if(e==="odt") return nettoyer(texteOdt(await extraireZip(await lireComme(f,"readAsArrayBuffer"),"content.xml")));
    if(e==="pdf") return nettoyer(await textePdf(f,progres));
    if(e==="doc") throw new Error("l’ancien format Word (.doc) n’est pas lisible : dans Word, fais « Enregistrer sous » au format .docx");
    if(e==="pages") throw new Error("le format Pages n’est pas lisible : exporte le document en .docx ou en PDF");
    const brut=await lireComme(f,"readAsText");
    if(e==="html"||e==="htm"||/^\s*<(!doctype|html)/i.test(brut)) return nettoyer(texteHtml(brut));
    if(e==="rtf"||brut.startsWith("{\\rtf")) return nettoyer(texteRtf(brut));
    return nettoyer(brut);
  };
})();
