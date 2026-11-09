const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
/* scroll reveal + the preview's lines and meters */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("on");io.unobserve(e.target);}}),{threshold:.2});
document.querySelectorAll(".rv,#pv").forEach(el=>io.observe(el));
/* soft tilt on the glass preview */
const st=document.getElementById("stage"),pv=document.getElementById("pv");
if(!reduce&&matchMedia("(hover:hover)").matches){
  st.addEventListener("mousemove",e=>{const r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;pv.style.transform=`rotateY(${x*6}deg) rotateX(${-y*6}deg)`;});
  st.addEventListener("mouseleave",()=>pv.style.transform="");
}
/* install terminal: types the command for the selected step (built with text nodes, no innerHTML) */
const STEPS=[
 ["server",[["c","# on the machine that runs CronRack"],["p","git clone https://github.com/diischm/cronrack"],["p","cd cronrack"],["p","docker compose up -d"]]],
 ["agent",[["c","# on each machine you want to watch"],["p","curl -fsSLO https://<your-server>/install.sh"],["p","sudo sh install.sh --token <token>"]]],
 ["phone",[["c","# open it from anywhere"],["t","https://<your-server>"],["c","# Network OK · 3 hosts"]]]];
const code=document.getElementById("code"),tt=document.getElementById("tt");let run=0;
function span(cls,txt){const s=document.createElement("span");if(cls)s.className=cls;s.textContent=txt;return s;}
async function type(i){
  const id=++run;code.textContent="";tt.textContent=STEPS[i][0];
  for(const [k,line] of STEPS[i][1]){
    if(k==="p")code.append(span("p","$ "));
    const s=span(k==="c"?"c":"",""),caret=span("caret","");code.append(s,caret);
    if(reduce){s.textContent=line;}else{for(const ch of line){if(id!==run)return;s.textContent+=ch;await new Promise(r=>setTimeout(r,k==="c"?12:24));}}
    caret.remove();code.append("\n");
  }
  code.append(span("caret",""));
}
document.querySelectorAll(".steps button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".steps button").forEach(x=>x.setAttribute("aria-selected",x===b));type(+b.dataset.s);}));
const termIO=new IntersectionObserver(es=>{if(es[0].isIntersecting){type(0);termIO.disconnect();}},{threshold:.4});
termIO.observe(document.querySelector(".term"));
