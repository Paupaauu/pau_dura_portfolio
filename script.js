// Shared behaviour for every page of the portfolio.
// Each block only runs if its elements exist on the current page.

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
  const phrases = ["Planning Manager", "Data Analyst", "Data Storyteller", "Forecast Enthusiast"];
  let phraseIndex = 0, charIndex = 0, deleting = false;
  const typeLoop = () => {
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) { deleting = true; setTimeout(typeLoop, 1400); return; }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
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

// Contact form (demo only — real site sends via EmailJS)
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "This is only a preview — the live site sends messages via EmailJS.";
    formStatus.className = "form-status sending";
  });
}
