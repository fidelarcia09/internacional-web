/* Gamers Gold Top-Up — sistema global de idiomas */
(() => {
  "use strict";
  const LANGS = [
    ["es","Español"],["en","English"],["pt","Português"],["fr","Français"],["de","Deutsch"],
    ["it","Italiano"],["ru","Русский"],["zh-CN","中文"],["ja","日本語"],["ar","العربية"]
  ];
  const STORE_KEY = "gg_language";
  const current = () => localStorage.getItem(STORE_KEY) || "es";
  const originals = new WeakMap();
  const lastTranslated = new WeakMap();
  let observer = null, busy = false, timer = 0, pendingNodes = [];
  const skip = "script,style,noscript,svg,code,pre,textarea,input,[contenteditable=true],[data-no-translate],.profile,.user-id,.balance,.avatar,.order-code,.player-id,.private-data";
  const cacheKey = (lang, value) => "ggtr:" + lang + ":" + value;
  const remember = node => { if (!originals.has(node)) originals.set(node, node.nodeValue); return originals.get(node); };
  const eligible = node => {
    if (!node || !node.nodeValue || !node.nodeValue.trim() || !node.parentElement) return false;
    if (node.parentElement.closest(skip)) return false;
    const value = node.nodeValue.trim();
    return value.length > 1 && !/^[\d\s.,:%$€£¥₽+\-_/()#]+$/.test(value);
  };
  async function requestTranslation(value, lang) {
    const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl="+encodeURIComponent(lang)+"&dt=t&q="+encodeURIComponent(value);
    for (let attempt=0;attempt<2;attempt++) {
      try {
        const response = await fetch(url, {cache:"no-store"});
        if (!response.ok) continue;
        const data = await response.json();
        const result = (data[0] || []).map(part => part[0] || "").join("").trim();
        if (result) return result;
      } catch (_) { /* Reintenta una vez antes de conservar el original. */ }
    }
    return null;
  }
  async function translateBatch(values, lang) {
    const missing = [...new Set(values)].filter(v => localStorage.getItem(cacheKey(lang,v)) === null);
    for (let i=0;i<missing.length;i+=5) {
      const chunk = missing.slice(i,i+5);
      const marker = " ⟪GGSEP⟫ ";
      let pieces = [];
      try {
        const joined = chunk.join(marker);
        const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl="+encodeURIComponent(lang)+"&dt=t&q="+encodeURIComponent(joined);
        const response = await fetch(url, {cache:"no-store"});
        if (!response.ok) throw new Error("translation unavailable");
        const data = await response.json();
        const translated = (data[0] || []).map(part => part[0] || "").join("");
        pieces = translated.split(marker);
        if (pieces.length !== chunk.length || pieces.some(value=>!value.trim())) pieces = [];
      } catch (_) { pieces = []; }
      if (pieces.length === chunk.length) {
        chunk.forEach((value,index)=>localStorage.setItem(cacheKey(lang,value),pieces[index].trim()));
      } else {
        for (const value of chunk) {
          const result = await requestTranslation(value,lang);
          if (result !== null) { try { localStorage.setItem(cacheKey(lang,value),result); } catch (_) {} }
        }
      }
    }
    return values.map(value => localStorage.getItem(cacheKey(lang,value)) || value);
  }
  async function translateNodes(nodes, lang) {
    if (lang === "es" || !nodes.length) return;
    if (busy) { pendingNodes.push(...nodes); return; }
    busy = true;
    const valid = nodes.filter(eligible);
    const originalsForNodes = valid.map(node=>{if(lastTranslated.has(node)&&node.nodeValue!==lastTranslated.get(node))originals.set(node,node.nodeValue);return remember(node);});
    const values = originalsForNodes.map(v=>v.trim());
    const translated = await translateBatch(values,lang);
    if (current() === lang) {
      if (observer) observer.disconnect();
      valid.forEach((node,i)=>{
        const original = originalsForNodes[i];
        const leading = original.match(/^\s*/)?.[0] || "";
        const trailing = original.match(/\s*$/)?.[0] || "";
        node.nodeValue = leading + translated[i] + trailing;
        lastTranslated.set(node,node.nodeValue);
      });
      if (observer) observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title"]});
    }
    busy = false;
    if (pendingNodes.length) { const queued = pendingNodes.splice(0); translateNodes(queued, current()); }
  }
  function collect(root=document.body) {
    if (!root) return [];
    const nodes=[];
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()) if(eligible(walker.currentNode)) nodes.push(walker.currentNode);
    return nodes;
  }
  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    if (lang === "ar") document.documentElement.dir = "rtl";
    else document.documentElement.dir = "ltr";
    if (lang === "es") {
      if (observer) observer.disconnect();
      document.querySelectorAll("[data-gg-placeholder],[data-gg-aria-label],[data-gg-title]").forEach(el=>["placeholder","aria-label","title"].forEach(attr=>{const key="data-gg-"+attr;if(el.hasAttribute(key))el.setAttribute(attr,el.getAttribute(key));}));
      const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      while(walker.nextNode()){const n=walker.currentNode;if(originals.has(n)){n.nodeValue=originals.get(n);lastTranslated.delete(n);}}
      const titleNode=document.querySelector("title")?.firstChild;
      if(titleNode&&originals.has(titleNode)){titleNode.nodeValue=originals.get(titleNode);lastTranslated.delete(titleNode);}
      if (observer) observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title"]});
      return;
    }
    translateNodes(collect(),lang);
    const title = document.querySelector("title");
    if (title) translateNodes([title.firstChild].filter(Boolean),lang);
    translateAttributes(document.body,lang);
  }
  function translateAttributes(root,lang) {
    if (!root || lang === "es") return;
    const selector = "[placeholder],[aria-label],[title]";
    const elements = [];
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(selector)) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll(selector));
    elements.forEach(el=>{
      if (el.closest(skip)) return;
      ["placeholder","aria-label","title"].forEach(attr=>{
        if(!el.hasAttribute(attr)) return;
        const key="data-gg-"+attr;
        if(!el.hasAttribute(key))el.setAttribute(key,el.getAttribute(attr));
        const original=el.getAttribute(key);
        if(original) translateAttribute(el,attr,original,lang);
      });
    });
  }
  async function translateAttribute(el,attr,value,lang){
    const result=(await translateBatch([value],lang))[0];
    if(current()===lang && el.isConnected && el.getAttribute(attr)!==result)el.setAttribute(attr,result);
  }
  function openPicker() {
    if(document.getElementById("ggLanguageModal")) return;
    const modal=document.createElement("div");
    modal.id="ggLanguageModal";
    modal.innerHTML = '<div class="gg-language-backdrop" data-close-language></div><section class="gg-language-dialog" role="dialog" aria-modal="true" aria-labelledby="gg-language-title"><button class="gg-language-close" type="button" aria-label="Close" data-close-language>×</button><h2 id="gg-language-title">Idioma de la plataforma</h2><div class="gg-language-options"></div><button class="gg-language-save" type="button">Guardar idioma</button></section>';
    const style=document.createElement("style");
    style.textContent='#ggLanguageModal{position:fixed;inset:0;z-index:20000;display:grid;place-items:center;padding:18px;font-family:Inter,Arial,sans-serif}.gg-language-backdrop{position:absolute;inset:0;background:#020713d9;backdrop-filter:blur(8px)}.gg-language-dialog{position:relative;width:min(100%,430px);max-height:min(88vh,720px);overflow:auto;padding:25px 20px 20px;border:1px solid #00c6ff88;border-radius:22px;background:linear-gradient(145deg,#0d2342,#081a35 68%,#050b18);box-shadow:0 18px 65px #000b,0 0 30px #00c6ff18;color:#f5f4f1}.gg-language-close{position:absolute;right:13px;top:10px;width:34px;height:34px;border:1px solid #ffffff22;border-radius:10px;background:#ffffff09;color:#f5f4f1;font-size:23px;cursor:pointer}.gg-language-kicker{margin:0 0 8px;color:#00c6ff;font-size:9px;font-weight:800;letter-spacing:2px}.gg-language-dialog h2{margin:0 38px 8px 0;font-size:23px}.gg-language-description,.gg-language-note{color:#92949c;font-size:12px;line-height:1.6}.gg-language-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:19px 0}.gg-language-option{display:flex;align-items:center;gap:9px;min-height:47px;padding:9px 11px;border:1px solid #ffffff20;border-radius:12px;background:#ffffff08;color:#f5f4f1;font-size:13px;cursor:pointer}.gg-language-option:has(input:checked){border-color:#00c6ff;background:#00c6ff16;box-shadow:inset 0 0 12px #00c6ff0c}.gg-language-option input{accent-color:#00c6ff}.gg-language-save{width:100%;min-height:47px;border:1px solid #35dfff;border-radius:12px;background:linear-gradient(100deg,#007bff,#00c6ff);color:#041326;font-weight:900;font-size:14px;cursor:pointer}.gg-language-note{margin:12px 0 0;text-align:center}@media(max-width:360px){.gg-language-options{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){#ggLanguageModal *{transition:none!important}}';
    document.head.appendChild(style);
    const options=modal.querySelector(".gg-language-options");
    LANGS.forEach(([code,label])=>{
      const row=document.createElement("label");row.className="gg-language-option";
      const radio=document.createElement("input");radio.type="radio";radio.name="gg-language";radio.value=code;radio.checked=current()===code;
      const text=document.createElement("span");text.textContent=label;
      row.append(radio,text);options.append(row);
    });
    const close=()=>modal.remove();
    modal.querySelectorAll("[data-close-language]").forEach(el=>el.addEventListener("click",close));
    modal.querySelector(".gg-language-save").addEventListener("click",()=>{
      const chosen=modal.querySelector('input[name="gg-language"]:checked')?.value || "es";
      localStorage.setItem(STORE_KEY,chosen);close();applyLanguage(chosen);
    });
    document.body.appendChild(modal);
    translateNodes(collect(modal),current());
  }
  document.addEventListener("click",event=>{
    const trigger=event.target.closest("[data-open-language]");
    if(trigger){event.preventDefault();openPicker();}
  });
  function start(){
    const lang=current();
    applyLanguage(lang);
    observer=new MutationObserver(records=>{
      if(current()==="es")return;
      const added=[];
      records.forEach(record=>{
        if(record.type==="characterData") added.push(record.target);
        if(record.type==="attributes") {
          const attr=record.attributeName, el=record.target, key="data-gg-"+attr;
          if(el.hasAttribute(attr) && !el.hasAttribute(key)) el.setAttribute(key,el.getAttribute(attr));
          const original=el.getAttribute(key);
          if(original && !el.closest(skip)) translateAttribute(el,attr,original,current());
        }
        record.addedNodes.forEach(node=>{
          if(node.nodeType===Node.TEXT_NODE) added.push(node);
          else if(node.nodeType===Node.ELEMENT_NODE) {
            added.push(...collect(node));
            translateAttributes(node,current());
          }
        });
      });
      clearTimeout(timer);timer=setTimeout(()=>translateNodes(added, current()),100);
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","aria-label","title"]});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
  window.GGLanguage={get:current,set:lang=>{if(LANGS.some(x=>x[0]===lang)){localStorage.setItem(STORE_KEY,lang);applyLanguage(lang);}},open:openPicker,languages:LANGS};
})();