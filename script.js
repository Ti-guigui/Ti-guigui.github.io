// ===============================
// MENU BURGER (MOBILE)
// ===============================
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

if (burger && menu) {
  const toggleMenu = () => {
    const open = menu.classList.toggle("active");
    burger.classList.toggle("active", open);
    burger.setAttribute("aria-expanded", String(open));
  };

  burger.addEventListener("click", toggleMenu);
  burger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Fermer le menu après clic sur un lien (mobile)
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

// ===============================
// HEADER : OMBRE AU SCROLL + LIEN ACTIF
// ===============================
const header = document.getElementById("header");

// Liens de navigation internes (pages avec ancres, ex: index.html)
const navLinks = menu
  ? Array.from(menu.querySelectorAll('a[href^="#"]')).filter((a) => a.getAttribute("href").length > 1)
  : [];

const navTargets = navLinks
  .map((a) => {
    const el = document.querySelector(a.getAttribute("href"));
    return el ? { link: a, el } : null;
  })
  .filter(Boolean)
  // ordre du DOM : la section la plus basse gagne (l'ordre du menu peut différer)
  .sort((a, b) =>
    a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  );

function updateHeaderAndNav() {
  const y = window.scrollY;

  if (header) {
    header.classList.toggle("scrolled", y > 30);
  }

  if (navTargets.length) {
    const offset = (header ? header.offsetHeight : 96) + 80;
    let current = navTargets[0];
    navTargets.forEach((t) => {
      if (t.el.getBoundingClientRect().top <= offset) current = t;
    });
    // Tout en bas de page : dernière section active
    if (y + window.innerHeight >= document.body.scrollHeight - 5) {
      current = navTargets[navTargets.length - 1];
    }
    navTargets.forEach((t) => t.link.classList.toggle("active", t === current));
  }
}

// ===============================
// SURBRILLANCE DU JOUR ACTUEL (HORAIRES)
// ===============================
// On cible uniquement les lignes du 1er .infos-box (Horaires) de la page d'accueil.
const days = document.querySelectorAll("#infos .infos-box:first-child li");
// 0 = dimanche, 1 = lundi...
const today = new Date().getDay();
const dayIndex = today === 0 ? 6 : today - 1; // Lundi = index 0
days.forEach((day, index) => {
  if (index === dayIndex) day.classList.add("today");
});

// ===============================
// STATUT OUVERT / FERMÉ (badge du hero)
// ===============================
// [ouverture, fermeture] en heures décimales, du lundi au dimanche
const SCHEDULE = [
  [11.5, 19], // lundi
  [9, 19],    // mardi
  [9, 19],    // mercredi
  [9, 19],    // jeudi
  [9, 20],    // vendredi
  [9, 19],    // samedi
  [9.5, 15],  // dimanche
];

function formatHour(h) {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return minutes > 0 ? `${hours}h${String(minutes).padStart(2, "0")}` : `${hours}h`;
}

const statusEl = document.getElementById("open-status");
if (statusEl) {
  const now = new Date();
  const jsDay = now.getDay();
  const idx = jsDay === 0 ? 6 : jsDay - 1;
  const current = now.getHours() + now.getMinutes() / 60;
  const [open, close] = SCHEDULE[idx];

  if (current >= open && current < close) {
    statusEl.classList.add("is-open");
    statusEl.innerHTML = `<i class="fa-solid fa-circle"></i> Ouvert · ferme à ${formatHour(close)}`;
  } else {
    statusEl.classList.add("is-closed");
    if (current < open) {
      statusEl.innerHTML = `<i class="fa-solid fa-circle"></i> Fermé · ouvre à ${formatHour(open)}`;
    } else {
      // Après la fermeture : prochaine ouverture = demain (un seul créneau par jour)
      const nextIdx = (idx + 1) % 7;
      statusEl.innerHTML = `<i class="fa-solid fa-circle"></i> Fermé · ouvre demain à ${formatHour(SCHEDULE[nextIdx][0])}`;
    }
  }
}

// ===============================
// ANIMATION AU SCROLL (APPARITION DES SECTIONS)
// ===============================
const revealElements = document.querySelectorAll("section");
const revealOnScroll = () => {
  const trigger = window.innerHeight * 0.85;
  revealElements.forEach((el) => {
    if (el.getBoundingClientRect().top < trigger) {
      el.classList.add("visible");
    }
  });
};

// ===============================
// BOUTON "RETOUR EN HAUT"
// ===============================
const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "Retour en haut de page");
backToTop.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
document.body.appendChild(backToTop);
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function onScroll() {
  revealOnScroll();
  updateHeaderAndNav();
  backToTop.classList.toggle("show", window.scrollY > 600);
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", updateHeaderAndNav);
onScroll();

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
    entries.forEach((entry) => {
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
// LIGHTBOX GALERIE
// ===============================
const galleryImages = document.querySelectorAll(".gallery img");
if (galleryImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-label", "Photo agrandie");
  lightbox.style.display = "none";

  const lightboxImg = document.createElement("img");
  lightboxImg.alt = "";

  const lightboxClose = document.createElement("button");
  lightboxClose.className = "lightbox-close";
  lightboxClose.setAttribute("aria-label", "Fermer");
  lightboxClose.innerHTML = "&times;";

  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(lightboxClose);
  document.body.appendChild(lightbox);

  const closeLightbox = () => {
    lightbox.style.display = "none";
    document.body.style.overflow = "";
  };

  galleryImages.forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "";
      lightbox.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.style.display === "flex") closeLightbox();
  });
}

// ===============================
// ANNÉE COURANTE (FOOTER)
// ===============================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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
