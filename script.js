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
const days = document.querySelectorAll(".infos-box ul li");

// 0 = dimanche, 1 = lundi...
const today = new Date().getDay();

days.forEach((day, index) => {
  // Lundi = index 0 → getDay() = 1
  const dayIndex = today === 0 ? 6 : today - 1;

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
