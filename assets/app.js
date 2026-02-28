const $ = (sel) => document.querySelector(sel);

function pad2(n){ return String(n).padStart(2,"0"); }
function toISODate(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function parseISODate(s){ const [y,m,dd] = s.split("-").map(Number); return new Date(y, m-1, dd); }
function fmtLong(d){ return d.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"short",day:"numeric"}); }
function isWeekend(d){ const w=d.getDay(); return w===0||w===6; }

function nthWeekdayOfMonth(year, monthIndex, weekday, n){
  const first=new Date(year,monthIndex,1);
  const firstW=first.getDay();
  const offset=(weekday-firstW+7)%7;
  const day=1+offset+(n-1)*7;
  return new Date(year,monthIndex,day);
}
function lastWeekdayOfMonth(year, monthIndex, weekday){
  const last=new Date(year,monthIndex+1,0);
  const lastW=last.getDay();
  const offset=(lastW-weekday+7)%7;
  const day=last.getDate()-offset;
  return new Date(year,monthIndex,day);
}
function observedFixedHoliday(date){
  const d=new Date(date.getTime());
  const w=d.getDay();
  if(w===6) return new Date(d.getFullYear(),d.getMonth(),d.getDate()-1);
  if(w===0) return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1);
  return d;
}
function usFederalHolidaysForYear(year){
  const H=[];
  H.push(observedFixedHoliday(new Date(year,0,1)));
  H.push(nthWeekdayOfMonth(year,0,1,3));
  H.push(nthWeekdayOfMonth(year,1,1,3));
  H.push(lastWeekdayOfMonth(year,4,1));
  H.push(observedFixedHoliday(new Date(year,5,19)));
  H.push(observedFixedHoliday(new Date(year,6,4)));
  H.push(nthWeekdayOfMonth(year,8,1,1));
  H.push(nthWeekdayOfMonth(year,9,1,2));
  H.push(observedFixedHoliday(new Date(year,10,11)));
  H.push(nthWeekdayOfMonth(year,10,4,4));
  H.push(observedFixedHoliday(new Date(year,11,25)));
  const seen=new Set();
  return H.filter(d=>{const k=toISODate(d); if(seen.has(k)) return false; seen.add(k); return true;});
}
function buildHolidaySet(yearFrom, yearTo){
  const set=new Set();
  for(let y=yearFrom;y<=yearTo;y++){
    for(const d of usFederalHolidaysForYear(y)) set.add(toISODate(d));
  }
  return set;
}
const NOW=new Date();
const HOLIDAYS=buildHolidaySet(NOW.getFullYear()-2, NOW.getFullYear()+8);

function isBusinessDay(d){
  if(isWeekend(d)) return false;
  return !HOLIDAYS.has(toISODate(d));
}
function addBusinessDays(date,n){
  let d=new Date(date.getTime());
  const step=n>=0?1:-1;
  let remaining=Math.abs(n);
  while(remaining>0){
    d.setDate(d.getDate()+step);
    if(isBusinessDay(d)) remaining--;
  }
  return d;
}

function setText(id, txt){ const el=$(id); if(el) el.textContent=txt; }
function showBlock(sel){ const el=$(sel); if(el) el.classList.remove("hidden"); }
function hideBlock(sel){ const el=$(sel); if(el) el.classList.add("hidden"); }
function showSel(sel){ const el=$(sel); if(el) el.classList.remove("is-off"); }
function hideSel(sel){ const el=$(sel); if(el) el.classList.add("is-off"); }

function recalc(){
  const dateStr=$("#date").value;
  const lead=Number($("#leadTime").value||0);
  const direction=$("#direction").value;
  if(!dateStr){ hideBlock("#results"); return; }
  const base=parseISODate(dateStr);

  if(direction==="submit"){
    const submit=addBusinessDays(base,-lead);
    setText("#primaryLabel","Submit payroll on");
    setText("#primaryDate",fmtLong(submit));
    setText("#secondaryLabel","Employees paid on");
    setText("#secondaryDate",fmtLong(base));
  }else{
    const pay=addBusinessDays(base,lead);
    setText("#primaryLabel","Employees paid on");
    setText("#primaryDate",fmtLong(pay));
    setText("#secondaryLabel","Submit payroll on");
    setText("#secondaryDate",fmtLong(base));
  }

  const warns=[];
  if(!isBusinessDay(base)) warns.push("Selected date is not a U.S. business day (weekend or observed federal holiday).");
  if(lead===0) warns.push("Lead time is 0 business days. Your provider may still have cutoff-time rules.");

  const warnBox=$("#warnings");
  warnBox.innerHTML="";
  if(warns.length){
    for(const w of warns){
      const div=document.createElement("div");
      div.className="badge";
      div.textContent=w;
      warnBox.appendChild(div);
    }
    showBlock("#warnings");
  }else{
    hideBlock("#warnings");
  }
  showBlock("#results");
}

function setPresetLead(){
  const preset=$("#preset").value;
  const map={ach_2:2, ach_1:1, same_day:0, wire:0, check:0};
  if(preset==="custom"){
    $("#leadTime").disabled=false;
  }else{
    $("#leadTime").disabled=true;
    $("#leadTime").value=map[preset];
  }
  recalc();
}

function initMonetization(){
  const M=window.MONETIZATION||{};
  if(M.ADS_ACTIVE){
    showSel("#ad1"); showSel("#ad2");
    const ins1=document.querySelector("#ad1 ins.adsbygoogle");
    const ins2=document.querySelector("#ad2 ins.adsbygoogle");
    if(ins1){ ins1.setAttribute("data-ad-client",M.ADSENSE_CLIENT||""); ins1.setAttribute("data-ad-slot",M.AD_SLOT_1||""); }
    if(ins2){ ins2.setAttribute("data-ad-client",M.ADSENSE_CLIENT||""); ins2.setAttribute("data-ad-slot",M.AD_SLOT_2||""); }
    try{ (window.adsbygoogle=window.adsbygoogle||[]).push({}); (window.adsbygoogle=window.adsbygoogle||[]).push({}); }catch(e){}
  }else{
    hideSel("#ad1"); hideSel("#ad2");
  }

  if(M.SPONSOR_ACTIVE){
    showSel("#sponsor");
  }else{
    hideSel("#sponsor");
  }
}

function init(){
  $("#date").value=toISODate(new Date());
  $("#date").addEventListener("change",recalc);
  $("#leadTime").addEventListener("change",recalc);
  $("#direction").addEventListener("change",recalc);
  $("#preset").addEventListener("change",setPresetLead);

  $("#swap").addEventListener("click",()=>{
    $("#direction").value=($("#direction").value==="submit")?"pay":"submit";
    recalc();
  });
  $("#reset").addEventListener("click",()=>{
    $("#preset").value="ach_2";
    $("#direction").value="submit";
    $("#leadTime").value="2";
    $("#leadTime").disabled=true;
    $("#date").value=toISODate(new Date());
    recalc();
  });

  setPresetLead();
  recalc();
  initMonetization();
}
document.addEventListener("DOMContentLoaded",init);
