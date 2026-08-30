// ===============================
// MENU BURGER (MOBILE)
// ===============================
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
burger.addEventListener("click", () => {
  menu.classList.toggle("active");
  burger.classList.toggle("active");
});
// Fermer le menu après clic sur un lien (mobile)
document.querySelectorAll("#menu a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("active");
    burger.classList.remove("active");
  });
});

// ===============================
// SURBRILLANCE DU JOUR ACTUEL (HORAIRES)
// ===============================
// CORRECTION : on cible uniquement les lignes du 1er .infos-box (Horaires),
// et non plus toutes les lignes des deux blocs (Horaires + Tarifs) mélangées.
const days = document.querySelectorAll("#infos .infos-box:first-child li");
// 0 = dimanche, 1 = lundi...
const today = new Date().getDay();
const dayIndex = today === 0 ? 6 : today - 1; // Lundi = index 0
days.forEach((day, index) => {
  if (index === dayIndex) {
    day.style.color = "#d4af37";
    day.style.fontWeight = "600";
  }
});

// ===============================
// ANIMATION AU SCROLL (OPTIONNEL PREMIUM)
// ===============================
const revealElements = document.querySelectorAll("section");
const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.85;
  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < trigger) {
      el.classList.add("visible");
    }
  });
};
window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

// ===============================
// COMPTEUR ANIMÉ - NOTE GOOGLE (section Avis)
// ===============================
const ratingEl = document.querySelector(".rating-number");
let ratingAnimated = false;

function animateRating(el) {
  const target = parseFloat(el.dataset.target);
  const duration = 1200; // ms
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const current = (target * progress).toFixed(1);
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toFixed(1);
    }
  }
  requestAnimationFrame(step);
}

if (ratingEl) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ratingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !ratingAnimated) {
        ratingAnimated = true;
        if (prefersReducedMotion) {
          ratingEl.textContent = parseFloat(ratingEl.dataset.target).toFixed(1);
        } else {
          animateRating(ratingEl);
        }
        ratingObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });
  ratingObserver.observe(ratingEl);
}

// ===============================
// CONSENTEMENT COOKIES + CHARGEMENT DE LA CARTE GOOGLE MAPS
// ===============================
const cookieBanner = document.getElementById("cookie-banner");
const acceptBtn = document.getElementById("cookie-accept");
const refuseBtn = document.getElementById("cookie-refuse");
const loadMapBtn = document.getElementById("load-map-btn");
const mapPlaceholder = document.getElementById("map-placeholder");
const mapIframe = document.getElementById("gmap-iframe");

function loadMap() {
  if (mapIframe && !mapIframe.src) {
    mapIframe.src = mapIframe.dataset.src;
    mapIframe.style.display = "block";
    if (mapPlaceholder) mapPlaceholder.style.display = "none";
  }
}

const consent = localStorage.getItem("cookieConsent");

if (consent === "accepted") {
  loadMap();
  if (cookieBanner) cookieBanner.classList.add("hidden");
} else if (!consent && cookieBanner) {
  cookieBanner.classList.remove("hidden");
}

if (acceptBtn) {
  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    cookieBanner.classList.add("hidden");
    loadMap();
  });
}

if (refuseBtn) {
  refuseBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "refused");
    cookieBanner.classList.add("hidden");
  });
}

// Un clic manuel sur "Afficher la carte" vaut consentement pour ce composant précis
if (loadMapBtn) {
  loadMapBtn.addEventListener("click", () => {
    loadMap();
  });
}
