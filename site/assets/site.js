/* CronRack landing page. No HTML strings anywhere: DOM is built with createElement/textContent. */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

/* Scroll reveal: fade + small rise, staggered 80ms between siblings. */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
  }
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".rv").forEach((el) => {
  const group = [...el.parentElement.children].filter((c) => c.classList.contains("rv"));
  el.style.setProperty("--d", Math.min(group.indexOf(el), 5) * 80 + "ms");
  io.observe(el);
});

/* Gentle tilt on the glass preview (mouse only, off for reduced motion). */
const stage = document.getElementById("stage");
const pv = document.getElementById("pv");
if (stage && pv && !reduce && matchMedia("(hover: hover)").matches) {
  stage.addEventListener("mousemove", (e) => {
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    pv.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  stage.addEventListener("mouseleave", () => { pv.style.transform = ""; });
}

/* Install terminal: types the commands for the selected step. */
const STEPS = [
  ["server", [["c", "# on the machine that runs CronRack"], ["p", "git clone https://github.com/diischm/cronrack"], ["p", "cd cronrack"], ["p", "docker compose up -d"]]],
  ["agent", [["c", "# on each machine you want to watch"], ["p", "curl -fsSLO https://<your-server>/install.sh"], ["p", "sudo sh install.sh --token <token>"]]],
  ["phone", [["c", "# open it from anywhere"], ["t", "https://<your-server>"], ["c", "# Network OK · 3 hosts"]]],
];
const code = document.getElementById("code");
const title = document.getElementById("tt");
const live = document.getElementById("term-live");
const term = document.getElementById("term");
const buttons = document.querySelectorAll(".steps button");
let run = 0;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function span(cls, text) {
  const s = document.createElement("span");
  if (cls) s.className = cls;
  s.textContent = text;
  return s;
}

async function type(i) {
  const id = ++run;
  const [name, lines] = STEPS[i];
  title.textContent = name;
  code.textContent = "";
  live.textContent = lines.map(([k, t]) => (k === "p" ? "$ " : "") + t).join("\n");
  for (const [k, line] of lines) {
    if (k === "p") code.append(span("p", "$ "));
    const s = span(k === "c" ? "c" : "", "");
    const caret = span("caret", "");
    code.append(s, caret);
    if (reduce) {
      s.textContent = line;
    } else {
      for (const ch of line) {
        s.textContent += ch;
        await wait(k === "c" ? 12 : 24);
        if (id !== run) return;
      }
    }
    caret.remove();
    code.append("\n");
  }
  code.append(span("caret", ""));
}

if (term) {
  buttons.forEach((b) => b.addEventListener("click", () => {
    buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    type(Number(b.dataset.s));
  }));
  const termIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { if (run === 0) type(0); termIO.disconnect(); }
  }, { threshold: 0.4 });
  termIO.observe(term);
}
