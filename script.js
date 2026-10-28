// Shared behaviour for every page of the portfolio.
// Each block only runs if its elements exist on the current page.

// Language (EN / ES / IT). Texts live in i18n.js; English is also the HTML default.
// The choice is shared by every page of the site, including the project demos.
const LANGS = ["en", "es", "it"];
const LANG_KEY = "portfolio_lang";
let LANG = (() => {
  try { const saved = localStorage.getItem(LANG_KEY); if (LANGS.includes(saved)) return saved; } catch (e) {}
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return LANGS.includes(browser) ? browser : "en";
})();
const t = (key, vars) => {
  const dict = window.I18N || {};
  let v = (dict[LANG] && dict[LANG][key]) ?? (dict.en && dict.en[key]) ?? key;
  if (vars && typeof v === "string") Object.keys(vars).forEach((k) => { v = v.replace("{" + k + "}", vars[k]); });
  return v;
};
const applyLang = (lang) => {
  LANG = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  document.documentElement.lang = { en: "en-GB", es: "es", it: "it" }[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(",").forEach((pair) => { const [attr, key] = pair.split(":"); el.setAttribute(attr, t(key)); });
  });
  document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"));
  document.dispatchEvent(new CustomEvent("langchange"));
};
document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));
if (window.I18N) applyLang(LANG);

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

// Hero typing animation (home page)
const typedEl = document.getElementById("typedText");
if (typedEl) {
  let phraseIndex = 0, charIndex = 0, deleting = false;
  const typeLoop = () => {
    const phrases = t("typed");
    const current = phrases[phraseIndex % phrases.length];
    charIndex = Math.min(charIndex, current.length);
    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) { deleting = true; setTimeout(typeLoop, 1400); return; }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % t("typed").length; }
    }
    setTimeout(typeLoop, deleting ? 40 : 80);
  };
  typeLoop();
}

// Scroll reveal
const revealTargets = document.querySelectorAll(".section, .project-card, .timeline__item, .step");
revealTargets.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
});
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealTargets.forEach((el) => observer.observe(el));

// "Do you want to hire me?" — the No button runs away and gets chatty
const hireArena = document.getElementById("hireArena");
const hireYes = document.getElementById("hireYes");
const hireNo = document.getElementById("hireNo");
const hireCounter = document.getElementById("hireCounter");
if (hireArena && hireYes && hireNo) {
  const giveUpAt = 14; // after this many tries the No button surrenders
  let attempts = 0;

  // Rectangles relative to the arena
  const relRect = (el) => {
    const a = hireArena.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height };
  };
  const overlaps = (a, b, gap = 16) =>
    a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y;

  // First escape: take the No button out of the row but leave an invisible
  // placeholder of the same size, so the Yes button never shifts.
  const detachNo = () => {
    if (hireNo.classList.contains("is-placed")) return;
    const start = relRect(hireNo);
    const slot = document.createElement("span");
    slot.className = "btn btn--ghost hire__no-slot";
    slot.textContent = hireNo.textContent;
    slot.setAttribute("aria-hidden", "true");
    hireNo.after(slot);
    hireNo.classList.add("is-placed");
    hireNo.style.left = `${start.x}px`;
    hireNo.style.top = `${start.y}px`;
    void hireNo.offsetWidth; // apply the starting point so the jump animates from there
  };

  // Texts of the No button and the counter for the current attempt and language
  const renderHireTexts = () => {
    const phrases = t("hire.phrases");
    if (attempts >= giveUpAt) {
      hireNo.textContent = t("hire.giveUp");
      hireCounter.textContent = t("hire.knew");
    } else {
      hireNo.textContent = phrases[Math.min(attempts, phrases.length - 1)];
      hireCounter.textContent = attempts ? t("hire.count", { n: attempts }) : "";
    }
  };
  document.addEventListener("langchange", renderHireTexts);
  renderHireTexts();

  const dodge = () => {
    attempts++;
    detachNo();
    renderHireTexts();
    if (attempts >= giveUpAt) return;

    // Pick a random spot inside the arena that does not cover the Yes button
    const arenaW = hireArena.clientWidth, arenaH = hireArena.clientHeight;
    const no = relRect(hireNo), yes = relRect(hireYes);
    let spot = null;
    for (let i = 0; i < 30 && !spot; i++) {
      const candidate = { x: Math.random() * (arenaW - no.w), y: Math.random() * (arenaH - no.h), w: no.w, h: no.h };
      const farEnough = Math.hypot(candidate.x - no.x, candidate.y - no.y) > 80;
      if (!overlaps(candidate, yes) && farEnough) spot = candidate;
    }
    if (!spot) spot = { x: 0, y: 0 };
    hireNo.style.left = `${spot.x}px`;
    hireNo.style.top = `${spot.y}px`;
  };

  // Mouse users: it escapes before they can click. Touch / keyboard: it escapes on press.
  hireNo.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && attempts < giveUpAt) dodge(); });
  hireNo.addEventListener("click", () => {
    if (attempts >= giveUpAt) {
      document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
      return;
    }
    dodge();
  });

  // Keep the No button inside the arena if the window is resized
  window.addEventListener("resize", () => {
    if (!hireNo.classList.contains("is-placed")) return;
    const no = relRect(hireNo);
    hireNo.style.left = `${Math.min(no.x, hireArena.clientWidth - no.w)}px`;
    hireNo.style.top = `${Math.min(no.y, hireArena.clientHeight - no.h)}px`;
  });
}

// Contact form (demo only — real site sends via EmailJS)
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = t("form.preview");
    formStatus.className = "form-status sending";
  });
  document.addEventListener("langchange", () => { if (formStatus.textContent) formStatus.textContent = t("form.preview"); });
}
