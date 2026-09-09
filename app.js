const $=s=>document.querySelector(s);
const fileInput=$("#fileInput"), drop=$("#dropZone"), queue=$("#queue");
let files=[], generated=[];

const dictionaries={
food:["food","dish","cuisine","gourmet","delicious","fresh","meal","restaurant","recipe","culinary","ingredient","appetizing","homemade","premium","presentation","dining","flavor","tasty","kitchen","menu","lunch","dinner","dessert","snack","beverage","plate","serving","gastronomy","studio food","food photography"],
business:["business","office","corporate","professional","strategy","teamwork","success","marketing","finance","leadership","meeting","startup","management","career","workplace","planning","growth","communication","entrepreneurship","productivity","company","economy","investment","presentation","technology","workspace","professional concept"],
technology:["technology","digital","innovation","modern","computer","software","data","network","artificial intelligence","cybersecurity","internet","automation","device","electronics","future","digital transformation","cloud","interface","programming","engineering","smart","connection","system","online","communication","technology concept","high tech"],
nature:["nature","wildlife","landscape","outdoor","natural","environment","green","forest","animal","ecology","scenery","earth","travel","wilderness","habitat","conservation","sunlight","seasonal","beautiful","adventure","rural","fresh air","ecosystem","natural background","photography"],
travel:["travel","tourism","destination","vacation","adventure","journey","holiday","landscape","exploration","trip","nature","culture","beautiful","scenic","outdoor","destination concept","tourist","wanderlust","leisure","transportation","summer","weekend","getaway","travel photography","discover"],
fashion:["fashion","style","clothing","apparel","beauty","modern","trendy","elegant","lifestyle","designer","textile","outfit","accessory","shopping","luxury","portrait","creative","premium","seasonal","collection","retail","fashion concept","contemporary","glamour"],
product:["product","commercial","studio","isolated","minimal","clean","premium","professional","mockup","ecommerce","retail","shopping","catalog","marketplace","brand","object","design","presentation","modern","product photography","advertising","consumer","sale","display"],
background:["background","abstract","texture","minimal","clean","modern","gradient","pattern","design","wallpaper","backdrop","creative","decorative","premium","copy space","surface","light","shadow","composition","template","visual","graphic","presentation","digital background"],
abstract:["abstract","creative","modern","art","geometric","design","concept","visual","colorful","minimal","contemporary","composition","texture","shape","pattern","dynamic","digital art","background","aesthetic","creative concept","premium","graphic","decorative"],
seasonal:["seasonal","holiday","celebration","festive","event","decoration","creative","traditional","special occasion","celebration concept","premium","background","copy space","season","decorative","festival","lifestyle","culture","photography","design"]
};

const aliases={chocolate:"food",dessert:"food",cake:"food",pizza:"food",burger:"food",coffee:"food",icecream:"food",tiramisu:"food",fruit:"food",salad:"food",office:"business",finance:"business",laptop:"technology",phone:"technology",computer:"technology",ai:"technology",forest:"nature",animal:"nature",lion:"nature",zebra:"nature",beach:"travel",mountain:"travel",hotel:"travel",dress:"fashion",clothing:"fashion",shirt:"fashion",shoe:"fashion",bottle:"product",headphone:"product",luggage:"product",pattern:"background",gradient:"background",ramadan:"seasonal",halloween:"seasonal",christmas:"seasonal"};

function cleanName(name){
  return name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").replace(/\b\d{2,5}\b/g,"").replace(/\s+/g," ").trim();
}
function detectCategory(name){
  const n=name.toLowerCase();
  for(const k in aliases) if(n.includes(k)) return aliases[k];
  return "product";
}
function titleCase(s){return s.replace(/\b\w/g,c=>c.toUpperCase())}
function makeData(file){
  const base=cleanName(file.name)||"Premium Stock Image";
  const cat=$("#category").value==="auto"?detectCategory(base):$("#category").value;
  const count=Number($("#keywordCount").value), platform=$("#platform").value;
  const baseWords=base.toLowerCase().split(/\s+/).filter(w=>w.length>2&&!/^\d+$/.test(w));
  const extras=dictionaries[cat]||dictionaries.product;
  const keywords=[...baseWords,...extras];
  const seen=new Set(), kws=[];
  for(const k of keywords){const x=k.trim().toLowerCase();if(x&&!seen.has(x)){seen.add(x);kws.push(x)}}
  while(kws.length<count) kws.push(...extras.filter(x=>!seen.has(x)).slice(0,count-kws.length).map(x=>{seen.add(x);return x}));
  const clean=titleCase(base);
  const ai=$("#ai").checked;
  let desc=`High-quality ${cat} image featuring ${clean.toLowerCase()}, presented with a clean, professional and commercially versatile composition. Suitable for stock photography, advertising, editorial design and digital creative projects.`;
  if($("#commercial").checked) desc+=` Clear visual subject, polished presentation and useful copy space for commercial applications.`;
  if(ai) desc+=` AI-generated content.`;
  return {filename:file.name,title:clean,description:desc,keywords:kws.slice(0,count),category:cat,platform,ai};
}
function renderQueue(){
  queue.innerHTML=files.map(f=>`<span class="file-chip">${escapeHtml(f.name)}</span>`).join("");
  queue.classList.toggle("hidden",!files.length);
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function render(){
  $("#results").innerHTML=generated.map((x,i)=>`
  <article class="result-card">
    <div class="result-head"><h3>${escapeHtml(x.filename)}</h3><button class="copy" data-copy="${i}">Copy All</button></div>
    <div class="field"><label>TITLE</label><div class="box">${escapeHtml(x.title)}</div></div>
    <div class="field"><label>DESCRIPTION</label><div class="box">${escapeHtml(x.description)}</div></div>
    <div class="field"><label>KEYWORDS • ${x.keywords.length}</label><div class="box keywords">${x.keywords.map(k=>`<span class="kw">${escapeHtml(k)}</span>`).join("")}</div></div>
  </article>`).join("");
  $("#resultsSection").classList.remove("hidden");
}
function addFiles(list){files=[...files,...Array.from(list)];renderQueue()}
drop.addEventListener("click",e=>{if(e.target!==fileInput)fileInput.click()});
fileInput.addEventListener("change",()=>addFiles(fileInput.files));
["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("drag")}));
["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("drag")}));
drop.addEventListener("drop",e=>addFiles(e.dataTransfer.files));
$("#generateBtn").onclick=()=>{
  if(!files.length){alert("Please upload at least one image.");return}
  generated=files.map(makeData);render();
};
$("#copyAll").onclick=async()=>{
  const text=generated.map(x=>`FILE: ${x.filename}\nTITLE: ${x.title}\nDESCRIPTION: ${x.description}\nKEYWORDS: ${x.keywords.join(", ")}`).join("\n\n");
  await navigator.clipboard.writeText(text);$("#copyAll").textContent="Copied ✓";setTimeout(()=>$("#copyAll").textContent="Copy all",1200);
};
$("#results").addEventListener("click",async e=>{
  const b=e.target.closest("[data-copy]");if(!b)return;
  const x=generated[Number(b.dataset.copy)];
  await navigator.clipboard.writeText(`Title: ${x.title}\nDescription: ${x.description}\nKeywords: ${x.keywords.join(", ")}`);
  b.textContent="Copied ✓";setTimeout(()=>b.textContent="Copy All",1000);
});
$("#downloadCsv").onclick=()=>{
  const esc=v=>`"${String(v).replace(/"/g,'""')}"`;
  const rows=[["Filename","Title","Description","Keywords","Category","Platform","AI Generated"],...generated.map(x=>[x.filename,x.title,x.description,x.keywords.join(", "),x.category,x.platform,x.ai?"Yes":"No"])];
  const csv="\uFEFF"+rows.map(r=>r.map(esc).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="omur-desk-engine-metadata.csv";a.click();URL.revokeObjectURL(a.href);
};
$("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");$("#themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾"};
$("#year").textContent=new Date().getFullYear();
