const $=s=>document.querySelector(s);
const fileInput=$("#fileInput"), drop=$("#dropZone"), queue=$("#queue"), generateBtn=$("#generateBtn");
let files=[], generated=[];

const dictionaries={
 food:["food","dish","cuisine","gourmet","delicious","fresh","meal","restaurant","recipe","culinary","ingredient","appetizing","homemade","premium","presentation","dining","flavor","tasty","kitchen","menu","lunch","dinner","dessert","snack","beverage","plate","serving","gastronomy","food photography"],
 business:["business","office","corporate","professional","strategy","teamwork","success","marketing","finance","leadership","meeting","startup","management","career","workplace","planning","growth","communication","entrepreneurship","productivity","company","economy","investment","presentation","workspace","professional concept"],
 technology:["technology","digital","innovation","modern","computer","software","data","network","artificial intelligence","cybersecurity","internet","automation","device","electronics","future","digital transformation","cloud","interface","programming","engineering","smart","connection","system","online","technology concept","high tech"],
 nature:["nature","wildlife","landscape","outdoor","natural","environment","green","forest","animal","ecology","scenery","earth","travel","wilderness","habitat","conservation","sunlight","seasonal","adventure","rural","fresh air","ecosystem","natural background","nature photography"],
 travel:["travel","tourism","destination","vacation","adventure","journey","holiday","landscape","exploration","trip","nature","culture","scenic","outdoor","destination concept","tourist","wanderlust","leisure","transportation","summer","weekend","getaway","travel photography","discover"],
 fashion:["fashion","style","clothing","apparel","beauty","modern","trendy","elegant","lifestyle","designer","textile","outfit","accessory","shopping","luxury","portrait","creative","premium","seasonal","collection","retail","fashion concept","contemporary","glamour"],
 product:["product","commercial","studio","isolated","minimal","clean","premium","professional","mockup","ecommerce","retail","shopping","catalog","marketplace","brand","object","design","presentation","modern","product photography","advertising","consumer","display"],
 background:["background","abstract","texture","minimal","clean","modern","gradient","pattern","design","wallpaper","backdrop","creative","decorative","premium","copy space","surface","light","shadow","composition","template","visual","graphic","presentation","digital background"],
 abstract:["abstract","creative","modern","art","geometric","design","concept","visual","colorful","minimal","contemporary","composition","texture","shape","pattern","dynamic","digital art","background","aesthetic","creative concept","premium","graphic","decorative"],
 seasonal:["seasonal","holiday","celebration","festive","event","decoration","creative","traditional","special occasion","celebration concept","premium","background","copy space","season","decorative","festival","lifestyle","culture","photography","design"]
};
const aliases={chocolate:"food",dessert:"food",cake:"food",pizza:"food",burger:"food",coffee:"food",icecream:"food",tiramisu:"food",fruit:"food",salad:"food",office:"business",finance:"business",laptop:"technology",phone:"technology",computer:"technology",ai:"technology",forest:"nature",animal:"nature",lion:"nature",zebra:"nature",beach:"travel",mountain:"travel",hotel:"travel",dress:"fashion",clothing:"fashion",shirt:"fashion",shoe:"fashion",bottle:"product",headphone:"product",luggage:"product",pattern:"background",gradient:"background",ramadan:"seasonal",halloween:"seasonal",christmas:"seasonal",designer:"business",design:"business",portrait:"fashion"};

function cleanName(name){return name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").replace(/\b\d{2,5}\b/g,"").replace(/\s+/g," ").trim();}
function tokenize(s){return s.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2&&!/^\d+$/.test(w));}
function detectCategory(name){
 const n=name.toLowerCase();
 for(const k in aliases) if(n.includes(k)) return aliases[k];
 return "product";
}
function titleCase(s){return s.replace(/\b[a-z]/g,c=>c.toUpperCase());}
function unique(arr){const seen=new Set();return arr.filter(x=>{x=x.trim().toLowerCase();if(!x||seen.has(x))return false;seen.add(x);return true;});}
function humanBase(file,cat){
 const raw=cleanName(file.name), words=tokenize(raw);
 const meaningful=words.filter(w=>!["img","image","photo","pic","stock","final","copy","new","edited","design"].includes(w));
 if(meaningful.length) return meaningful.slice(0,7).join(" ");
 return cat==="food"?"food scene":cat==="business"?"business concept":cat==="technology"?"technology concept":cat==="nature"?"nature scene":cat==="travel"?"travel destination":cat==="fashion"?"fashion concept":cat==="background"?"abstract background":cat==="abstract"?"abstract composition":"product concept";
}
function makeTitle(base,cat,commercial){
 const presets={
 food:`${titleCase(base)} — Fresh Food and Culinary Concept`,
 business:`${titleCase(base)} — Professional Business and Workplace Concept`,
 technology:`${titleCase(base)} — Modern Technology and Digital Innovation Concept`,
 nature:`${titleCase(base)} — Natural Landscape and Environmental Concept`,
 travel:`${titleCase(base)} — Travel Destination and Adventure Concept`,
 fashion:`${titleCase(base)} — Modern Fashion and Lifestyle Concept`,
 product:`${titleCase(base)} — Premium Product and Commercial Concept`,
 background:`${titleCase(base)} — Minimal Modern Background with Copy Space`,
 abstract:`${titleCase(base)} — Modern Abstract Creative Composition`,
 seasonal:`${titleCase(base)} — Festive Seasonal Celebration Concept`
 };
 return presets[cat]||`${titleCase(base)} — Professional Creative Concept`;
}
function makeDescription(title,cat,commercial,ai){
 const lead={
 food:"A professionally styled food and culinary scene",
 business:"A professional business-focused visual",
 technology:"A modern technology and digital innovation visual",
 nature:"A natural outdoor scene",
 travel:"A scenic travel and destination visual",
 fashion:"A contemporary fashion and lifestyle visual",
 product:"A clean commercial product visual",
 background:"A minimal decorative background",
 abstract:"A modern abstract composition",
 seasonal:"A festive seasonal visual"
 }[cat]||"A professional stock visual";
 let d=`${lead} featuring ${title.split(" — ")[0].toLowerCase()}. The composition is clean, versatile and suitable for creative projects, advertising, marketing and digital content.`;
 if(commercial)d+=` Designed with commercial-friendly language and useful visual context.`;
 if(ai)d+=" AI-generated content.";
 return d;
}
function makeData(file){
 const selected=$("#category").value, cat=selected==="auto"?detectCategory(file.name):selected;
 const count=Number($("#keywordCount").value), platform=$("#platform").value, commercial=$("#commercial").checked, ai=$("#ai").checked;
 const base=humanBase(file,cat), title=makeTitle(base,cat,commercial);
 const subject=tokenize(base), extras=dictionaries[cat]||dictionaries.product;
 const contextual={
  food:["culinary","gourmet","fresh ingredients","meal","dining"],
  business:["professional","workplace","corporate","strategy","productivity"],
  technology:["digital","innovation","modern technology","software","automation"],
  nature:["outdoor","scenery","environment","natural","landscape"],
  travel:["destination","vacation","tourism","journey","adventure"],
  fashion:["style","apparel","lifestyle","elegant","contemporary"],
  product:["commercial","ecommerce","retail","advertising","catalog"],
  background:["copy space","minimal","texture","backdrop","wallpaper"],
  abstract:["geometric","composition","creative concept","visual","contemporary"],
  seasonal:["festive","celebration","holiday","decoration","special occasion"]
 }[cat]||[];
 const kws=unique([...subject,cat,...contextual,...extras]).slice(0,count);
 return {filename:file.name,title,description:makeDescription(title,cat,commercial,ai),keywords:kws,category:cat,platform,ai};
}
function renderQueue(){queue.innerHTML=files.map(f=>`<span class="file-chip">${escapeHtml(f.name)}</span>`).join("");queue.classList.toggle("hidden",!files.length);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function render(){
 $("#results").innerHTML=generated.map((x,i)=>`
 <article class="result-card">
  <div class="result-head"><div><span class="result-index">${String(i+1).padStart(2,"0")}</span><h3>${escapeHtml(x.filename)}</h3></div><button class="copy action-btn" data-copy="${i}">Copy Metadata <span>⧉</span></button></div>
  <div class="field"><label>TITLE <small>STOCK-READY</small></label><div class="box">${escapeHtml(x.title)}<button class="mini-copy" data-field="title" data-i="${i}">Copy</button></div></div>
  <div class="field"><label>DESCRIPTION <small>COMMERCIAL</small></label><div class="box">${escapeHtml(x.description)}<button class="mini-copy" data-field="description" data-i="${i}">Copy</button></div></div>
  <div class="field"><label>KEYWORDS • ${x.keywords.length}</label><div class="box keywords">${x.keywords.map(k=>`<span class="kw">${escapeHtml(k)}</span>`).join("")}</div></div>
 </article>`).join("");
 $("#resultsSection").classList.remove("hidden");
}
function feedback(btn,success="Done ✓"){const old=btn.innerHTML;btn.classList.add("is-success");btn.innerHTML=success;setTimeout(()=>{btn.classList.remove("is-success");btn.innerHTML=old},1200);}
function addFiles(list){files=[...files,...Array.from(list).filter(f=>f.type.startsWith("image/"))];renderQueue();}
drop.addEventListener("click",e=>{if(e.target!==fileInput)fileInput.click();});
fileInput.addEventListener("change",()=>addFiles(fileInput.files));
["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("drag");}));
["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("drag");}));
drop.addEventListener("drop",e=>addFiles(e.dataTransfer.files));

generateBtn.onclick=()=>{
 if(!files.length){drop.classList.add("shake");setTimeout(()=>drop.classList.remove("shake"),450);return;}
 generateBtn.classList.add("loading");generateBtn.disabled=true;
 const label=generateBtn.querySelector(".btn-label"); if(label) label.textContent="Analyzing & Generating";
 setTimeout(()=>{generated=files.map(makeData);render();generateBtn.classList.remove("loading");generateBtn.disabled=false;if(label)label.textContent="Generate Premium Metadata";document.querySelector(".results")?.scrollIntoView({behavior:"smooth",block:"start"});},650);
};
$("#copyAll").onclick=async()=>{if(!generated.length)return;const text=generated.map(x=>`FILE: ${x.filename}\nTITLE: ${x.title}\nDESCRIPTION: ${x.description}\nKEYWORDS: ${x.keywords.join(", ")}`).join("\n\n");await navigator.clipboard.writeText(text);feedback($("#copyAll"),"Copied ✓");};
$("#results").addEventListener("click",async e=>{
 const b=e.target.closest("[data-copy]"); if(b){const x=generated[Number(b.dataset.copy)];await navigator.clipboard.writeText(`Title: ${x.title}\nDescription: ${x.description}\nKeywords: ${x.keywords.join(", ")}`);feedback(b,"Copied ✓");return;}
 const m=e.target.closest(".mini-copy");if(m){const x=generated[Number(m.dataset.i)],text=x[m.dataset.field];await navigator.clipboard.writeText(text);feedback(m,"Copied ✓");}
});
$("#downloadCsv").onclick=()=>{const esc=v=>`"${String(v).replace(/"/g,'""')}"`;const rows=[["Filename","Title","Description","Keywords","Category","Platform","AI Generated"],...generated.map(x=>[x.filename,x.title,x.description,x.keywords.join(", "),x.category,x.platform,x.ai?"Yes":"No"])];const csv="\uFEFF"+rows.map(r=>r.map(esc).join(",")).join("\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="omur-desk-engine-premium-metadata.csv";a.click();URL.revokeObjectURL(a.href);feedback($("#downloadCsv"),"Downloaded ✓");};
$("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");$("#themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾";};
$("#year").textContent=new Date().getFullYear();
