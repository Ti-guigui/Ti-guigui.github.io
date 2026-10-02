/* =========================================================
   STAR BARBERSHOP — SALLE DE JEUX
   Noyau commun (onglets, filtres solo/multi, son, classements, utilitaires)
   puis 12 mini-jeux (chacun isolé derrière une garde).
   ========================================================= */

/* ---------------- Illustrations vectorielles partagées ----------------
   Petits SVG dorés générés à la volée (aucun fichier, aucune dépendance) :
   illustrations du quiz, cartes de « Trouve la bonne coupe », memory,
   Attrape la mèche et bandeau des succès. */
const ART = (function () {
  const G = "#d4af37"; // or
  const D = "#141416"; // sombre (cheveux, objets)

  function svg(inner, cls) {
    return "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' focusable='false'" +
      (cls ? " class='" + cls + "'" : "") + ">" + inner + "</svg>";
  }

  /* --- Coupes de cheveux : cheveux & barbes posés sur une tête --- */
  const HAIR = {
    buzz: "<path d='M17.5 27c1-9 6.5-14 14.5-14s13.5 5 14.5 14c-3-5.5-8.5-8-14.5-8s-11.5 2.5-14.5 8z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    crew: "<path d='M18 26c1.5-8.5 7-13.5 14-13.5S44.5 17.5 46 26c-3.5-5-8.5-7.5-14-7.5S21.5 21 18 26z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    taper: "<path d='M19 28c1-7.5 6-12.5 13-12.5S44 20.5 45 28c-3-4.5-7.5-7-13-7s-10 2.5-13 7z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    fade: "<path d='M18 26c1-8.5 7-14 14-14s13 5.5 14 14c-3-5-8-7.5-14-7.5S21 21 18 26z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M18.6 28c-.8 4-.8 8 0 12M45.4 28c.8 4 .8 8 0 12' fill='none' stroke='" + G + "' stroke-width='2.4' stroke-linecap='round' opacity='.5'/>",
    undercut: "<path d='M16.5 28c1-10 7.5-16 15.5-16s14.5 6 15.5 16c-2.5-6-8-9.5-15.5-9.5S19 22 16.5 28z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M19.5 30v9M44.5 30v9' fill='none' stroke='" + G + "' stroke-width='2.4' stroke-linecap='round' opacity='.5'/>",
    slick: "<path d='M17 28c0-9.5 7-16 15-16 8.5 0 14.5 5.5 15.5 14-2.5-4.5-7-7-13.5-7.5-6-.5-13 1.5-17 9.5z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    pompadour: "<path d='M16.5 30c-1-12 6.5-20 15.5-20 8.5 0 14.5 5.5 15.5 14-2.5-3.5-6-5.5-9-6.5-1 3-3.5 5-7 6-4.5 1.5-10.5 2.5-15 6.5z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    quiff: "<path d='M17 29c0-9 6-15 14-15-2.5-6 3-11 9.5-9.5 6 1.5 9 7.5 7 14l-3 5c-1.5-5-6-8-12.5-8-5 0-10.5 1.5-15 13.5z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    afro: "<circle cx='32' cy='16.5' r='15' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    sidepart: "<path d='M18 27c0-8.5 6.5-14.5 14-14.5s14 6 14 14.5c-3-5-8-7.5-14-7.5s-11 2.5-14 7.5z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M40 13.5 31.5 26' fill='none' stroke='" + G + "' stroke-width='2' stroke-linecap='round'/>",
    bald: "<path d='M23 18.5q9-5 18 0' fill='none' stroke='" + G + "' stroke-width='1.6' stroke-linecap='round' opacity='.55'/>"
  };
  const BEARD = {
    full: "<path d='M19.5 34c0 11 5.5 18 12.5 18s12.5-7 12.5-18c-2 6.5-6.5 9.5-12.5 9.5S21.5 40.5 19.5 34z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>",
    stubble: "<path d='M21 37.5c1 8 5 12.5 11 12.5s10-4.5 11-12.5c-2 5-6 7-11 7s-9-2-11-7z' fill='" + D + "' stroke='" + G + "' stroke-width='1.8'/>",
    goatee: "<path d='M25.5 41.5q6.5 3.5 13 0' fill='none' stroke='" + G + "' stroke-width='2.6' stroke-linecap='round'/><path d='M27.5 44.5h9v5q-4.5 3-9 0z' fill='" + D + "' stroke='" + G + "' stroke-width='1.8'/>",
    moustache: "<path d='M25.5 41.5q6.5 3.5 13 0' fill='none' stroke='" + G + "' stroke-width='2.8' stroke-linecap='round'/>"
  };
  function head(hair, beard) {
    return svg(
      "<circle cx='15' cy='33' r='3.6' fill='" + D + "' stroke='" + G + "' stroke-width='1.6'/>" +
      "<circle cx='49' cy='33' r='3.6' fill='" + D + "' stroke='" + G + "' stroke-width='1.6'/>" +
      "<ellipse cx='32' cy='32' rx='15' ry='18' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>" +
      "<circle cx='26.5' cy='32' r='1.8' fill='" + G + "'/>" +
      "<circle cx='37.5' cy='32' r='1.8' fill='" + G + "'/>" +
      "<path d='M32 34.5v4.5' fill='none' stroke='" + G + "' stroke-width='1.5' stroke-linecap='round'/>" +
      "<path d='M28 43q4 2.8 8 0' fill='none' stroke='" + G + "' stroke-width='1.5' stroke-linecap='round'/>" +
      (BEARD[beard] || "") +
      (HAIR[hair] || "")
    );
  }

  /* --- Objets, outils & accessoires du salon --- */
  const ICONS = {
    scissors: svg("<g fill='none' stroke='" + G + "' stroke-width='3' stroke-linecap='round'><path d='M17 9 42 46'/><path d='M47 9 22 46'/></g><circle cx='19.5' cy='51.5' r='6' fill='none' stroke='" + G + "' stroke-width='3'/><circle cx='44.5' cy='51.5' r='6' fill='none' stroke='" + G + "' stroke-width='3'/><circle cx='32' cy='31' r='3.2' fill='" + G + "'/>"),
    clipper: svg("<rect x='23' y='7' width='18' height='33' rx='6' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><rect x='20' y='39' width='24' height='8' rx='3' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M22.5 47v7M27.5 47v7M32.5 47v7M37.5 47v7M42.5 47v7' fill='none' stroke='" + G + "' stroke-width='2.4' stroke-linecap='round'/><circle cx='32' cy='15' r='3' fill='" + G + "'/><path d='M27 24h10' fill='none' stroke='" + G + "' stroke-width='1.6' opacity='.6'/>"),
    razor: svg("<path d='M12 54 32 34' fill='none' stroke='" + G + "' stroke-width='5' stroke-linecap='round'/><path d='M30 36 47 14l6 5-17 22z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>"),
    comb: svg("<rect x='9' y='20' width='46' height='8' rx='4' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M14 28v18M21 28v13M28 28v18M35 28v13M42 28v18M49 28v13' fill='none' stroke='" + G + "' stroke-width='2.2' stroke-linecap='round'/>"),
    brush: svg("<path d='M27 37h10v14a5 5 0 0 1-10 0z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M23.5 37c0-9 3.8-15 8.5-15s8.5 6 8.5 15z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>"),
    bottle: svg("<rect x='21' y='19' width='22' height='35' rx='7' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><rect x='27' y='8' width='10' height='11' rx='2.5' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M27 31h10M27 38h10' fill='none' stroke='" + G + "' stroke-width='1.6' opacity='.65'/>"),
    spray: svg("<path d='M24 23h14v29a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><rect x='28' y='13' width='6' height='10' rx='2' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M44 14h6M44 19h7M44 24h5' fill='none' stroke='" + G + "' stroke-width='2' stroke-linecap='round'/>"),
    cap: svg("<path d='M13 39a19 15 0 0 1 38 0z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M45 38h10a5 5 0 0 1 1 9H45z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><circle cx='32' cy='20' r='2.6' fill='" + G + "'/>"),
    star: svg("<path d='M32 6l7.2 15.4 16.8 2.2-12.2 11.6 3 16.6L32 43l-14.8 8.4 3-16.6L8 23.6l16.8-2.2z' fill='" + G + "' stroke='#8a6d1f' stroke-width='1.5' stroke-linejoin='round'/>"),
    heart: svg("<path d='M32 54C18 44 10 36 10 26.5 10 19.6 15.4 14 22 14c4.4 0 8.4 2.2 10 5.8C33.6 16.2 37.6 14 42 14c6.6 0 12 5.6 12 12.5C54 36 46 44 32 54z' fill='#c84646' stroke='#e08a8a' stroke-width='1.6'/>"),
    bomb: svg("<circle cx='30' cy='38' r='16' fill='#1a1a1d' stroke='" + G + "' stroke-width='2'/><path d='M40 25l6-6' fill='none' stroke='" + G + "' stroke-width='3' stroke-linecap='round'/><path d='M46 16l3-7M49 19l8-3' fill='none' stroke='#e8c860' stroke-width='2' stroke-linecap='round'/><path d='M23 33a9 9 0 0 1 5-5' fill='none' stroke='#ffffff' stroke-width='1.6' opacity='.35'/>"),
    pole: svg("<rect x='22' y='8' width='20' height='48' rx='10' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M24 18 40 10M24 30 40 22M24 42 40 34M24 54 40 46' fill='none' stroke='" + G + "' stroke-width='3' stroke-linecap='round'/><circle cx='32' cy='7' r='3.4' fill='" + G + "'/><circle cx='32' cy='57' r='3.4' fill='" + G + "'/>"),
    chair: svg("<rect x='19' y='7' width='21' height='27' rx='8' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><rect x='14' y='33' width='34' height='8' rx='4' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M31 41v11M21 56h20M21 56q10 5 20 0' fill='none' stroke='" + G + "' stroke-width='2.6' stroke-linecap='round'/>"),
    towel: svg("<rect x='13' y='33' width='38' height='19' rx='5' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M13 41h38' fill='none' stroke='" + G + "' stroke-width='1.6' opacity='.6'/><path d='M24 26q-3-5 0-10M32 27q-3-6 0-12M40 26q-3-5 0-10' fill='none' stroke='" + G + "' stroke-width='2' stroke-linecap='round'/>"),
    wax: svg("<ellipse cx='32' cy='23' rx='17' ry='7' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M15 23v13c0 3.9 7.6 7 17 7s17-3.1 17-7V23' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><ellipse cx='32' cy='23' rx='8' ry='3.2' fill='" + G + "' opacity='.85'/>"),
    pin: svg("<path d='M15 21h27a5 5 0 0 1 0 10H15z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M15 35h27a5 5 0 0 1 0 10H15z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M15 26H8M15 40H8' fill='none' stroke='" + G + "' stroke-width='4' stroke-linecap='round'/>"),
    drop: svg("<path d='M32 7s14 15.5 14 25.5A14 14 0 0 1 18 32.5C18 22.5 32 7 32 7z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M25 36a7 7 0 0 0 5 7' fill='none' stroke='" + G + "' stroke-width='1.6' opacity='.7'/>"),
    calendar: svg("<rect x='10' y='14' width='44' height='40' rx='6' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M10 26h44' fill='none' stroke='" + G + "' stroke-width='2'/><path d='M21 8v10M43 8v10' fill='none' stroke='" + G + "' stroke-width='3' stroke-linecap='round'/><g fill='" + G + "'><circle cx='21' cy='36' r='2.6'/><circle cx='32' cy='36' r='2.6'/><circle cx='43' cy='36' r='2.6'/><circle cx='21' cy='46' r='2.6'/><circle cx='43' cy='46' r='2.6'/></g><circle cx='32' cy='46' r='4' fill='none' stroke='#e8c860' stroke-width='2'/>"),
    trophy: svg("<path d='M21 9h22v13a11 11 0 0 1-22 0z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M21 12h-7a8.5 8.5 0 0 0 7.5 9.5M43 12h7a8.5 8.5 0 0 1-7.5 9.5' fill='none' stroke='" + G + "' stroke-width='2'/><path d='M32 33v9' fill='none' stroke='" + G + "' stroke-width='2.6'/><path d='M24 56h16l-2.5-8h-11z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/>"),
    medal: svg("<path d='M22 6l8 20M42 6l-8 20' fill='none' stroke='" + G + "' stroke-width='4' stroke-linecap='round'/><circle cx='32' cy='42' r='14' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M32 34l2.3 4.8 5.2.7-3.8 3.6.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.6 5.2-.7z' fill='" + G + "'/>"),
    crown: svg("<path d='M11 45 7 19l13 10L32 11l12 18 13-10-4 26z' fill='" + D + "' stroke='" + G + "' stroke-width='2' stroke-linejoin='round'/><path d='M13 51h38' fill='none' stroke='" + G + "' stroke-width='3' stroke-linecap='round'/>"),
    bulb: svg("<path d='M32 7a16 16 0 0 1 9 29.3V43H23v-6.7A16 16 0 0 1 32 7z' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M26 48h12M28 54h8' fill='none' stroke='" + G + "' stroke-width='2.6' stroke-linecap='round'/>"),
    clock: svg("<circle cx='32' cy='33' r='21' fill='" + D + "' stroke='" + G + "' stroke-width='2'/><path d='M32 20v13l9 6' fill='none' stroke='" + G + "' stroke-width='2.6' stroke-linecap='round'/><circle cx='32' cy='33' r='2.6' fill='" + G + "'/>")
  };

  /* Coupes nommées (« Trouve la bonne coupe ») */
  const STYLES = {
    "Undercut": head("undercut"),
    "Buzz cut": head("buzz"),
    "Slick back": head("slick"),
    "Dégradé (fade)": head("fade"),
    "Crew cut": head("crew"),
    "Pompadour": head("pompadour"),
    "Taper fade": head("taper"),
    "Coupe + barbe": head("crew", "full"),
    "Quiff (mèche)": head("quiff"),
    "Afro": head("afro"),
    "Crâne rasé": head("bald"),
    "Crâne + barbe": head("bald", "full")
  };
  const CLIENT_HAIRS = ["buzz", "fade", "crew", "quiff", "afro", "slick", "undercut", "taper", "sidepart", "pompadour"];
  const CLIENT_BEARDS = ["stubble", "moustache", "", "goatee", "full"];

  return {
    get(key) {
      if (ICONS[key]) return ICONS[key];
      if (key.indexOf("style:") === 0) return STYLES[key.slice(6)] || head("crew");
      if (key.indexOf("head:") === 0) { const p = key.slice(5).split(","); return head(p[0], p[1]); }
      return "";
    },
    head,
    style(name) { return STYLES[name] || head("crew"); },
    client(i) { return head(CLIENT_HAIRS[i % CLIENT_HAIRS.length], CLIENT_BEARDS[i % CLIENT_BEARDS.length]); },
    hearts(n) { const s = ICONS.heart; let out = ""; for (let i = 0; i < n; i++) out += s; return out; }
  };
})();

/* ---------------- Succès (badges de rejouabilité) ----------------
   Évalués après chaque fin de partie / enregistrement de score, stockés
   dans localStorage, affichés dans le bandeau de la page jeux. */
const ACHV = (function () {
  const KEY = "starbarbershop_achv";
  const GAMES = ["catch", "g2048", "mine", "memory", "connect4", "simon", "hangman", "quiz", "puzzle", "haircut", "mime", "jokes"];

  function unlocked() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
  }
  function entries(id) { return lbGet(id); }
  function maxScore(id) {
    return entries(id).reduce((m, e) => Math.max(m, Number(e.score) || 0), -Infinity);
  }
  function minScore(id) {
    const list = entries(id);
    if (!list.length) return Infinity;
    return list.reduce((m, e) => Math.min(m, Number(e.score)), Infinity);
  }
  function playedGames() {
    return GAMES.filter(id => entries(id).length > 0).length;
  }
  function totalEntries() {
    return GAMES.reduce((n, id) => n + entries(id).length, 0);
  }
  function best(key) { return bestGet(key, null); }

  const defs = [
    { id: "first", icon: "scissors", title: "Premier coup de ciseaux", desc: "Enregistrer votre premier score", check: () => totalEntries() >= 1 || ["catch", "g2048", "simon", "mine"].some(k => (best(k) || 0) > 0) },
    { id: "triple", icon: "medal", title: "Triple service", desc: "Enregistrer un score dans 3 jeux différents", check: () => playedGames() >= 3 },
    { id: "collector", icon: "crown", title: "Polyvalent", desc: "Enregistrer un score dans 7 jeux différents", check: () => playedGames() >= 7 },
    { id: "habitue", icon: "trophy", title: "Habitué du salon", desc: "Cumuler 10 scores enregistrés", check: () => totalEntries() >= 10 },
    { id: "quiz100", icon: "bulb", title: "Sans faute", desc: "Terminer un quiz à 100 %", check: () => entries("quiz").some(e => Number(e.score) >= 100) },
    { id: "quiz80", icon: "bulb", title: "Culture coiffure", desc: "Atteindre 80 % au quiz", check: () => maxScore("quiz") >= 80 },
    { id: "cut80", icon: "scissors", title: "Le client repart souriant", desc: "Satisfaire 80 % des clients minimum", check: () => maxScore("haircut") >= 80 },
    { id: "catch75", icon: "star", title: "Réflexes d'or", desc: "Marquer 75 points à Attrape la mèche", check: () => (best("catch") || 0) >= 75 || maxScore("catch") >= 75 },
    { id: "simon12", icon: "clock", title: "Oreille absolue", desc: "Atteindre le niveau 12 en Suite de rythme", check: () => (best("simon") || 0) >= 12 || maxScore("simon") >= 12 },
    { id: "g2048_1024", icon: "medal", title: "Tuiles millénaires", desc: "Créer une tuile 1024 dans le 2048", check: () => (best("g2048") || 0) >= 1024 || maxScore("g2048") >= 1024 },
    { id: "minefast", icon: "clock", title: "Déminage express", desc: "Terminer un démineur en moins de 3 minutes", check: () => best("mine") != null && best("mine") <= 180 },
    { id: "memofast", icon: "medal", title: "Mémoire d'acier", desc: "Terminer un memory en 12 coups ou moins", check: () => minScore("memory") <= 12 },
    { id: "puzzle80", icon: "star", title: "Vue d'ensemble", desc: "Résoudre un puzzle en 80 coups ou moins", check: () => minScore("puzzle") <= 80 },
    { id: "mime", icon: "medal", title: "Premier tour de mime", desc: "Terminer une partie de Mime Express", check: () => entries("mime").length >= 1 || (best("mime") || 0) > 0 },
    { id: "laugh", icon: "bulb", title: "Fou rire garanti", desc: "Marquer 15 points de rire à Blagues & Anecdotes", check: () => maxScore("jokes") >= 15 || (best("jokes") || 0) >= 15 },
    { id: "expert", icon: "crown", title: "Niveau expert", desc: "Enregistrer un score en niveau Expert ou Difficile", check: () => GAMES.some(id => entries(id).some(e => /expert|difficile/i.test(e.level || ""))) }
  ];

  function render() {
    const strip = document.getElementById("achv-strip");
    const count = document.getElementById("achv-count");
    if (!strip) return;
    const have = unlocked();
    strip.innerHTML = defs.map(d => {
      const on = have.indexOf(d.id) !== -1;
      return "<span class='achv-chip" + (on ? "" : " locked") + "' title='" + d.title + " — " + d.desc + "'>" +
        ART.get(d.icon) + "<span class='achv-name'>" + d.title + "</span></span>";
    }).join("");
    if (count) count.textContent = have.length + "/" + defs.length;
  }

  function toast(d) {
    let root = document.getElementById("toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      root.className = "toast-root";
      document.body.appendChild(root);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = ART.get(d.icon) + "<span><strong>Succès débloqué</strong>" + d.title + "</span>";
    root.appendChild(t);
    try { SFX.win(); } catch (e) { /* son indisponible */ }
    setTimeout(() => t.classList.add("show"), 30);
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 3600);
  }

  function evaluate(announce) {
    const have = unlocked();
    const fresh = defs.filter(d => have.indexOf(d.id) === -1 && d.check());
    if (fresh.length) {
      save(have.concat(fresh.map(d => d.id)));
      if (announce) fresh.forEach((d, i) => setTimeout(() => toast(d), i * 850));
    }
    render();
  }

  render();
  evaluate(false);
  return { evaluate, render, defs };
})();

/* ---------------- Onglets & hooks d'affichage ---------------- */
const gameTabs = document.querySelectorAll(".game-tab");
const gamePanels = document.querySelectorAll(".game-panel");
const gameShowHooks = {};

function onGameShown(gameId, fn) {
  gameShowHooks[gameId] = fn;
}

function isGameActive(gameId) {
  const panel = document.getElementById("game-" + gameId);
  return !!panel && panel.classList.contains("active");
}

function activateTab(tab) {
  gameTabs.forEach(t => t.classList.remove("active"));
  gamePanels.forEach(p => p.classList.remove("active"));
  tab.classList.add("active");
  const id = tab.dataset.game;
  const panel = document.getElementById("game-" + id);
  if (panel) panel.classList.add("active");
  try { localStorage.setItem("starbarbershop_lastgame", id); } catch (e) { /* stockage indisponible */ }
  if (gameShowHooks[id]) gameShowHooks[id]();
  ACHV.evaluate(true);
}

gameTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    SFX.click();
    activateTab(tab);
  });
});

/* ---------------- Filtres solo / à plusieurs ---------------- */
(function () {
  const filterBtns = document.querySelectorAll(".mode-btn");
  if (!filterBtns.length) return;

  function matches(tab, mode) {
    if (mode === "all") return true;
    const modes = (tab.dataset.mode || "solo").split(/\s+/);
    return modes.indexOf(mode) !== -1;
  }

  function applyFilter(mode) {
    const visible = [];
    gameTabs.forEach(tab => {
      const show = matches(tab, mode);
      tab.style.display = show ? "" : "none";
      if (show) visible.push(tab);
    });
    const active = document.querySelector(".game-tab.active");
    if (visible.length && (!active || visible.indexOf(active) === -1)) activateTab(visible[0]);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      SFX.click();
      applyFilter(btn.dataset.mode || "all");
    });
  });
})();

// Année du pied de page (le script principal peut ne pas la gérer)
(function () {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

// Restaure le dernier jeu joué sur cet appareil
try {
  const last = localStorage.getItem("starbarbershop_lastgame");
  if (last) {
    const tab = document.querySelector('.game-tab[data-game="' + last + '"]');
    if (tab && !tab.classList.contains("active")) activateTab(tab);
  }
} catch (e) { /* stockage indisponible */ }

/* ---------------- Effets sonores (WebAudio, sans fichier) ---------------- */
const SFX = (function () {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem("starbarbershop_sound") === "off"; } catch (e) { /* ignore */ }

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, delay) {
    if (muted) return;
    const c = audio();
    if (!c) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      const t = c.currentTime + (delay || 0);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.03);
    } catch (e) { /* audio indisponible */ }
  }

  const btn = document.getElementById("sound-toggle");

  function renderBtn() {
    if (!btn) return;
    btn.classList.toggle("is-off", muted);
    btn.setAttribute("aria-pressed", String(!muted));
    const icon = btn.querySelector("i");
    const label = btn.querySelector("span");
    if (icon) icon.className = muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
    if (label) label.textContent = muted ? "Son coupé" : "Son activé";
  }

  const api = {
    click: () => tone(680, 0.05, "square", 0.035),
    good: () => { tone(660, 0.09, "triangle", 0.07); tone(880, 0.13, "triangle", 0.07, 0.08); },
    bad: () => tone(190, 0.2, "sawtooth", 0.05),
    flip: () => tone(540, 0.05, "sine", 0.05),
    tick: () => tone(900, 0.04, "square", 0.03),
    drop: () => tone(300, 0.09, "sine", 0.05),
    reveal: () => tone(500, 0.05, "sine", 0.04),
    win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.07, i * 0.11)),
    lose: () => [440, 370, 294, 220].forEach((f, i) => tone(f, 0.22, "sawtooth", 0.05, i * 0.13)),
    pad: i => tone([329.63, 415.3, 493.88, 622.25][i] || 440, 0.3, "sine", 0.09)
  };

  if (btn) {
    btn.addEventListener("click", () => {
      muted = !muted;
      try { localStorage.setItem("starbarbershop_sound", muted ? "off" : "on"); } catch (e) { /* ignore */ }
      renderBtn();
      if (!muted) api.click();
    });
  }

  renderBtn();
  return api;
})();

/* ---------------- Utilitaires ---------------- */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function makeTimer(displayEl) {
  let sec = 0;
  let iv = null;
  return {
    start() {
      this.stop();
      sec = 0;
      if (displayEl) displayEl.textContent = "0:00";
      iv = setInterval(() => {
        sec++;
        if (displayEl) displayEl.textContent = fmtTime(sec);
      }, 1000);
    },
    stop() {
      if (iv) clearInterval(iv);
      iv = null;
    },
    reset() { this.stop(); sec = 0; if (displayEl) displayEl.textContent = "0:00"; },
    get seconds() { return sec; }
  };
}

/* Compte à rebours "3 · 2 · 1 · Top !" dans un overlay existant */
function runCountdown(overlay, done) {
  if (!overlay) { done(); return; }
  const kids = Array.from(overlay.children);
  const counter = el("div", "overlay-count");
  const seq = ["3", "2", "1", "Top !"];
  let i = 0;
  kids.forEach(k => { k.style.visibility = "hidden"; });
  overlay.appendChild(counter);

  function step() {
    if (i >= seq.length) {
      counter.remove();
      kids.forEach(k => { k.style.visibility = ""; });
      done();
      return;
    }
    counter.textContent = seq[i];
    counter.style.animation = "none";
    void counter.offsetWidth;
    counter.style.animation = "";
    SFX.tick();
    i++;
    setTimeout(step, 620);
  }
  step();
}

/* ---------------- Sélecteur de niveau (générique) ---------------- */
function setupLevelSelector(containerEl, onChange) {
  if (!containerEl) return null;
  const buttons = containerEl.querySelectorAll(".level-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      SFX.click();
      onChange(btn.dataset.level);
    });
  });
  const initial = containerEl.querySelector(".level-btn.active") || buttons[0];
  return initial ? initial.dataset.level : null;
}

/* ---------------- Records personnels (localStorage) ---------------- */
function bestGet(key, def) {
  try {
    const v = localStorage.getItem("starbarbershop_best_" + key);
    return v == null ? def : Number(v);
  } catch (e) { return def; }
}

function bestSet(key, val, higherBetter) {
  const cur = bestGet(key, null);
  if (cur == null || (higherBetter ? val > cur : val < cur)) {
      try { localStorage.setItem("starbarbershop_best_" + key, String(val)); } catch (e) { /* ignore */ }
      ACHV.evaluate(true);
      return val;
    }
    return cur;
}

/* ---------------- Classements (localStorage) ---------------- */
const LB_MAX_ENTRIES = 10;
const lbRenderers = [];

function lbKey(gameId) {
  return "starbarbershop_leaderboard_" + gameId;
}

function lbGet(gameId) {
  try {
    const raw = localStorage.getItem(lbKey(gameId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function lbSave(gameId, entry, sortFn) {
  const list = lbGet(gameId);
  list.push(entry);
  list.sort(sortFn);
  const trimmed = list.slice(0, LB_MAX_ENTRIES);
  try {
    localStorage.setItem(lbKey(gameId), JSON.stringify(trimmed));
  } catch (e) { /* stockage indisponible : on ignore silencieusement */ }
  ACHV.evaluate(true);
  return trimmed;
}

function lbRender(container, list, formatScore) {
  if (!container) return;
  if (!list.length) {
    container.innerHTML = '<p class="leaderboard-empty">Aucun score enregistré sur cet appareil pour l\'instant.</p>';
    return;
  }
  const rows = list.map((entry, i) => {
    const nameDiv = document.createElement("div");
    nameDiv.textContent = entry.name;
    return `
      <li class="leaderboard-item">
        <span class="leaderboard-rank">${i + 1}</span>
        <span class="leaderboard-name">${nameDiv.innerHTML}</span>
        <span class="leaderboard-score">${formatScore(entry)}</span>
        <span class="leaderboard-level">${entry.level || ""}</span>
      </li>`;
  }).join("");
  container.innerHTML = `<ol class="leaderboard-list">${rows}</ol>`;
}

function attachScoreSubmit(inputId, buttonId, onSave) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  if (!input || !button) return;
  button.addEventListener("click", () => {
    const name = input.value.trim().slice(0, 16) || "Anonyme";
    onSave(name);
    input.value = "";
    SFX.good();
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") button.click();
  });
}

/* ---------------- Initialisation commune des jeux ----------------
   initGame() regroupe les tâches répétitives de mise en place de chaque jeu :
   · récupération des éléments DOM (avec garde d'existence),
   · classement (rendu initial + abonnement à l'effacement global),
   · enregistrement du score (bloc pseudo + sauvegarde localStorage),
   · sélecteur de niveau,
   · abonnements aux boutons (avec ou sans effet sonore),
   · hook « jeu affiché ».
   Le jeu garde sa propre logique et démarre via game.start(...), appelé
   en fin d'initialisation pour conserver l'ordre d'exécution d'origine. */
function initGame(config) {
  const els = {};
  Object.keys(config.els || {}).forEach(key => {
    const spec = config.els[key];
    if (typeof spec === "string") els[key] = document.getElementById(spec);
    else if (spec && spec.all) els[key] = document.querySelectorAll(spec.q);
    else if (spec && spec.q) els[key] = document.querySelector(spec.q);
    else els[key] = null;
  });

  const required = config.required || Object.keys(config.els || {}).slice(0, 1);
  for (let i = 0; i < required.length; i++) {
    if (!els[required[i]]) return null;
  }

  const game = { els };

  /* Classement : rendu initial + enregistrement pour l'effacement global */
  if (config.leaderboard) {
    const lbEl = els[config.leaderboard.el || "leaderboardEl"];
    const format = config.leaderboard.format;
    game.renderLeaderboard = () => lbRender(lbEl, lbGet(config.id), format);
    lbRenderers.push(game.renderLeaderboard);
    game.renderLeaderboard();
  }

  /* Enregistrement du score : nom saisi, sauvegarde, rendu, masquage du bloc */
  if (config.score) {
    const block = els[config.score.el || "submitBlock"];
    const lbEl = els[config.leaderboard ? (config.leaderboard.el || "leaderboardEl") : null];
    const format = config.leaderboard ? config.leaderboard.format : config.score.format;
    attachScoreSubmit(config.score.input, config.score.button, name => {
      const list = lbSave(config.id, config.score.entry(name), config.score.sort);
      lbRender(lbEl, list, format);
      if (block) block.style.display = "none";
    });
  }

  /* Sélecteur de niveau */
  if (config.levels) {
    setupLevelSelector(els[config.levels.el || "levelContainer"], config.levels.onChange);
  }

  /* Abonnements aux boutons : « clicks » émet le clic sonore, « rawClicks » non */
  [{ name: "clicks", son: true }, { name: "rawClicks", son: false }].forEach(kind => {
    const map = config[kind.name];
    if (!map) return;
    Object.keys(map).forEach(key => {
      const btn = els[key];
      if (!btn) return;
      if (kind.son) btn.addEventListener("click", e => { SFX.click(); map[key](e); });
      else btn.addEventListener("click", map[key]);
    });
  });

  /* Le jeu vient d'être affiché (showId si l'onglet diffère de la clé de classement) */
  if (config.onShow) onGameShown(config.showId || config.id, config.onShow);

  /* Démarrage : état initial, appelé en fin d'initialisation du jeu */
  game.start = fn => { if (typeof fn === "function") fn(); return game; };
  return game;
}

/* ---------------- Effacer tous les scores ---------------- */
(function () {
  const resetBtn = document.getElementById("reset-scores-btn");
  if (!resetBtn) return;
  resetBtn.addEventListener("click", () => {
    if (!window.confirm("Effacer tous les scores et records enregistrés sur cet appareil ?")) return;
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.indexOf("starbarbershop_leaderboard_") === 0 || k.indexOf("starbarbershop_best_") === 0 || k === "starbarbershop_achv") {
          localStorage.removeItem(k);
        }
      });
    } catch (e) { /* ignore */ }
    lbRenderers.forEach(fn => fn());
    ACHV.render();
    SFX.bad();
  });
})();

/* ============================
   JEU 1 — ATTRAPE LA MÈCHE (réflexes)
   ============================ */
(function () {
  const game = initGame({
    id: "catch",
    els: {
      catchArea: "catch-area",
      scoreEl: "catch-score",
      livesEl: "catch-lives",
      comboEl: "catch-combo",
      startBtn: "catch-start-btn",
      overlay: "catch-overlay",
      levelContainer: "catch-level-select",
      submitBlock: "catch-score-submit",
      leaderboardEl: "catch-leaderboard"
    },
    required: ["catchArea"],
    leaderboard: { format: e => `${e.score} pt${e.score > 1 ? "s" : ""}` },
    score: {
      input: "catch-name-input",
      button: "catch-save-score-btn",
      entry: name => ({ name, score, level: LEVELS[currentLevel].label }),
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: level => { currentLevel = level; } }
  });
  if (!game) return;
  const { catchArea, scoreEl, livesEl, comboEl, startBtn, overlay, submitBlock } = game.els;

  const NORMAL_ICONS = ["scissors", "bottle", "razor", "comb", "spray", "cap"];
  const LEVELS = {
    facile: { spawnInterval: 1150, baseSpeed: 1.1, growth: 0.035, lives: 4, label: "Facile" },
    moyen: { spawnInterval: 900, baseSpeed: 1.5, growth: 0.05, lives: 3, label: "Moyen" },
    difficile: { spawnInterval: 640, baseSpeed: 2.1, growth: 0.08, lives: 2, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let state = "idle"; // idle | running | paused | over
  let score = 0;
  let lives = 3;
  let combo = 0;
  let lastCatchAt = 0;
  let objects = [];
  let spawnTimer = null;
  let raf = null;

  catchArea.appendChild(el("div", "catch-floor"));

  function multiplier() {
    return Math.min(1 + Math.floor(combo / 5), 4);
  }

  function updateHud() {
    scoreEl.textContent = score;
    livesEl.innerHTML = ART.hearts(Math.max(lives, 0));
    comboEl.textContent = "×" + multiplier();
  }

  function pop(x, y, text, cls) {
    const p = el("span", "catch-pop", text);
    if (cls) p.style.color = cls;
    p.style.left = x + "px";
    p.style.top = y + "px";
    catchArea.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }

  function pickItem() {
    const r = Math.random();
    if (r < 0.13) return { type: "bomb", icon: ART.get("bomb") };
    if (r < 0.20) return { type: "heart", icon: ART.get("heart") };
    if (r < 0.33) return { type: "star", icon: ART.get("star") };
    return { type: "normal", icon: ART.get(NORMAL_ICONS[Math.floor(Math.random() * NORMAL_ICONS.length)]) };
  }

  function spawnObject() {
    if (state !== "running" || !isGameActive("catch")) return;
    const cfg = LEVELS[currentLevel];
    const item = pickItem();
    const node = el("span", "falling-object");
    node.innerHTML = item.icon;
    const x = Math.random() * Math.max(catchArea.clientWidth - 44, 0);
    node.style.left = x + "px";
    node.style.top = "-44px";
    catchArea.appendChild(node);

    const speed = cfg.baseSpeed + Math.min(score * cfg.growth, 4);
    const obj = { node, y: -44, speed, caught: false, type: item.type };

    node.addEventListener("click", () => {
      if (obj.caught || state !== "running") return;
      obj.caught = true;
      const px = parseFloat(node.style.left);
      const py = obj.y;
      node.classList.add("caught");
      setTimeout(() => node.remove(), 160);

      if (obj.type === "bomb") {
        lives--;
        combo = 0;
        SFX.bad();
        pop(px, py, "-1 ♥", "#e08a8a");
      } else if (obj.type === "heart") {
        lives = Math.min(lives + 1, 5);
        SFX.good();
        pop(px, py, "+1 ♥", "#6fcf8f");
      } else {
        combo++;
        lastCatchAt = Date.now();
        const base = obj.type === "star" ? 5 : 1;
        const gain = base * multiplier();
        score += gain;
        SFX.flip();
        pop(px, py, "+" + gain);
      }
      updateHud();
      if (lives <= 0) endGame();
    });

    objects.push(obj);
  }

  function clearObjects() {
    objects.forEach(o => o.node.remove());
    objects = [];
    catchArea.querySelectorAll(".falling-object, .catch-pop").forEach(n => n.remove());
  }

  function loop() {
    if (state !== "running") return;
    if (!isGameActive("catch")) { pauseGame(); return; }

    const h = catchArea.clientHeight;
    if (combo > 0 && Date.now() - lastCatchAt > 1600) {
      combo = 0;
      updateHud();
    }

    objects = objects.filter(obj => {
      if (obj.caught) return false;
      obj.y += obj.speed;
      obj.node.style.top = obj.y + "px";
      if (obj.y > h) {
        obj.node.remove();
        if (obj.type === "normal" || obj.type === "star") {
          lives--;
          combo = 0;
          SFX.bad();
          updateHud();
          if (lives <= 0) { endGame(); return false; }
        }
        return false;
      }
      return true;
    });

    if (state === "running") raf = requestAnimationFrame(loop);
  }

  function setOverlay(title, text, btnLabel) {
    const h = overlay.querySelector("h3");
    const p = overlay.querySelector("p");
    if (h) h.textContent = title;
    if (p) p.textContent = text;
    startBtn.textContent = btnLabel;
    overlay.style.display = "";
  }

  function startGame() {
    const cfg = LEVELS[currentLevel];
    score = 0;
    lives = cfg.lives;
    combo = 0;
    updateHud();
    clearObjects();
    if (submitBlock) submitBlock.style.display = "none";
    clearInterval(spawnTimer);
    cancelAnimationFrame(raf);
    // l'overlay reste visible pendant le compte à rebours
    runCountdown(overlay, () => {
      overlay.style.display = "none";
      state = "running";
      spawnTimer = setInterval(spawnObject, cfg.spawnInterval);
      raf = requestAnimationFrame(loop);
    });
    state = "running";
  }

  function pauseGame() {
    if (state !== "running") return;
    state = "paused";
    clearInterval(spawnTimer);
    cancelAnimationFrame(raf);
    setOverlay("En pause", "Votre partie vous attend : reprenez quand vous voulez.", "Reprendre");
  }

  function endGame() {
    if (state === "over") return;
    state = "over";
    clearInterval(spawnTimer);
    cancelAnimationFrame(raf);
    clearObjects();
    const record = bestSet("catch", score, true);
    SFX.lose();
    setOverlay("Partie terminée", `Score : ${score} point${score > 1 ? "s" : ""} · Record : ${record}`, "Rejouer");
    if (score > 0 && submitBlock) submitBlock.style.display = "flex";
  }

  startBtn.addEventListener("click", () => {
    if (state === "paused") {
      overlay.style.display = "none";
      state = "running";
      const cfg = LEVELS[currentLevel];
      spawnTimer = setInterval(spawnObject, cfg.spawnInterval);
      raf = requestAnimationFrame(loop);
    } else {
      startGame();
    }
  });

  game.start(updateHud);
})();

/* ============================
   JEU 2 — 2048
   ============================ */
(function () {
  const game = initGame({
    id: "g2048",
    els: {
      board: "g2048-board",
      scoreEl: "g2048-score",
      bestEl: "g2048-best",
      overlay: "g2048-overlay",
      overlayTitle: "g2048-overlay-title",
      overlayText: "g2048-overlay-text",
      continueBtn: "g2048-continue-btn",
      replayBtn: "g2048-replay-btn",
      undoBtn: "g2048-undo",
      restartBtn: "g2048-restart",
      dpadBtns: { q: "#g2048-controls .dpad-btn", all: true },
      levelContainer: "g2048-level-select",
      submitBlock: "g2048-score-submit",
      leaderboardEl: "g2048-leaderboard"
    },
    required: ["board"],
    showId: "2048",
    leaderboard: { format: e => `${e.score} pts` },
    score: {
      input: "g2048-name-input",
      button: "g2048-save-score-btn",
      entry: name => ({ name, score, level: LEVELS[currentLevel].label }),
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: level => { currentLevel = level; newGame(); } },
    clicks: {
      restartBtn: () => newGame(),
      replayBtn: () => newGame(),
      continueBtn: () => { overlay.style.display = "none"; }
    },
    rawClicks: { undoBtn: undo },
    onShow: () => {
      if (!initialized || grid.every(row => row.every(v => !v))) {
        initialized = true;
        newGame();
      } else {
        buildBoard();
      }
    }
  });
  if (!game) return;
  const {
    board, scoreEl, bestEl, overlay, overlayTitle, overlayText,
    continueBtn, replayBtn, undoBtn, restartBtn, dpadBtns, levelContainer,
    submitBlock, leaderboardEl
  } = game.els;

  const N = 4;
  const GAP = 10;
  const LEVELS = {
    facile: { target: 512, label: "Facile" },
    moyen: { target: 1024, label: "Moyen" },
    difficile: { target: 2048, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let grid = [];       // valeurs numériques N×N
  let els = [];        // éléments de tuiles N×N
  let score = 0;
  let over = false;
  let maxTile = 2;
  let targetReached = false;
  let undoState = null;
  let initialized = false;
  let busy = false;

  function emptyGrid() {
    return Array.from({ length: N }, () => Array(N).fill(0));
  }

  function metrics() {
    const w = board.clientWidth;
    return { w, cell: (w - GAP * (N + 1)) / N };
  }

  function posOf(i, j) {
    const { cell } = metrics();
    return { left: GAP + j * (cell + GAP), top: GAP + i * (cell + GAP), size: cell };
  }

  function makeTileNode(value, i, j) {
    const { left, top, size } = posOf(i, j);
    const node = el("div", "g2048-tile");
    node.dataset.v = value;
    node.textContent = value;
    node.style.left = left + "px";
    node.style.top = top + "px";
    node.style.width = size + "px";
    node.style.height = size + "px";
    node.style.fontSize = (size * (String(value).length > 3 ? 0.3 : 0.4)) + "px";
    board.appendChild(node);
    return node;
  }

  function buildBoard() {
    const { w, cell } = metrics();
    if (!w || cell <= 0) return false;
    board.querySelectorAll(".g2048-cell, .g2048-tile").forEach(n => n.remove());
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const c = el("div", "g2048-cell");
        const p = posOf(i, j);
        c.style.left = p.left + "px";
        c.style.top = p.top + "px";
        c.style.width = p.size + "px";
        c.style.height = p.size + "px";
        board.appendChild(c);
      }
    }
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (grid[i][j]) els[i][j] = makeTileNode(grid[i][j], i, j);
      }
    }
    return true;
  }

  function reposition(i, j, node) {
    const p = posOf(i, j);
    node.style.left = p.left + "px";
    node.style.top = p.top + "px";
    node.style.width = p.size + "px";
    node.style.height = p.size + "px";
    node.style.fontSize = (p.size * (String(Number(node.dataset.v)).length > 3 ? 0.3 : 0.4)) + "px";
  }

  function spawnTile() {
    const free = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!grid[i][j]) free.push([i, j]);
    if (!free.length) return;
    const [i, j] = free[Math.floor(Math.random() * free.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    if (grid[i][j] > maxTile) maxTile = grid[i][j];
    const node = makeTileNode(grid[i][j], i, j);
    node.classList.add("is-new");
    els[i][j] = node;
  }

  function snapshot() {
    undoState = { grid: grid.map(r => [...r]), score };
  }

  function move(dir) {
    if (busy || over || !isGameActive("2048")) return;
    const vectors = { left: [0, -1], right: [0, 1], up: [-1, 0], down: [1, 0] };
    const [di, dj] = vectors[dir];
    const before = JSON.stringify(grid);
    snapshot();

    const newEls = Array.from({ length: N }, () => Array(N).fill(null));
    let gained = 0;
    const removals = [];

    // On traite les cases en partant du bord ciblé : les tuiles
    // les plus proches de la destination sont positionnées en premier.
    const coords = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) coords.push([i, j]);
    if (dir === "left") coords.sort((a, b) => a[1] - b[1]);
    else if (dir === "right") coords.sort((a, b) => b[1] - a[1]);
    else if (dir === "up") coords.sort((a, b) => a[0] - b[0]);
    else coords.sort((a, b) => b[0] - a[0]);

    const newGrid = emptyGrid();
    const mergedFlags = Array.from({ length: N }, () => Array(N).fill(false));

    coords.forEach(([i, j]) => {
      const v = grid[i][j];
      if (!v) return;
      const node = els[i][j];
      if (!node) return;
      let ci = i, cj = j, mergeAt = false;
      while (true) {
        const ni = ci + di, nj = cj + dj;
        if (ni < 0 || ni >= N || nj < 0 || nj >= N) break;
        const nv = newGrid[ni][nj];
        if (nv === 0) { ci = ni; cj = nj; continue; }
        if (nv === v && !mergedFlags[ni][nj]) { ci = ni; cj = nj; mergeAt = true; break; }
        break;
      }
      if (mergeAt) {
        newGrid[ci][cj] = v * 2;
        mergedFlags[ci][cj] = true;
        gained += v * 2;
        if (v * 2 > maxTile) maxTile = v * 2;
        const target = newEls[ci][cj];
        if (target) {
          target.dataset.v = v * 2;
          target.textContent = v * 2;
          reposition(ci, cj, target);
          target.classList.remove("is-merge");
          void target.offsetWidth;
          target.classList.add("is-merge");
        }
        removals.push(node);
      } else {
        newGrid[ci][cj] = v;
        newEls[ci][cj] = node;
        reposition(ci, cj, node);
      }
    });

    const after = JSON.stringify(newGrid);
    if (before === after) { undoState = null; return; }

    busy = true;
    grid = newGrid;
    els = newEls;
    score += gained;
    scoreEl.textContent = score;
    if (gained > 0) SFX.good(); else SFX.drop();

    setTimeout(() => {
      removals.forEach(n => n.remove());
      spawnTile();
      busy = false;
      updateBest();
      checkEnd();
    }, 140);
  }

  function canMove() {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (!grid[i][j]) return true;
        if (j + 1 < N && grid[i][j] === grid[i][j + 1]) return true;
        if (i + 1 < N && grid[i][j] === grid[i + 1][j]) return true;
      }
    }
    return false;
  }

  function updateBest() {
    // n'écrit un record que si une partie a réellement été jouée
    const record = score > 0 ? bestSet("g2048", score, true) : bestGet("g2048", 0);
    bestEl.textContent = record;
  }

  function showOverlay(title, text, showContinue) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    continueBtn.style.display = showContinue ? "" : "none";
    overlay.style.display = "flex";
  }

  function checkEnd() {
    const target = LEVELS[currentLevel].target;
    if (!targetReached && maxTile >= target) {
      targetReached = true;
      SFX.win();
      showOverlay("Objectif atteint !", `Tuile ${target} créée ! Vous pouvez continuer ou relancer une partie.`, true);
      return;
    }
    if (!canMove()) {
      over = true;
      SFX.lose();
      showOverlay("Plus aucun coup !", `Score final : ${score} · Record : ${bestGet("g2048", 0)}`, false);
      if (score > 0 && submitBlock) submitBlock.style.display = "flex";
    }
  }

  function newGame() {
    grid = emptyGrid();
    els = Array.from({ length: N }, () => Array(N).fill(null));
    score = 0;
    over = false;
    maxTile = 2;
    targetReached = false;
    undoState = null;
    busy = false;
    scoreEl.textContent = 0;
    overlay.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    updateBest();
    if (!buildBoard()) return;
    spawnTile();
    spawnTile();
  }

  function undo() {
    if (!undoState || over) return;
    grid = undoState.grid.map(r => [...r]);
    score = undoState.score;
    undoState = null;
    scoreEl.textContent = score;
    SFX.click();
    buildBoard();
  }

  document.addEventListener("keydown", e => {
    if (!isGameActive("2048") || overlay.style.display === "flex") return;
    const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    const dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    move(dir);
  });

  dpadBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (overlay.style.display === "flex") return;
      move(btn.dataset.dir);
    });
  });

  let touchStart = null;
  board.addEventListener("touchstart", e => {
    if (e.touches.length === 1) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  board.addEventListener("touchend", e => {
    if (!touchStart || overlay.style.display === "flex") { touchStart = null; return; }
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 26) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, { passive: true });

  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (initialized && isGameActive("2048")) buildBoard(); }, 150);
  });

  game.start(updateBest);
})();

/* ============================
   JEU 3 — DÉMINEUR
   ============================ */
(function () {
  const game = initGame({
    id: "mine",
    els: {
      boardEl: "mine-board",
      leftEl: "mine-left",
      timeEl: "mine-time",
      modeBtn: "mine-mode-btn",
      restartBtn: "mine-restart",
      replayBtn: "mine-replay-btn",
      overlay: "mine-overlay",
      overlayTitle: "mine-overlay-title",
      overlayText: "mine-overlay-text",
      levelContainer: "mine-level-select",
      submitBlock: "mine-score-submit",
      leaderboardEl: "mine-leaderboard"
    },
    required: ["boardEl"],
    leaderboard: { format: e => fmtTime(e.score) },
    score: {
      input: "mine-name-input",
      button: "mine-save-score-btn",
      entry: name => ({ name, score: timer.seconds, level: cfg().label }),
      sort: (a, b) => a.score - b.score
    },
    levels: { onChange: level => { currentLevel = level; newGame(); } },
    clicks: {
      restartBtn: () => newGame(),
      replayBtn: () => newGame()
    }
  });
  if (!game) return;
  const {
    boardEl, leftEl, timeEl, modeBtn, restartBtn, replayBtn, overlay,
    overlayTitle, overlayText, levelContainer, submitBlock, leaderboardEl
  } = game.els;

  const LEVELS = {
    facile: { rows: 9, cols: 9, mines: 10, cell: 34, label: "Débutant" },
    moyen: { rows: 16, cols: 16, mines: 40, cell: 28, label: "Intermédiaire" },
    difficile: { rows: 16, cols: 30, mines: 99, cell: 24, label: "Expert" }
  };

  let currentLevel = "facile";
  let cells = [];      // données {mine, open, flag, n}
  let nodes = [];      // éléments DOM
  let flagMode = false;
  let started = false;
  let over = false;
  let flags = 0;
  let opened = 0;
  const timer = makeTimer(timeEl);

  function cfg() { return LEVELS[currentLevel]; }

  function neighbors(r, c) {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < cfg().rows && nc >= 0 && nc < cfg().cols) out.push([nr, nc]);
      }
    }
    return out;
  }

  function placeMines(safeR, safeC) {
    const c = cfg();
    let placed = 0;
    while (placed < c.mines) {
      const r = Math.floor(Math.random() * c.rows);
      const col = Math.floor(Math.random() * c.cols);
      const safe = (Math.abs(r - safeR) <= 1 && Math.abs(col - safeC) <= 1);
      if (cells[r][col].mine || safe) continue;
      cells[r][col].mine = true;
      placed++;
    }
    for (let r = 0; r < c.rows; r++) {
      for (let col = 0; col < c.cols; col++) {
        cells[r][col].n = neighbors(r, col).filter(([nr, nc]) => cells[nr][nc].mine).length;
      }
    }
  }

  function updateLeft() {
    leftEl.textContent = Math.max(cfg().mines - flags, 0);
  }

  function reveal(r, col) {
    const stack = [[r, col]];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const cell = cells[cr][cc];
      const node = nodes[cr][cc];
      if (cell.open || cell.flag) continue;
      cell.open = true;
      opened++;
      node.classList.add("is-open");
      if (cell.n > 0) {
        node.textContent = cell.n;
        node.classList.add("n" + cell.n);
      } else {
        neighbors(cr, cc).forEach(([nr, nc]) => {
          if (!cells[nr][nc].open && !cells[nr][nc].mine) stack.push([nr, nc]);
        });
      }
    }
  }

  function endGame(win, boomR, boomC) {
    over = true;
    timer.stop();
    const c = cfg();
    for (let r = 0; r < c.rows; r++) {
      for (let col = 0; col < c.cols; col++) {
        const node = nodes[r][col];
        if (cells[r][col].mine && !cells[r][col].flag) {
          node.classList.add("is-open", "is-mine");
          node.innerHTML = ART.get("bomb");
        }
        if (boomR === r && boomC === col) node.classList.add("is-boom");
      }
    }
    if (win) {
      const record = bestSet("mine", timer.seconds, false);
      SFX.win();
      overlayTitle.textContent = "Grille déminée !";
      overlayText.textContent = `Temps : ${fmtTime(timer.seconds)} · Record : ${fmtTime(record)}`;
      if (submitBlock) submitBlock.style.display = "flex";
    } else {
      SFX.lose();
      overlayTitle.textContent = "Boom !";
      overlayText.textContent = "Vous avez touché une mine. Relevez le défi à nouveau !";
    }
    overlay.style.display = "flex";
  }

  function openCell(r, col) {
    if (over) return;
    const cell = cells[r][col];
    if (cell.open) return;
    if (cell.flag) return;
    if (flagMode) { toggleFlag(r, col); return; }
    if (!started) {
      started = true;
      placeMines(r, col);
      timer.start();
    }
    if (cell.mine) {
      SFX.reveal();
      endGame(false, r, col);
      return;
    }
    reveal(r, col);
    SFX.reveal();
    const c = cfg();
    if (opened >= c.rows * c.cols - c.mines) endGame(true);
  }

  function toggleFlag(r, col) {
    if (over) return;
    const cell = cells[r][col];
    if (cell.open) return;
    cell.flag = !cell.flag;
    nodes[r][col].classList.toggle("is-flag", cell.flag);
    flags += cell.flag ? 1 : -1;
    updateLeft();
    SFX.click();
  }

  function newGame() {
    const c = cfg();
    timer.reset();
    over = false;
    started = false;
    flags = 0;
    opened = 0;
    cells = Array.from({ length: c.rows }, () =>
      Array.from({ length: c.cols }, () => ({ mine: false, open: false, flag: false, n: 0 })));
    nodes = [];
    overlay.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    boardEl.innerHTML = "";
    boardEl.style.setProperty("--cell", c.cell + "px");
    boardEl.style.gridTemplateColumns = `repeat(${c.cols}, var(--cell))`;
    for (let r = 0; r < c.rows; r++) {
      const row = [];
      for (let col = 0; col < c.cols; col++) {
        const node = el("button", "mine-cell");
        node.type = "button";
        node.addEventListener("click", () => openCell(r, col));
        node.addEventListener("contextmenu", e => { e.preventDefault(); toggleFlag(r, col); });
        boardEl.appendChild(node);
        row.push(node);
      }
      nodes.push(row);
    }
    updateLeft();
  }

  modeBtn.addEventListener("click", () => {
    flagMode = !flagMode;
    modeBtn.innerHTML = `<i class="fa-solid fa-flag"></i> Mode drapeau : ${flagMode ? "oui" : "non"}`;
    modeBtn.style.borderColor = flagMode ? "#c84646" : "";
    modeBtn.style.color = flagMode ? "#e08a8a" : "";
    SFX.click();
  });

  game.start(newGame);
})();

/* ============================
   JEU 4 — MEMORY
   ============================ */
(function () {
  const game = initGame({
    id: "memory",
    els: {
      grid: "memory-grid",
      movesEl: "memory-moves",
      timeEl: "memory-time",
      starsEl: "memory-stars",
      winMsgEl: "memory-win-message",
      restartBtn: "memory-restart-btn",
      levelContainer: "memory-level-select",
      submitBlock: "memory-score-submit",
      leaderboardEl: "memory-leaderboard"
    },
    required: ["grid"],
    leaderboard: { format: e => `${e.score} coups` },
    score: {
      input: "memory-name-input",
      button: "memory-save-score-btn",
      entry: name => ({ name, score: moves, level: LEVELS[currentLevel].label }),
      sort: (a, b) => a.score - b.score
    },
    levels: { onChange: level => { currentLevel = level; render(); } },
    clicks: { restartBtn: () => render() }
  });
  if (!game) return;
  const {
    grid, movesEl, timeEl, starsEl, winMsgEl, restartBtn,
    levelContainer, submitBlock, leaderboardEl
  } = game.els;

  const ICON_POOL = ["scissors", "razor", "comb", "brush", "clipper", "bottle", "spray", "cap"];
  const LEVELS = {
    facile: { pairs: 4, label: "Facile" },
    moyen: { pairs: 6, label: "Moyen" },
    difficile: { pairs: 8, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let moves = 0;
  let matched = 0;
  let totalPairs = 6;
  let firstCard = null;
  let secondCard = null;
  let lock = false;
  let started = false;
  const timer = makeTimer(timeEl);

  function buildDeck() {
    const cfg = LEVELS[currentLevel];
    totalPairs = cfg.pairs;
    const icons = ICON_POOL.slice(0, cfg.pairs);
    return shuffleArray([...icons, ...icons]);
  }

  function render() {
    grid.innerHTML = "";
    moves = 0;
    matched = 0;
    firstCard = null;
    secondCard = null;
    lock = false;
    started = false;
    timer.reset();
    movesEl.textContent = 0;
    starsEl.innerHTML = "";
    winMsgEl.style.display = "none";
    winMsgEl.textContent = "";
    if (submitBlock) submitBlock.style.display = "none";

    buildDeck().forEach(icon => {
      const card = el("div", "memory-card");
      card.dataset.icon = icon;
      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-back">★</div>
          <div class="memory-card-front">${ART.get(icon)}</div>
        </div>`;
      card.addEventListener("click", () => flipCard(card));
      grid.appendChild(card);
    });
  }

  function flipCard(card) {
    if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    if (!started) { started = true; timer.start(); }
    card.classList.add("flipped");
    SFX.flip();

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    lock = true;
    moves++;
    movesEl.textContent = moves;

    if (firstCard.dataset.icon === secondCard.dataset.icon) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      matched++;
      resetTurn();
      SFX.good();
      if (matched === totalPairs) {
        setTimeout(winGame, 350);
      }
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        SFX.bad();
        resetTurn();
      }, 750);
    }
  }

  function winGame() {
    timer.stop();
    const perfect = totalPairs;
    const rating = moves <= perfect + 2 ? 3 : (moves <= Math.ceil(perfect * 1.6) ? 2 : 1);
    starsEl.innerHTML = "";
    for (let i = 0; i < rating; i++) {
      const s = el("span", null, "★");
      starsEl.appendChild(s);
    }
    winMsgEl.textContent = `Paires retrouvées en ${moves} coups et ${fmtTime(timer.seconds)} !`;
    winMsgEl.style.display = "block";
    SFX.win();
    ACHV.evaluate(true);
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lock = false;
  }

  game.start(render);
})();

/* ============================
   JEU 5 — PUISSANCE 4
   ============================ */
(function () {
  const game = initGame({
    id: "connect4",
    els: {
      boardEl: "c4-board",
      statusEl: "c4-status",
      winsEl: "c4-wins",
      modeContainer: "c4-mode-select",
      levelContainer: "c4-level-select",
      overlay: "c4-overlay",
      overlayTitle: "c4-overlay-title",
      overlayText: "c4-overlay-text",
      replayBtn: "c4-replay-btn",
      restartBtn: "c4-restart",
      submitBlock: "c4-score-submit",
      leaderboardEl: "c4-leaderboard"
    },
    required: ["boardEl"],
    leaderboard: { format: e => `${e.score} victoire${e.score > 1 ? "s" : ""}` },
    score: {
      input: "c4-name-input",
      button: "c4-save-score-btn",
      entry: name => ({ name, score: wins, level: LEVELS[aiLevel] }),
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: lvl => { aiLevel = lvl; newGame(); } },
    clicks: {
      restartBtn: () => newGame(),
      replayBtn: () => newGame()
    }
  });
  if (!game) return;
  const {
    boardEl, statusEl, winsEl, modeContainer, levelContainer, overlay,
    overlayTitle, overlayText, replayBtn, restartBtn, submitBlock, leaderboardEl
  } = game.els;

  const COLS = 7;
  const ROWS = 6;
  const LEVELS = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };

  let mode = "ia";
  let aiLevel = "moyen";
  let mat = [];
  let current = 1; // 1 = joueur (or), 2 = ordinateur / rouge
  let over = true;
  let wins = 0;
  let colNodes = [];

  function dropRow(m, c) {
    for (let r = ROWS - 1; r >= 0; r--) if (m[r][c] === 0) return r;
    return -1;
  }

  function validCols(m) {
    const res = [];
    for (let c = 0; c < COLS; c++) if (m[0][c] === 0) res.push(c);
    return res;
  }

  function findWin(m) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = m[r][c];
        if (!p) continue;
        for (const [dr, dc] of dirs) {
          const r3 = r + dr * 3, c3 = c + dc * 3;
          if (r3 < 0 || r3 >= ROWS || c3 < 0 || c3 >= COLS) continue;
          if (m[r + dr][c + dc] === p && m[r + dr * 2][c + dc * 2] === p && m[r3][c3] === p) {
            return { player: p, cells: [[r, c], [r + dr, c + dc], [r + dr * 2, c + dc * 2], [r3, c3]] };
          }
        }
      }
    }
    return null;
  }

  function scoreBoard(m, player) {
    const opp = player === 1 ? 2 : 1;
    let s = 0;
    for (let r = 0; r < ROWS; r++) if (m[r][3] === player) s += 7;
    const windows = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c <= COLS - 4; c++) windows.push([m[r][c], m[r][c + 1], m[r][c + 2], m[r][c + 3]]);
    for (let c = 0; c < COLS; c++) for (let r = 0; r <= ROWS - 4; r++) windows.push([m[r][c], m[r + 1][c], m[r + 2][c], m[r + 3][c]]);
    for (let r = 0; r <= ROWS - 4; r++) for (let c = 0; c <= COLS - 4; c++) windows.push([m[r][c], m[r + 1][c + 1], m[r + 2][c + 2], m[r + 3][c + 3]]);
    for (let r = 3; r < ROWS; r++) for (let c = 0; c <= COLS - 4; c++) windows.push([m[r][c], m[r - 1][c + 1], m[r - 2][c + 2], m[r - 3][c + 3]]);
    for (const w of windows) {
      const pc = w.filter(v => v === player).length;
      const oc = w.filter(v => v === opp).length;
      const e = w.filter(v => v === 0).length;
      if (pc === 4) s += 100000;
      else if (pc === 3 && e === 1) s += 60;
      else if (pc === 2 && e === 2) s += 12;
      if (oc === 3 && e === 1) s -= 75;
      else if (oc === 2 && e === 2) s -= 10;
    }
    return s;
  }

  function minimax(m, depth, alpha, beta, maxing) {
    const win = findWin(m);
    if (win) return win.player === 2 ? 1000000 + depth : -1000000 - depth;
    const cols = validCols(m);
    if (!cols.length) return 0;
    if (depth === 0) return scoreBoard(m, 2);
    const order = [3, 2, 4, 1, 5, 0, 6].filter(c => cols.includes(c));
    if (maxing) {
      let best = -Infinity;
      for (const c of order) {
        const r = dropRow(m, c);
        m[r][c] = 2;
        best = Math.max(best, minimax(m, depth - 1, alpha, beta, false));
        m[r][c] = 0;
        alpha = Math.max(alpha, best);
        if (alpha >= beta) break;
      }
      return best;
    }
    let best = Infinity;
    for (const c of order) {
      const r = dropRow(m, c);
      m[r][c] = 1;
      best = Math.min(best, minimax(m, depth - 1, alpha, beta, true));
      m[r][c] = 0;
      beta = Math.min(beta, best);
      if (alpha >= beta) break;
    }
    return best;
  }

  function findImmediate(m, player) {
    for (const c of validCols(m)) {
      const r = dropRow(m, c);
      m[r][c] = player;
      const win = findWin(m);
      m[r][c] = 0;
      if (win) return c;
    }
    return null;
  }

  function aiChoose() {
    const cols = validCols(mat);
    if (!cols.length) return null;
    if (aiLevel === "facile") {
      return Math.random() < 0.75 ? cols[Math.floor(Math.random() * cols.length)] : (findImmediate(mat, 2) ?? cols[Math.floor(Math.random() * cols.length)]);
    }
    if (aiLevel === "moyen") {
      const win = findImmediate(mat, 2);
      if (win != null) return win;
      const block = findImmediate(mat, 1);
      if (block != null) return block;
      const best = cols.filter(c => c === 3);
      if (best.length && Math.random() < 0.6) return 3;
      return cols[Math.floor(Math.random() * cols.length)];
    }
    let bestScore = -Infinity;
    let bestCols = [];
    for (const c of [3, 2, 4, 1, 5, 0, 6].filter(x => cols.includes(x))) {
      const r = dropRow(mat, c);
      mat[r][c] = 2;
      const s = minimax(mat, 5, -Infinity, Infinity, false);
      mat[r][c] = 0;
      if (s > bestScore) { bestScore = s; bestCols = [c]; }
      else if (s === bestScore) bestCols.push(c);
    }
    return bestCols[Math.floor(Math.random() * bestCols.length)];
  }

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateWins() {
    winsEl.textContent = wins;
    if (submitBlock) submitBlock.style.display = mode === "ia" && wins > 0 ? "flex" : "none";
  }

  function finish(winResult) {
    over = true;
    colNodes.forEach(cn => { cn.disabled = true; });
    if (winResult) {
      winResult.cells.forEach(([r, c]) => {
        const slot = colNodes[c].children[r];
        if (slot) slot.classList.add("is-win");
      });
    }
    if (!winResult) {
      SFX.lose();
      overlayTitle.textContent = "Match nul !";
      overlayText.textContent = "La grille est complète sans vainqueur.";
    } else if (mode === "ia" && winResult.player === 1) {
      wins++;
      updateWins();
      SFX.win();
      overlayTitle.textContent = "Bravo, vous avez gagné !";
      overlayText.textContent = `Victoire n°${wins} contre l'ordinateur (${LEVELS[aiLevel].toLowerCase()}).`;
    } else if (mode === "ia" && winResult.player === 2) {
      SFX.lose();
      overlayTitle.textContent = "L'ordinateur gagne";
      overlayText.textContent = "Reprenez-vous et rejouez la manche !";
    } else {
      SFX.win();
      overlayTitle.textContent = `${winResult.player === 1 ? "Or" : "Rouge"} remporte la manche !`;
      overlayText.textContent = "Quelle belle partie.";
    }
    ACHV.evaluate(true);
    overlay.style.display = "flex";
  }

  function applyMove(c, player) {
    const r = dropRow(mat, c);
    if (r < 0) return false;
    mat[r][c] = player;
    const slot = colNodes[c].children[r];
    const disc = el("div", `c4-disc p${player}`);
    slot.appendChild(disc);
    SFX.drop();
    const win = findWin(mat);
    if (win) { finish(win); return true; }
    if (!validCols(mat).length) { finish(null); return true; }
    current = current === 1 ? 2 : 1;
    if (mode === "ia") {
      if (current === 2) {
        setStatus("L'ordinateur réfléchit…");
        colNodes.forEach(cn => { cn.disabled = true; });
        setTimeout(() => {
          if (over) return;
          const c2 = aiChoose();
          colNodes.forEach(cn => { cn.disabled = false; });
          if (c2 != null) applyMove(c2, 2);
        }, 480);
      } else {
        setStatus("À vous !");
        colNodes.forEach(cn => { cn.disabled = false; });
      }
    } else {
      setStatus(`Au tour de ${current === 1 ? "Or" : "Rouge"}`);
    }
    return true;
  }

  function newGame() {
    mat = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    current = 1;
    over = false;
    overlay.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    boardEl.innerHTML = "";
    colNodes = [];
    for (let c = 0; c < COLS; c++) {
      const col = el("button", "c4-col");
      col.type = "button";
      col.setAttribute("aria-label", `Colonne ${c + 1}`);
      const slots = [];
      for (let r = 0; r < ROWS; r++) {
        const slot = el("div", "c4-slot");
        col.appendChild(slot);
        slots.push(slot);
      }
      col.addEventListener("click", () => {
        if (over || (mode === "ia" && current === 2)) return;
        applyMove(c, current);
      });
      boardEl.appendChild(col);
      colNodes.push(col);
    }
    setStatus(mode === "ia" ? "À vous !" : "Au tour d'Or");
    updateWins();
  }

  if (modeContainer) {
    modeContainer.querySelectorAll(".level-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        modeContainer.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        SFX.click();
        mode = btn.dataset.mode;
        wins = 0;
        if (levelContainer) levelContainer.style.display = mode === "ia" ? "flex" : "none";
        newGame();
      });
    });
  }

  game.start(newGame);
})();

/* ============================
   JEU 6 — SUITE DE RYTHME (SIMON)
   ============================ */
(function () {
  const game = initGame({
    id: "simon",
    els: {
      board: { q: ".simon-board" },
      pads: { q: ".simon-pad", all: true },
      levelEl: "simon-level",
      bestEl: "simon-best",
      msgEl: "simon-message",
      startBtn: "simon-start-btn",
      levelContainer: "simon-level-select",
      submitBlock: "simon-score-submit",
      leaderboardEl: "simon-leaderboard"
    },
    required: ["board"],
    leaderboard: { format: e => `Niveau ${e.score}` },
    score: {
      input: "simon-name-input",
      button: "simon-save-score-btn",
      entry: name => ({ name, score: level, level: LEVELS[currentLevel].label }),
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: lvl => { currentLevel = lvl; } },
    // Si l'on revient au jeu pendant la diffusion de la suite, on la rejoue.
    onShow: () => { if (playing && !accepting) playSequence(); }
  });
  if (!game) return;
  const {
    board, pads, levelEl, bestEl, msgEl, startBtn,
    levelContainer, submitBlock, leaderboardEl
  } = game.els;

  const LEVELS = {
    facile: { flashDuration: 650, pause: 250, label: "Facile" },
    moyen: { flashDuration: 400, pause: 150, label: "Moyen" },
    difficile: { flashDuration: 250, pause: 90, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let sequence = [];
  let playerStep = 0;
  let level = 0;
  let accepting = false;
  let playing = false;
  let runId = 0;

  function refreshBest() {
    if (bestEl) bestEl.textContent = bestGet("simon", 0);
  }

  function flashPad(padIndex) {
    const cfg = LEVELS[currentLevel];
    return new Promise(resolve => {
      const pad = pads[padIndex];
      pad.classList.add("active");
      SFX.pad(padIndex);
      setTimeout(() => {
        pad.classList.remove("active");
        setTimeout(resolve, cfg.pause);
      }, cfg.flashDuration);
    });
  }

  async function playSequence() {
    const myRun = ++runId;
    accepting = false;
    pads.forEach(p => (p.disabled = true));
    msgEl.textContent = "Observez…";
    await new Promise(r => setTimeout(r, 500));
    for (const step of sequence) {
      if (myRun !== runId) return;
      await flashPad(step);
    }
    if (myRun !== runId) return;
    playerStep = 0;
    accepting = true;
    pads.forEach(p => (p.disabled = false));
    msgEl.textContent = "À vous de reproduire !";
  }

  function nextRound() {
    sequence.push(Math.floor(Math.random() * 4));
    level = sequence.length;
    levelEl.textContent = level;
    playSequence();
  }

  function endGame() {
    accepting = false;
    playing = false;
    runId++;
    pads.forEach(p => (p.disabled = true));
    const record = bestSet("simon", level, true);
    refreshBest();
    msgEl.textContent = `Perdu ! Vous avez atteint le niveau ${level} (record : ${record}).`;
    startBtn.textContent = "Rejouer";
    SFX.lose();
    if (level > 0 && submitBlock) submitBlock.style.display = "flex";
  }

  function handlePadClick(i) {
    if (!accepting) return;
    flashPad(i);
    if (i === sequence[playerStep]) {
      playerStep++;
      if (playerStep === sequence.length) {
        accepting = false;
        msgEl.textContent = "Bravo, niveau suivant !";
        SFX.good();
        setTimeout(() => { if (isGameActive("simon")) nextRound(); }, 900);
      }
    } else {
      endGame();
    }
  }

  pads.forEach((pad, i) => pad.addEventListener("click", () => handlePadClick(i)));

  startBtn.addEventListener("click", () => {
    sequence = [];
    level = 0;
    playing = true;
    levelEl.textContent = 0;
    startBtn.textContent = "Rejouer";
    if (submitBlock) submitBlock.style.display = "none";
    SFX.click();
    nextRound();
  });

  game.start(refreshBest);
})();

/* ============================
   JEU 7 — PENDU BARBIER
   ============================ */
(function () {
  const game = initGame({
    id: "hangman",
    els: {
      figureEl: "hangman-figure",
      wordEl: "hangman-word",
      hintEl: "hangman-hint",
      wrongEl: "hangman-wrong",
      keysEl: "hangman-keys",
      feedbackEl: "hangman-feedback",
      nextBtn: "hangman-next-btn",
      resultEl: "hangman-result",
      scoreTextEl: "hangman-score-text",
      restartBtn: "hangman-restart-btn",
      progressEl: "hangman-progress",
      errorsEl: "hangman-errors",
      levelContainer: "hangman-level-select",
      submitBlock: "hangman-score-submit",
      leaderboardEl: "hangman-leaderboard"
    },
    required: ["figureEl"],
    leaderboard: { format: e => `${e.score}%` },
    score: {
      input: "hangman-name-input",
      button: "hangman-save-score-btn",
      entry: name => ({ name, score: lastPct, level: LEVELS[currentLevel].label }),
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: level => { currentLevel = level; SFX.click(); newSeries(); } },
    clicks: {
      nextBtn: () => {
        index++;
        if (index >= rounds.length) lastPct = showResult();
        else startRound();
      },
      restartBtn: () => newSeries()
    }
  });
  if (!game) return;
  const {
    figureEl, wordEl, hintEl, wrongEl, keysEl, feedbackEl, nextBtn,
    resultEl, scoreTextEl, restartBtn, progressEl, errorsEl,
    levelContainer, submitBlock, leaderboardEl
  } = game.els;

  const WORDS = [
    { w: "mèche", hint: "Ce que le barbier coupe pour donner forme à la coiffure." },
    { w: "barbe", hint: "Pilosité du visage, taillée au rasoir ou à la tondeuse." },
    { w: "rasoir", hint: "Instrument du rasage traditionnel, dit coupe-chou." },
    { w: "peigne", hint: "Il guide les cheveux pendant la coupe aux ciseaux." },
    { w: "savon", hint: "Mousse appliquée avant le rasage, sous la serviette chaude." },
    { w: "cire", hint: "Produit coiffant à fini mat et tenue forte." },
    { w: "coupe", hint: "Le résultat d'une visite chez le barbier." },
    { w: "frange", hint: "Mèches situées sur le front." },
    { w: "nuque", hint: "Partie arrière du cou, souvent dégradée." },
    { w: "tempes", hint: "Côtés du front où débute le dégradé." },
    { w: "miroir", hint: "Le client s'y regarde à la fin de la coupe." },
    { w: "brosse", hint: "Elle retire les cheveux coupés du cou et des vêtements." },
    { w: "salon", hint: "Lieu où l'on coupe les cheveux." },
    { w: "rasage", hint: "Action d'enlever la barbe au rasoir." },
    { w: "pomade", hint: "Produit qui fixe en gardant une finition souple." },
    { w: "lames", hint: "Elles tranchent : dans les ciseaux comme dans les rasoirs." },
    { w: "ciseaux", hint: "Outil principal de la coupe aux cheveux longs." },
    { w: "barbier", hint: "Le professionnel de la coupe et du rasage." },
    { w: "dégradé", hint: "Longueur qui diminue progressivement vers les côtés." },
    { w: "moustache", hint: "Pilosité sous le nez, souvent dessinée au contour." },
    { w: "chignon", hint: "Cheveux réunis en arrière, parfois attachés." },
    { w: "coiffure", hint: "L'ensemble des cheveux mis en forme." },
    { w: "tondeuse", hint: "Elle raccourcit à numéro constant grâce aux sabots." },
    { w: "favoris", hint: "Ces barbes latérales qui cadrent le visage." },
    { w: "brushing", hint: "Séchage et coiffage faits en même temps." },
    { w: "contours", hint: "Lignes nettes dessinées autour de la barbe et des oreilles." },
    { w: "shampoing", hint: "Lavage des cheveux avant la coupe." },
    { w: "serviette", hint: "Chaude, elle ouvre les pores avant le rasage." },
    { w: "esthétique", hint: "L'art du soin et de la beauté." },
    { w: "papillotes", hint: "Petites papilles pour onduler les cheveux." },
    { w: "brillantine", hint: "Produit de coiffage qui donne brillance et tenue." },
    { w: "hydratant", hint: "Soin qui apporte de l'humidité aux cheveux ou à la peau." },
    { w: "savonnette", hint: "Petit savon de barbe, appliqué au pinceau." }
  ];

  const LEVELS = {
    facile: { min: 0, max: 6, count: 4, label: "Facile" },
    moyen: { min: 7, max: 8, count: 5, label: "Moyen" },
    difficile: { min: 9, max: 99, count: 5, label: "Difficile" }
  };
  const MAX_ERRORS = 6;
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  let currentLevel = "facile";
  let rounds = [];
  let index = 0;
  let found = 0;
  let errors = 0;
  let guessed = new Set();
  let currentLetters = [];
  let solved = false;
  let keyNodes = {};

  function normalize(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  function buildFigure() {
    figureEl.innerHTML = `
      <svg viewBox="0 0 120 140" aria-hidden="true">
        <path class="hm-base" d="M10 134 H112" />
        <path class="hm-base" d="M30 134 V10" />
        <path class="hm-base" d="M30 10 H86" />
        <path class="hm-base" d="M86 10 V26" />
        <circle class="hm-part" data-step="1" cx="86" cy="38" r="12" />
        <path class="hm-part" data-step="2" d="M86 50 V86" />
        <path class="hm-part" data-step="3" d="M86 60 L68 76" />
        <path class="hm-part" data-step="4" d="M86 60 L104 76" />
        <path class="hm-part" data-step="5" d="M86 86 L70 110" />
        <path class="hm-part" data-step="6" d="M86 86 L102 110" />
      </svg>`;
  }

  function updateFigure() {
    figureEl.querySelectorAll(".hm-part").forEach(part => {
      part.classList.toggle("on", Number(part.dataset.step) <= errors);
    });
  }

  function buildKeys() {
    keysEl.innerHTML = "";
    keyNodes = {};
    ALPHA.forEach(letter => {
      const btn = el("button", "hangman-key", letter);
      btn.type = "button";
      btn.addEventListener("click", () => guess(letter));
      keysEl.appendChild(btn);
      keyNodes[letter] = btn;
    });
  }

  function renderWord() {
    wordEl.innerHTML = currentLetters
      .map(l => (l ? `<span>${l}</span>` : '<span class="blank">·</span>'))
      .join("");
  }

  function updateChips() {
    progressEl.textContent = `${Math.min(index + 1, rounds.length)}/${rounds.length}`;
    errorsEl.textContent = `${errors}/${MAX_ERRORS}`;
  }

  function setFeedback(text, ok) {
    feedbackEl.textContent = text;
    feedbackEl.className = "quiz-feedback" + (ok ? " quiz-feedback-correct" : " quiz-feedback-incorrect");
  }

  function startRound() {
    const round = rounds[index];
    guessed = new Set();
    errors = 0;
    solved = false;
    currentLetters = normalize(round.w).split("").map(ch => (ch === " " ? " " : null));
    hintEl.textContent = `Indice : ${round.hint}`;
    setFeedback("", true);
    feedbackEl.className = "quiz-feedback";
    nextBtn.style.display = "none";
    buildKeys();
    renderWord();
    updateFigure();
    updateChips();
  }

  function guess(letter) {
    if (solved || guessed.has(letter) || index >= rounds.length) return;
    guessed.add(letter);
    const btn = keyNodes[letter];
    if (btn) btn.disabled = true;

    const target = normalize(rounds[index].w);
    if (target.includes(letter)) {
      if (btn) btn.classList.add("is-good");
      currentLetters = currentLetters.map((l, i) => (target[i] === letter ? letter : l));
      renderWord();
      SFX.good();
      if (!currentLetters.includes(null)) {
        solved = true;
        found++;
        setFeedback("Mot trouvé !", true);
        SFX.win();
        nextBtn.style.display = "inline-flex";
        nextBtn.textContent = index + 1 >= rounds.length ? "Voir mon score" : "Mot suivant";
      }
    } else {
      if (btn) btn.classList.add("is-bad");
      errors++;
      updateFigure();
      updateChips();
      SFX.bad();
      if (errors >= MAX_ERRORS) {
        solved = true;
        setFeedback(`Le mot était : ${rounds[index].w}`, false);
        currentLetters = normalize(rounds[index].w).split("").map(ch => (ch === " " ? " " : ch));
        renderWord();
        nextBtn.style.display = "inline-flex";
        nextBtn.textContent = index + 1 >= rounds.length ? "Voir mon score" : "Mot suivant";
      }
    }
  }

  function showResult() {
    const total = rounds.length;
    const pct = Math.round((found / total) * 100);
    resultEl.style.display = "flex";
    scoreTextEl.textContent = `${found}/${total} mots trouvés · ${pct}%`;
    if (pct >= 60) SFX.win(); else SFX.lose();
    ACHV.evaluate(true);
    if (submitBlock) submitBlock.style.display = "flex";
    return pct;
  }

  let lastPct = 0;

  function newSeries() {
    const cfg = LEVELS[currentLevel];
    const pool = WORDS.filter(w => {
      const len = normalize(w.w).length;
      return len >= cfg.min && len <= cfg.max;
    });
    rounds = shuffleArray(pool.length ? pool : WORDS).slice(0, cfg.count);
    index = 0;
    found = 0;
    lastPct = 0;
    resultEl.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    startRound();
  }

  document.addEventListener("keydown", e => {
    if (!isGameActive("hangman") || index >= rounds.length) return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    const letter = (e.key || "").toUpperCase();
    if (letter.length === 1 && ALPHA.includes(letter)) guess(letter);
  });

  buildFigure();
  game.start(newSeries);
})();

/* ============================
   JEU 8 — QUIZ CULTURE COIFFURE
   ============================ */
(function () {
  const game = initGame({
    id: "quiz",
    els: {
      questionEl: "quiz-question",
      progressEl: "quiz-progress",
      barEl: "quiz-bar",
      optionsEl: "quiz-options",
      feedbackEl: "quiz-feedback",
      nextBtn: "quiz-next-btn",
      questionBlock: "quiz-question-block",
      resultEl: "quiz-result",
      scoreTextEl: "quiz-score-text",
      restartBtn: "quiz-restart-btn",
      levelContainer: "quiz-level-select",
      timerEl: "quiz-timer",
      scoreChip: "quiz-score",
      streakChip: "quiz-streak",
      submitBlock: "quiz-score-submit",
      leaderboardEl: "quiz-leaderboard",
      artEl: "quiz-art"
    },
    required: ["questionEl"],
    leaderboard: { format: e => `${e.score}%` },
    score: {
      input: "quiz-name-input",
      button: "quiz-save-score-btn",
      entry: name => {
        const pct = Math.round((score / QUESTIONS.length) * 100);
        return { name, score: pct, level: LEVELS[currentLevel].label };
      },
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: level => { currentLevel = level; initQuiz(); } },
    clicks: {
      nextBtn: () => nextQuestion(),
      restartBtn: () => initQuiz()
    }
  });
  if (!game) return;
  const {
    questionEl, progressEl, barEl, optionsEl, feedbackEl, nextBtn,
    questionBlock, resultEl, scoreTextEl, restartBtn, levelContainer,
    timerEl, scoreChip, streakChip, submitBlock, leaderboardEl, artEl
  } = game.els;

  /* Liens contextuels affichés sous l'illustration de chaque question */
  const TOPIC_LINKS = {
    coupe: { href: "index.html#galerie", label: "Voir nos réalisations en galerie" },
    barbe: { href: "index.html#galerie", label: "Voir les tailles de barbe en galerie" },
    outils: { href: "index.html#why", label: "Notre approche pro, en détail" },
    produits: { href: "index.html#infos", label: "Voir les soins & tarifs" },
    histoire: { href: "index.html", label: "Découvrir Star Barbershop" },
    salon: { href: "index.html#reservation", label: "Réserver un créneau au salon" }
  };
  function linkFor(topic) { return TOPIC_LINKS[topic] || TOPIC_LINKS.histoire; }

  const QUESTIONS_SOURCE = [
    { question: "Quel outil traditionnel utilise-t-on pour un rasage à l'ancienne ?", options: ["Le rasoir électrique", "Le rasoir coupe-chou", "Les ciseaux à effiler", "La tondeuse"], correct: 1, fact: "Le rasoir coupe-chou (ou rasoir droit) est l'outil emblématique du rasage traditionnel en salon de barbier.", art: "razor", topic: "outils" },
    { question: 'Que désigne une coupe "dégradé" (fade) ?', options: ["Une coupe où la longueur diminue progressivement vers les côtés", "Une coupe totalement rasée", "Une coupe avec une seule longueur uniforme", "Une technique de coloration"], correct: 0, fact: "Le dégradé fait diminuer progressivement la longueur des cheveux, généralement du haut vers les tempes et la nuque.", art: "head:fade", topic: "coupe" },
    { question: "D'où vient historiquement le poteau rayé rouge, blanc et bleu des barbershops ?", options: ["Il symbolisait à l'origine les bandages et la pratique de la saignée", "Il représentait les couleurs nationales françaises", "C'était un simple choix décoratif sans signification", "Il indiquait les horaires d'ouverture"], correct: 0, fact: "Au Moyen Âge, les barbiers pratiquaient aussi de petits actes chirurgicaux : le rouge symbolise le sang, le blanc les bandages.", art: "pole", topic: "histoire" },
    { question: "Quel est le rôle principal d'une taille de barbe chez le barbier ?", options: ["Uniquement raccourcir la longueur", "Structurer, définir les contours et entretenir la pilosité", "Colorer la barbe", "Faire pousser la barbe plus vite"], correct: 1, fact: "Une bonne taille structure la forme du visage en dessinant des contours nets, bien au-delà du simple raccourcissement.", art: "head:crew,full", topic: "barbe" },
    { question: 'Qu\'est-ce qu\'un "buzz cut" ?', options: ["Une coupe très courte et uniforme, réalisée à la tondeuse", "Une coiffure avec beaucoup de volume", "Une technique de tressage", "Une coupe réservée aux enfants uniquement"], correct: 0, fact: "Le buzz cut est une coupe uniforme très courte, rapide à réaliser et facile à entretenir.", art: "head:buzz", topic: "coupe" },
    { question: "Pourquoi applique-t-on une serviette chaude avant un rasage ?", options: ["Pour le confort uniquement", "Pour ouvrir les pores et assouplir les poils, pour un rasage plus net", "Pour désinfecter la peau", "Pour accélérer la pousse des cheveux"], correct: 1, fact: "La chaleur dilate les pores et ramollit les poils, ce qui permet un rasage plus doux et plus précis.", art: "towel", topic: "outils" },
    { question: "À quoi servent les sabots (guides de coupe) sur une tondeuse ?", options: ["Garantir une longueur uniforme sur toute la zone coupée", "Couper uniquement la barbe", "Colorer les cheveux", "Laver les cheveux"], correct: 0, fact: "Les sabots se clipsent sur la tondeuse et garantissent une longueur constante, du numéro 0 à des tailles plus longues.", art: "clipper", topic: "outils" },
    { question: 'Que signifie l\'expression "coupe entretenue" ?', options: ["Une coupe qu'il faut refaire tous les jours", "Une coupe pensée pour garder une bonne allure plusieurs semaines entre deux rendez-vous", "Une coupe très courte uniquement", "Une coupe réalisée uniquement au rasoir"], correct: 1, fact: "Une coupe bien entretenue garde une silhouette nette même quand les cheveux repoussent.", art: "calendar", topic: "coupe" },
    { question: "À quoi sert le peigne lors d'une coupe aux ciseaux ?", options: ["À soulever et guider la mèche pour une coupe régulière", "Uniquement à démêler avant le shampoing", "À appliquer la cire coiffante", "À masser le cuir chevelu"], correct: 0, fact: "Le peigne guide la mèche à la bonne tension et au bon angle, ce qui permet une coupe régulière.", art: "comb", topic: "outils" },
    { question: "Quel type de produit coiffant donne souvent un fini mat et une tenue forte ?", options: ["La cire (ou pâte) coiffante", "L'après-shampoing", "L'huile essentielle", "Le shampoing sec uniquement"], correct: 0, fact: "La cire ou la pâte coiffante offre une tenue forte avec un fini mat, très utilisée pour structurer coupes courtes et dégradés.", art: "wax", topic: "produits" },
    { question: "Quel sabot raccourcit les cheveux au plus court ?", options: ["Le numéro 0", "Le numéro 3", "Le numéro 6", "Le numéro 9"], correct: 0, fact: "Le numéro 0 coupe à quelques millimètres : c'est la base des dégradés très courts et des buzz cuts.", art: "clipper", topic: "outils" },
    { question: "Qu'appelle-t-on le « contour » d'une coupe ?", options: ["Le tracé net des limites : tempes, nuque, alentours de la barbe", "La couleur des pointes", "Le volume sur le dessus", "Le shampoing utilisé"], correct: 0, fact: "Le contour (ou détail) est ce tracé précis, souvent finalisé au coupe-chou, qui donne un rendu net et soigné.", art: "razor", topic: "outils" },
    { question: "Quel accessoire chauffe-t-on pour lisser ou onduler les cheveux ?", options: ["Le peigne en corne", "La pince (lisseuse ou boucleuse)", "Le coupe-chou", "Le blaireau"], correct: 1, fact: "La pince utilise la chaleur pour lisser, onduler ou refriser — toujours avec une protection thermique.", art: "pin", topic: "produits" },
    { question: "À quoi sert un après-shampoing ?", options: ["À nourrir et détangler après le lavage", "À laver les cheveux", "À remplacer le shampoing", "À colorer les cheveux"], correct: 0, fact: "L'après-shampoing referme la fibre, facilite le démêlage et apporte brillance et souplesse.", art: "drop", topic: "produits" },
    { question: "Quel accessoire applique la mousse de rasage ?", options: ["Le blaireau", "Le peigne", "Les ciseaux", "Le miroir"], correct: 0, fact: "Le blaireau, en mousse dense et chaude, soulève les poils et prépare parfaitement la peau au rasoir.", art: "brush", topic: "outils" },
    { question: "Que signifie « skin fade » ?", options: ["Un dégradé qui descend jusqu'à la peau, sans longueur visible", "Une coupe avec une mèche colorée", "Un rasage complet de la tête", "Une coupe dégradée uniquement sur la nuque"], correct: 0, fact: "Le skin fade (dégradé américain) part du numéro 0 à la peau et progresse sans transition visible vers le dessus.", art: "head:fade", topic: "coupe" },
    { question: "À quelle fréquence entretient-on généralement un dégradé court ?", options: ["Tous les 2 à 3 semaines", "Tous les 6 mois", "Une fois par an", "Jamais, il tient toute la vie"], correct: 0, fact: "Un dégradé court perd sa netteté en 2 à 3 semaines : un passage régulier au salon garde le trait net.", art: "clock", topic: "coupe" },
    { question: "Quel produit applique-t-on avant d'utiliser une pince chaude ?", options: ["Une cire forte", "Un protecteur thermique", "Un shampoing sec", "Du gel-fixage"], correct: 1, fact: "Le protecteur thermique forme un bouclier autour de la fibre et évite la déshydratation causée par la chaleur.", art: "pin", topic: "produits" },
    { question: "Qu'est-ce qu'une « raie » ?", options: ["Une séparation des cheveux sur le côté ou au milieu", "Une mèche décolorée", "Une coupe très courte sur les côtés", "Un accessoire de coiffage"], correct: 0, fact: "La raie structure toute une coiffure : elle se trace au peigne et guide le sens de la matière.", art: "head:sidepart", topic: "coupe" },
    { question: "Comment règle-t-on la hauteur d'un fauteuil de barbier ?", options: ["Avec un bouton électronique", "Avec une pompe hydraulique ou un pied à pédale", "Il est fixe", "En soulevant le client"], correct: 1, fact: "Le fauteuil de barbier monte à la pompe hydraulique pour placer le client à la bonne hauteur de travail.", art: "chair", topic: "outils" },
    { question: "Quel accessoire humidifie les cheveux pendant la coupe ?", options: ["Le vaporisateur (spray d'eau)", "Le peigne", "Le miroir", "Le coupe-chou"], correct: 0, fact: "Un léger voile d'eau souple les fibres : la coupe est plus précise et la mèche se guide parfaitement.", art: "spray", topic: "outils" },
    { question: "Quelle est la différence entre un shampoing fort et un shampoing doux ?", options: ["Le premier nettoie en profondeur, le second convient à un usage fréquent", "Le premier est coloré, le second est blanc", "Il n'y a aucune différence", "Le doux sert uniquement à la barbe"], correct: 0, fact: "Le shampoing fort décape (produits, résidus), le shampoing doux respecte le cuir chevelu au quotidien.", art: "bottle", topic: "produits" },
    { question: "Que désigne un « crew cut » ?", options: ["Une coupe courte et simple, inspirée des équipages militaires", "Une coupe longue attachée", "Un dégradé avec crête iroquoise", "Une coupe réservée aux enfants"], correct: 0, fact: "Le crew cut est pratique et net : court sur les côtés, légèrement plus long sur le dessus, idéal pour l'entretien.", art: "head:crew", topic: "coupe" },
    { question: "Qu'est-ce qu'un « taper » ?", options: ["Un dégradé discret qui s'arrête avant les tempes", "Une coupe rasée de près", "Un accessoire pour la barbe", "Une coloration végétale"], correct: 0, fact: "Le taper est un dégradé subtil : les contours restent nets, la transition est douce, tout est très naturel.", art: "head:taper", topic: "coupe" },
    { question: "Comment appelle-t-on le style où le dessus est long et les côtés rasés ?", options: ["L'undercut", "Le buzz cut", "Le crew cut", "Le taper"], correct: 0, fact: "L'undercut oppose un dessus généreux à des côtés très courts : le contraste fait toute la personnalité de la coupe.", art: "head:undercut", topic: "coupe" },
    { question: "Quelle coupe a donné naissance aux coupes militaires courtes et nettes ?", options: ["Le buzz cut", "Le pompadour", "L'afro", "Le slick back"], correct: 0, fact: "Le buzz cut, né dans les armées, reste la coupe de l'entretien minimal : une seule longueur, zéro coiffage.", art: "cap", topic: "coupe" },
    { question: "À quoi sert une huile à barbe ?", options: ["À nourrir, assouplir les poils et apporter du brillant", "À raccourcir la barbe", "À colorer les poils blancs", "À laver la barbe"], correct: 0, fact: "Quelques gouttes d'huile assouplissent le poil, apaisent la peau en dessous et facilitent le coiffage.", art: "drop", topic: "barbe" },
    { question: "Combien de temps garde-t-on généralement une coupe pointue ?", options: ["4 à 6 semaines", "2 ans", "48 heures", "Jusqu'à la prochaine couleur"], correct: 0, fact: "Les pointes se scindent avec le temps : un passage toutes les 4 à 6 semaines garde la coupe saine.", art: "calendar", topic: "coupe" },
    { question: "En quoi le barbier diffère-t-il du coiffeur moderne ?", options: ["Il est spécialisé homme, barbe et rasage traditionnel", "Il ne coupe que les enfants", "Il travaille uniquement avec des ciseaux", "Il n'existe plus aujourd'hui"], correct: 0, fact: "Le barbier est expert des coupes masculines, des barbes et du rasage à l'ancienne — un vrai métier de détail.", art: "crown", topic: "histoire" },
    { question: "Où se trouve le salon Star Barbershop ?", options: ["12 rue du Maréchal Foch à Mourmelon-le-Grand", "Place du Marché à Reims", "Boulevard de la Libération à Paris", "Avenue des Champs à Épernay"], correct: 0, fact: "Le salon vous accueille au cœur de Mourmelon-le-Grand, au 12 rue du Maréchal Foch.", art: "pole", topic: "salon" },
    { question: "Qui est le barbier du salon Star Barbershop ?", options: ["Moise, spécialiste des dégradés et des styles modernes", "Un robot coiffure", "Une équipe de 20 personnes", "Le propriétaire du bâtiment"], correct: 0, fact: "Moise, gérant et barbier du salon, est reconnu pour ses dégradés et ses styles modernes.", art: "head:crew,goatee", topic: "salon" },
    { question: "Comment réserver un créneau chez Star Barbershop ?", options: ["En ligne depuis le site, ou par téléphone / e-mail", "Uniquement sur place", "Par courrier postal", "Impossible, c'est sans rendez-vous uniquement"], correct: 0, fact: "Le bouton Réservation du site vous emmène directement au planning : quelques secondes suffisent.", art: "calendar", topic: "salon" },
    { question: "Qu'est-ce qu'un « quiff » ?", options: ["Une mèche avant relevée en volume sur le dessus", "Une coupe totalement rasée", "Une barbe très longue", "Un chignon pour cheveux longs"], correct: 0, fact: "Le quiff pousse la matière vers le haut et vers l'avant : un volume assumé, tenu par une cire souple.", art: "head:quiff", topic: "coupe" },
    { question: "Quelle coupe est un grand classique des textures bouclées ?", options: ["L'afro", "Le slick back", "Le taper", "Le crew cut"], correct: 0, fact: "L'afro assume le volume naturel : on travaille la matière en boucle plutôt que de la contraindre.", art: "head:afro", topic: "coupe" }
  ];

  const LEVELS = {
    facile: { count: 6, timer: 0, label: "Facile" },
    moyen: { count: 10, timer: 0, label: "Moyen" },
    difficile: { count: 12, timer: 15, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let QUESTIONS = [];
  let index = 0;
  let score = 0;
  let streak = 0;
  let bestStreak = 0;
  let countdownInterval = null;

  function buildRound(source) {
    const correctText = source.options[source.correct];
    const shuffledOptions = shuffleArray(source.options);
    return { question: source.question, options: shuffledOptions, correct: shuffledOptions.indexOf(correctText), fact: source.fact, art: source.art, topic: source.topic };
  }

  function setBar(pct) {
    if (barEl) barEl.style.width = pct + "%";
  }

  function clearCountdown() {
    clearInterval(countdownInterval);
    if (timerEl) {
      timerEl.textContent = "";
      timerEl.classList.remove("is-low");
    }
  }

  function startCountdown() {
    const cfg = LEVELS[currentLevel];
    if (!cfg.timer || !timerEl) return;
    let remaining = cfg.timer;
    timerEl.textContent = `⏱ ${remaining}s`;
    countdownInterval = setInterval(() => {
      remaining--;
      timerEl.textContent = `⏱ ${remaining}s`;
      timerEl.classList.toggle("is-low", remaining <= 5);
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        selectAnswer(-1);
      }
    }, 1000);
  }

  function renderQuestion() {
    clearCountdown();
    const q = QUESTIONS[index];
    progressEl.textContent = `Question ${index + 1}/${QUESTIONS.length}`;
    setBar((index / QUESTIONS.length) * 100);
    questionEl.textContent = q.question;
    if (artEl) {
      const l = linkFor(q.topic);
      artEl.innerHTML = (q.art ? ART.get(q.art) : "") +
        "<figcaption><a class='quiz-art-link' href='" + l.href + "'>" + l.label + "</a></figcaption>";
    }
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback";
    nextBtn.style.display = "none";

    q.options.forEach((opt, i) => {
      const btn = el("button", "quiz-option", opt);
      btn.addEventListener("click", () => selectAnswer(i));
      optionsEl.appendChild(btn);
    });

    startCountdown();
  }

  function selectAnswer(i) {
    clearCountdown();
    const q = QUESTIONS[index];
    const buttons = optionsEl.querySelectorAll(".quiz-option");
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add("correct");
      if (idx === i && i !== q.correct) btn.classList.add("incorrect");
    });
    setBar(((index + 1) / QUESTIONS.length) * 100);

    if (i === q.correct) {
      score++;
      streak++;
      if (streak > bestStreak) bestStreak = streak;
      scoreChip.textContent = score;
      streakChip.textContent = streak;
      feedbackEl.textContent = `Bonne réponse ! ${q.fact}`;
      feedbackEl.classList.add("quiz-feedback-correct");
      SFX.good();
    } else {
      streak = 0;
      streakChip.textContent = 0;
      feedbackEl.textContent = (i === -1 ? "Temps écoulé ! " : "Pas tout à fait. ") + q.fact;
      feedbackEl.classList.add("quiz-feedback-incorrect");
      SFX.bad();
    }
    nextBtn.style.display = "inline-flex";
  }

  function nextQuestion() {
    index++;
    if (index >= QUESTIONS.length) showResult();
    else renderQuestion();
  }

  function showResult() {
    clearCountdown();
    questionBlock.style.display = "none";
    resultEl.style.display = "flex";
    const pct = Math.round((score / QUESTIONS.length) * 100);
    scoreTextEl.textContent = `Score : ${score}/${QUESTIONS.length} · ${pct}% · meilleure série : ${bestStreak}`;
    if (pct >= 60) SFX.win(); else SFX.lose();
    ACHV.evaluate(true);
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function initQuiz() {
    const cfg = LEVELS[currentLevel];
    QUESTIONS = shuffleArray(QUESTIONS_SOURCE).slice(0, cfg.count).map(buildRound);
    index = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    scoreChip.textContent = 0;
    streakChip.textContent = 0;
    resultEl.style.display = "none";
    questionBlock.style.display = "flex";
    if (submitBlock) submitBlock.style.display = "none";
    renderQuestion();
  }

  game.start(initQuiz);
})();

/* ============================
   JEU 9 — PUZZLE GLISSANT
   ============================ */
(function () {
  const game = initGame({
    id: "puzzle",
    els: {
      boardEl: "puzzle-board",
      movesEl: "puzzle-moves",
      timeEl: "puzzle-time",
      winMsgEl: "puzzle-win-message",
      restartBtn: "puzzle-restart-btn",
      levelContainer: "puzzle-level-select",
      submitBlock: "puzzle-score-submit",
      leaderboardEl: "puzzle-leaderboard",
      pickerEl: "puzzle-picker"
    },
    required: ["boardEl"],
    leaderboard: { format: e => `${e.score} coups` },
    score: {
      input: "puzzle-name-input",
      button: "puzzle-save-score-btn",
      entry: name => ({ name, score: moves, level: LEVELS[currentLevel].label }),
      sort: (a, b) => a.score - b.score
    },
    levels: { onChange: level => { currentLevel = level; shuffle(); } },
    clicks: { restartBtn: () => shuffle() },
    // Le panneau est masqué au chargement (largeur mesurée = 0) : on redessine
    // dès qu'il devient visible, et au redimensionnement de la fenêtre.
    onShow: () => render()
  });
  if (!game) return;
  const {
    boardEl, movesEl, timeEl, winMsgEl, restartBtn,
    levelContainer, submitBlock, leaderboardEl, pickerEl
  } = game.els;

  /* Illustrations vectorielles originales (600×600) créées pour le jeu */
  const IMAGES = [
    { src: "image/puzzle-devanture.svg", label: "La devanture la nuit" },
    { src: "image/puzzle-outils.svg", label: "Les outils du barbier" },
    { src: "image/puzzle-poteau.svg", label: "Le poteau tournant" },
    { src: "image/puzzle-coupes.svg", label: "Les 6 coupes signature" },
    { src: "image/puzzle-fauteuil.svg", label: "Le fauteuil & le miroir" },
    { src: "image/puzzle-barbe.svg", label: "Le rituel barbe" }
  ];

  const LEVELS = {
    facile: { size: 3, label: "Facile (3×3)" },
    moyen: { size: 4, label: "Moyen (4×4)" },
    difficile: { size: 5, label: "Difficile (5×5)" },
    expert: { size: 6, label: "Expert (6×6)" }
  };

  let currentLevel = "facile";
  let currentImage = IMAGES[0];
  const imgCache = {};
  let bg = { w: 320, h: 320, ox: 0, oy: 0 };
  let SIZE = 3;
  let tiles = [];
  let moves = 0;
  let started = false;
  let won = false;
  const timer = makeTimer(timeEl);

  function solvedArray() {
    const arr = [];
    for (let i = 1; i < SIZE * SIZE; i++) arr.push(i);
    arr.push(0);
    return arr;
  }

  function isSolved() {
    const solved = solvedArray();
    return tiles.every((v, i) => v === solved[i]);
  }

  /* Préchargement de la photo choisie + cadrage « cover » (sans déformation) */
  function requestImage() {
    const src = currentImage.src;
    if (imgCache[src]) return;
    const rec = { ready: false, w: 0, h: 0 };
    imgCache[src] = rec;
    const im = new Image();
    im.onload = () => { rec.ready = true; rec.w = im.naturalWidth; rec.h = im.naturalHeight; render(); };
    im.onerror = () => { rec.ready = true; render(); };
    im.src = src;
  }

  function computeBg(w) {
    const rec = imgCache[currentImage.src];
    if (!rec || !rec.ready || !rec.w || !rec.h) { bg = { w: w, h: w, ox: 0, oy: 0 }; return; }
    const scale = Math.max(w / rec.w, w / rec.h);
    const bw = rec.w * scale;
    const bh = rec.h * scale;
    bg = { w: bw, h: bh, ox: (bw - w) / 2, oy: (bh - w) / 2 };
  }

  function renderPicker() {
    if (!pickerEl) return;
    pickerEl.innerHTML = "";
    IMAGES.forEach(img => {
      const b = el("button", "puzzle-thumb" + (img.src === currentImage.src ? " active" : ""));
      b.type = "button";
      b.title = img.label;
      b.setAttribute("aria-label", "Photo : " + img.label);
      const im = document.createElement("img");
      im.src = img.src;
      im.alt = img.label;
      im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", () => {
        if (currentImage.src === img.src) return;
        currentImage = img;
        SFX.click();
        renderPicker();
        shuffle();
      });
      pickerEl.appendChild(b);
    });
  }

  function render() {
    const w = boardEl.clientWidth;
    if (!w) return;
    requestImage();
    computeBg(w);
    const TILE = w / SIZE;
    boardEl.innerHTML = "";
    tiles.forEach((value, pos) => {
      if (value === 0) return;
      const row = Math.floor(pos / SIZE);
      const col = pos % SIZE;
      const tile = el("div", "puzzle-tile");
      tile.style.width = TILE + "px";
      tile.style.height = TILE + "px";
      tile.style.top = row * TILE + "px";
      tile.style.left = col * TILE + "px";
      tile.style.backgroundImage = "url('" + currentImage.src + "')";
      tile.style.backgroundSize = bg.w + "px " + bg.h + "px";
      const originalRow = Math.floor((value - 1) / SIZE);
      const originalCol = (value - 1) % SIZE;
      tile.style.backgroundPosition = `-${originalCol * TILE + bg.ox}px -${originalRow * TILE + bg.oy}px`;
      tile.addEventListener("click", () => tryMove(pos));
      boardEl.appendChild(tile);
    });
  }

  function blankPos() {
    return tiles.indexOf(0);
  }

  function tryMove(pos) {
    if (won) return;
    const bp = blankPos();
    const row = Math.floor(pos / SIZE), col = pos % SIZE;
    const brow = Math.floor(bp / SIZE), bcol = bp % SIZE;
    if (Math.abs(row - brow) + Math.abs(col - bcol) !== 1) return;
    [tiles[pos], tiles[bp]] = [tiles[bp], tiles[pos]];
    moves++;
    if (!started) { started = true; timer.start(); }
    movesEl.textContent = moves;
    SFX.drop();
    render();
    checkWin();
  }

  function checkWin() {
    if (!isSolved()) return;
    won = true;
    timer.stop();
    winMsgEl.textContent = `Bravo ! Puzzle résolu en ${moves} coups et ${fmtTime(timer.seconds)}.`;
    winMsgEl.style.display = "block";
    SFX.win();
    ACHV.evaluate(true);
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function shuffle() {
    SIZE = LEVELS[currentLevel].size;
    tiles = solvedArray();
    let bp = tiles.indexOf(0);
    let lastPos = -1;
    const shuffleMoves = SIZE * SIZE * 40;
    for (let i = 0; i < shuffleMoves; i++) {
      const row = Math.floor(bp / SIZE), col = bp % SIZE;
      const neighbors = [];
      if (row > 0) neighbors.push(bp - SIZE);
      if (row < SIZE - 1) neighbors.push(bp + SIZE);
      if (col > 0) neighbors.push(bp - 1);
      if (col < SIZE - 1) neighbors.push(bp + 1);
      const options = neighbors.filter(n => n !== lastPos);
      const next = options[Math.floor(Math.random() * options.length)];
      [tiles[bp], tiles[next]] = [tiles[next], tiles[bp]];
      lastPos = bp;
      bp = next;
    }
    if (isSolved()) {
      const bp2 = tiles.indexOf(0);
      const row = Math.floor(bp2 / SIZE);
      const swap = row > 0 ? bp2 - SIZE : bp2 + SIZE;
      [tiles[bp2], tiles[swap]] = [tiles[swap], tiles[bp2]];
    }
    moves = 0;
    started = false;
    won = false;
    timer.reset();
    movesEl.textContent = 0;
    winMsgEl.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    render();
  }

  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(render, 150);
  });

  game.start(() => { renderPicker(); shuffle(); });
})();

/* ============================
   JEU 10 — TROUVE LA BONNE COUPE
   ============================ */
(function () {
  const game = initGame({
    id: "haircut",
    els: {
      requestEl: "haircut-request",
      progressEl: "haircut-progress",
      barEl: "haircut-bar",
      optionsEl: "haircut-options",
      feedbackEl: "haircut-feedback",
      nextBtn: "haircut-next-btn",
      blockEl: "haircut-block",
      resultEl: "haircut-result",
      scoreTextEl: "haircut-score-text",
      restartBtn: "haircut-restart-btn",
      levelContainer: "haircut-level-select",
      timerEl: "haircut-timer",
      scoreChip: "haircut-score",
      submitBlock: "haircut-score-submit",
      leaderboardEl: "haircut-leaderboard",
      avatarEl: "haircut-avatar"
    },
    required: ["requestEl"],
    leaderboard: { format: e => `${e.score}%` },
    score: {
      input: "haircut-name-input",
      button: "haircut-save-score-btn",
      entry: name => {
        const pct = Math.round((score / rounds.length) * 100);
        return { name, score: pct, level: LEVELS[currentLevel].label };
      },
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: level => { currentLevel = level; restart(); } },
    clicks: {
      nextBtn: () => next(),
      restartBtn: () => restart()
    }
  });
  if (!game) return;
  const {
    requestEl, progressEl, barEl, optionsEl, feedbackEl, nextBtn,
    blockEl, resultEl, scoreTextEl, restartBtn, levelContainer,
    timerEl, scoreChip, submitBlock, leaderboardEl, avatarEl
  } = game.els;

  const STYLE_POOL = ["Undercut", "Buzz cut", "Slick back", "Dégradé (fade)", "Crew cut", "Pompadour", "Taper fade", "Coupe + barbe", "Quiff (mèche)", "Afro", "Crâne rasé", "Crâne + barbe"];

  const ROUNDS_SOURCE = [
    { text: "Je veux que ce soit très court sur les côtés et à l'arrière, mais que je garde de la longueur sur le dessus pour pouvoir coiffer avec du produit.", correct: "Undercut", fact: "L'undercut garde un dessus mobile sur des côtés courts : la séparation franche fait tout le style." },
    { text: "Rasez tout à la même longueur courte, je veux un entretien minimum.", correct: "Buzz cut", fact: "Le buzz cut : une seule longueur partout, zéro coiffage, entretien minimal." },
    { text: "Une coupe classique et nette, avec la raie sur le côté et les cheveux plaqués en arrière.", correct: "Slick back", fact: "Le slick back plaque la matière en arrière avec une tenue brillante : un classique intemporel." },
    { text: "Un dégradé propre sur les côtés qui se fond bien, avec un peu de longueur sur le dessus, style moderne.", correct: "Dégradé (fade)", fact: "Le fade fait disparaître la longueur progressivement jusqu'à la peau : aucun démarquage visible." },
    { text: "Quelque chose d'assez court partout, facile à entretenir, mais pas complètement rasé.", correct: "Crew cut", fact: "Le crew cut reste court et net sur le dessus : ni rasé, ni volumineux." },
    { text: "Je veux du volume généreux sur le dessus, brossé vers l'arrière, un style rétro assumé.", correct: "Pompadour", fact: "Le pompadour monte haut sur le front puis repousse la matière vers l'arrière : la signature des années 50." },
    { text: "Un dégradé très progressif et discret, presque invisible, qui garde une allure naturelle.", correct: "Taper fade", fact: "Le taper dégrade doucement sans jamais aller au rasoir : le rendu reste très naturel." },
    { text: "J'aimerais une barbe bien taillée et structurée qui accompagne ma coupe, avec des contours nets.", correct: "Coupe + barbe", fact: "Ici la barbe fait partie de la coupe : contours alignés et transition soignée entre visage et cheveux." },
    { text: "Je veux une mèche qui se relève vers le haut et l'avant, du volume sur le dessus, sans toucher trop court sur les côtés.", correct: "Quiff (mèche)", fact: "Le quiff relève la mèche avant : du volume maximum, tenu par une cire souple." },
    { text: "Je veux garder mon volume naturel en boucle, bien arrondi, sans jamais l'écraser.", correct: "Afro", fact: "L'afro travaille la matière naturelle en un volume homogène et parfaitement arrondi." },
    { text: "Allez-y, rasez-moi la tête, je veux le plus simple possible, sans barbe.", correct: "Crâne rasé", fact: "Le crâne rasé s'entretient au rasoir : une tête lisse, des contours propres, rien d'autre." },
    { text: "Rasez mes cheveux, mais gardez une barbe pleine et structurée pour équilibrer le visage.", correct: "Crâne + barbe", fact: "Crâne net + barbe pleine : le contraste structure le visage et la mâchoire." },
    { text: "Je passe à un mariage : je veux une coiffure classique, lisse et élégante, qui ne bougera pas toute la soirée.", correct: "Slick back", fact: "Pour un événement, le slick back fixé à la cire reste impeccable des heures durant." },
    { text: "C'est un peu trop long sur les côtés : redonnez-moi une forme courte et pratique sans tout raser.", correct: "Crew cut", fact: "Le crew cut est la réponse aux coupes courtes qui restent coiffées sans effort." },
    { text: "Grande occasion ce soir : je veux du volume spectaculaire au dessus, façon vintage assumée.", correct: "Pompadour", fact: "Le pompadour se travaille au peigne et à la cire pour un volume qui tient toute la soirée." },
    { text: "Je sors de l'eau tout l'été : je veux une coupe ultra courte, uniforme, qui sèche en deux minutes.", correct: "Buzz cut", fact: "Le buzz cut est le roi des étés : une seule longueur, aucune maintenance." }
  ];

  const LEVELS = {
    facile: { optionCount: 3, timer: 0, label: "Facile" },
    moyen: { optionCount: 4, timer: 0, label: "Moyen" },
    difficile: { optionCount: 5, timer: 10, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let rounds = [];
  let index = 0;
  let score = 0;
  let countdownInterval = null;

  function buildRounds() {
    const cfg = LEVELS[currentLevel];
    rounds = shuffleArray(ROUNDS_SOURCE).map(r => {
      const distractors = shuffleArray(STYLE_POOL.filter(s => s !== r.correct)).slice(0, cfg.optionCount - 1);
      return { text: r.text, correct: r.correct, fact: r.fact, options: shuffleArray([r.correct, ...distractors]) };
    });
  }

  function setBar(pct) {
    if (barEl) barEl.style.width = pct + "%";
  }

  function clearCountdown() {
    clearInterval(countdownInterval);
    if (timerEl) {
      timerEl.textContent = "";
      timerEl.classList.remove("is-low");
    }
  }

  function startCountdown() {
    const cfg = LEVELS[currentLevel];
    if (!cfg.timer || !timerEl) return;
    let remaining = cfg.timer;
    timerEl.textContent = `⏱ ${remaining}s`;
    countdownInterval = setInterval(() => {
      remaining--;
      timerEl.textContent = `⏱ ${remaining}s`;
      timerEl.classList.toggle("is-low", remaining <= 4);
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        selectOption(null);
      }
    }, 1000);
  }

  function renderRound() {
    clearCountdown();
    const r = rounds[index];
    progressEl.textContent = `Client ${index + 1}/${rounds.length}`;
    setBar((index / rounds.length) * 100);
    requestEl.textContent = `« ${r.text} »`;
    if (avatarEl) avatarEl.innerHTML = ART.client(index + Math.floor(Math.random() * 3));
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback";
    nextBtn.style.display = "none";

    r.options.forEach(opt => {
      const btn = el("button", "quiz-option option-card");
      btn.innerHTML = "<span class='option-art'>" + ART.style(opt) + "</span><span class='option-name'>" + opt + "</span>";
      btn.addEventListener("click", () => selectOption(opt));
      optionsEl.appendChild(btn);
    });

    startCountdown();
  }

  function selectOption(opt) {
    clearCountdown();
    const r = rounds[index];
    const buttons = optionsEl.querySelectorAll(".quiz-option");
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === r.correct) btn.classList.add("correct");
      if (btn.textContent === opt && opt !== r.correct) btn.classList.add("incorrect");
    });
    setBar(((index + 1) / rounds.length) * 100);
    if (opt === r.correct) {
      score++;
      scoreChip.textContent = score;
      feedbackEl.textContent = `Le client repart satisfait ! ${r.fact}`;
      feedbackEl.classList.add("quiz-feedback-correct");
      SFX.good();
    } else {
      feedbackEl.textContent = (opt === null ? "Temps écoulé — " : "") + `La bonne réponse était : ${r.correct}. ${r.fact}`;
      feedbackEl.classList.add("quiz-feedback-incorrect");
      SFX.bad();
    }
    nextBtn.style.display = "inline-flex";
    nextBtn.textContent = index + 1 >= rounds.length ? "Voir mon score" : "Client suivant";
  }

  function next() {
    index++;
    if (index >= rounds.length) showResult();
    else renderRound();
  }

  function showResult() {
    clearCountdown();
    blockEl.style.display = "none";
    resultEl.style.display = "flex";
    const pct = Math.round((score / rounds.length) * 100);
    scoreTextEl.textContent = `Clients satisfaits : ${score}/${rounds.length} · ${pct}%`;
    if (pct >= 60) SFX.win(); else SFX.lose();
    ACHV.evaluate(true);
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function restart() {
    index = 0;
    score = 0;
    scoreChip.textContent = 0;
    buildRounds();
    resultEl.style.display = "none";
    blockEl.style.display = "flex";
    if (submitBlock) submitBlock.style.display = "none";
    renderRound();
  }

  game.start(() => { buildRounds(); renderRound(); });
})();

/* ============================
   JEU 11 — MIME EXPRESS (à plusieurs)
   ============================ */
(function () {
  const game = initGame({
    id: "mime",
    els: {
      teamsEl: "mime-teams",
      turnEl: "mime-turn",
      teamEl: "mime-team",
      timeEl: "mime-time",
      categoryEl: "mime-category",
      wordEl: "mime-word",
      revealBtn: "mime-reveal-btn",
      startBtn: "mime-start-btn",
      guessBtn: "mime-guess-btn",
      passBtn: "mime-pass-btn",
      nextBtn: "mime-next-btn",
      messageEl: "mime-message",
      resultEl: "mime-result",
      scoreTextEl: "mime-score-text",
      restartBtn: "mime-restart-btn",
      levelContainer: "mime-level-select",
      submitBlock: "mime-score-submit",
      leaderboardEl: "mime-leaderboard"
    },
    required: ["teamsEl"],
    leaderboard: { format: e => e.score + " pts" },
    score: {
      input: "mime-name-input",
      button: "mime-save-score-btn",
      entry: name => ({
        name,
        score: teams.reduce((m, t) => Math.max(m, t.points), 0),
        level: teamsCount + " équipes"
      }),
      sort: (a, b) => b.score - a.score
    },
    levels: {
      onChange: level => {
        teamsCount = Math.max(2, Math.min(4, parseInt(level, 10) || 2));
        restart();
      }
    },
    clicks: {
      startBtn: () => startTurn(),
      nextBtn: () => nextTurn(),
      restartBtn: () => restart()
    },
    rawClicks: { revealBtn: revealWord },
    onShow: () => { if (resultEl.style.display !== "flex") renderTeams(); }
  });
  if (!game) return;
  const {
    teamsEl, turnEl, teamEl, timeEl, categoryEl, wordEl, revealBtn,
    startBtn, guessBtn, passBtn, nextBtn, messageEl, resultEl,
    scoreTextEl, restartBtn, levelContainer, submitBlock, leaderboardEl
  } = game.els;

  const TURN_SECONDS = 45;

  const DECK = [
    { c: "Au salon", w: "Un barbier qui rase son client" },
    { c: "Au salon", w: "Le poteau tournant" },
    { c: "Au salon", w: "Le fauteuil qui s'incline" },
    { c: "Au salon", w: "Le blaireau qui mousse" },
    { c: "Au salon", w: "Une coupe ratée sous la tondeuse" },
    { c: "Au salon", w: "Le rasoir qui vibre" },
    { c: "Au salon", w: "La serviette chaude sur le visage" },
    { c: "Au salon", w: "Le client qui découvre sa coupe" },
    { c: "Animaux", w: "Un chat qui fait ses ongles" },
    { c: "Animaux", w: "Un singe qui mange une banane" },
    { c: "Animaux", w: "Un canard qui nage" },
    { c: "Animaux", w: "Un dinosaure qui marche" },
    { c: "Animaux", w: "Un fantôme qui effraie" },
    { c: "Métiers", w: "Un pompier qui éteint un feu" },
    { c: "Métiers", w: "Un facteur qui sonne à la porte" },
    { c: "Métiers", w: "Un chirurgien concentré" },
    { c: "Métiers", w: "Un peintre en plein mur" },
    { c: "Métiers", w: "Un policier qui fait stop" },
    { c: "Sports", w: "Le tournoi de ping-pong" },
    { c: "Sports", w: "Un gardien de but" },
    { c: "Sports", w: "Le plongeon de haut vol" },
    { c: "Sports", w: "Le vélo sans mains" },
    { c: "Sports", w: "Le kara-té qui frappe" },
    { c: "Sports", w: "L'arbitre qui siffle un penalty" },
    { c: "Nourriture", w: "Manger des spaghettis" },
    { c: "Nourriture", w: "Boire un café brûlant" },
    { c: "Nourriture", w: "Ouvrir une bouteille pétillante" },
    { c: "Nourriture", w: "Le gâteau d'anniversaire" },
    { c: "Films & séries", w: "Un super-héros qui vole" },
    { c: "Films & séries", w: "Le robot du futur" },
    { c: "Films & séries", w: "Tom qui court après Jerry" },
    { c: "Films & séries", w: "Le méchant qui ricane" },
    { c: "Expressions", w: "Avoir la pêche" },
    { c: "Expressions", w: "Couper la poisse" },
    { c: "Expressions", w: "Se donner un coup de main" },
    { c: "Expressions", w: "Être sur un nuage" }
  ];

  let teamsCount = 2;
  let teams = [];
  let teamIdx = 0;
  let deck = [];
  let card = null;
  let playing = false;
  let iv = null;
  let timeLeft = TURN_SECONDS;

  function buildTeams() {
    teams = [];
    for (let i = 0; i < teamsCount; i++) teams.push({ name: "Équipe " + (i + 1), points: 0 });
    teamIdx = 0;
  }

  function buildDeck() { deck = shuffleArray(DECK); }

  function maskWord() {
    wordEl.textContent = "· · · · ·";
    wordEl.classList.add("is-hidden");
  }

  function drawCard() {
    if (!deck.length) buildDeck();
    card = deck.pop();
    categoryEl.textContent = card.c;
    maskWord();
  }

  function revealWord() {
    if (!card) return;
    wordEl.textContent = card.w;
    wordEl.classList.remove("is-hidden");
    SFX.reveal();
  }

  function renderTeams() {
    teamsEl.innerHTML = teams.map((t, i) =>
      "<div class='mime-team-card" + (i === teamIdx ? " active" : "") + "'>" +
      "<span class='mime-team-name'>" + t.name + "</span>" +
      "<strong class='mime-team-score'>" + t.points + "</strong></div>").join("");
    if (turnEl) turnEl.textContent = (teamIdx + 1) + "/" + teamsCount;
    if (teamEl) teamEl.textContent = teams[teamIdx].name;
  }

  function stopTimer() { if (iv) clearInterval(iv); iv = null; }

  function setMessage(text, kind) {
    if (!messageEl) return;
    messageEl.textContent = text || "";
    messageEl.className = "quiz-feedback" + (kind ? " " + kind : "");
  }

  function idleTurn() {
    playing = false;
    stopTimer();
    timeLeft = TURN_SECONDS;
    if (timeEl) timeEl.textContent = timeLeft + "s";
    maskWord();
    if (startBtn) startBtn.style.display = "inline-flex";
    if (revealBtn) revealBtn.style.display = "inline-flex";
    if (guessBtn) guessBtn.style.display = "none";
    if (passBtn) passBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
  }

  function startTurn() {
    playing = true;
    timeLeft = TURN_SECONDS;
    if (timeEl) timeEl.textContent = timeLeft + "s";
    if (startBtn) startBtn.style.display = "none";
    if (guessBtn) guessBtn.style.display = "inline-flex";
    if (passBtn) passBtn.style.display = "inline-flex";
    setMessage("À " + teams[teamIdx].name + " de mimer : affichez le mot, puis lancez le chrono !");
    stopTimer();
    iv = setInterval(() => {
      timeLeft--;
      if (timeEl) timeEl.textContent = Math.max(timeLeft, 0) + "s";
      if (timeLeft > 0 && timeLeft <= 5) SFX.tick();
      if (timeLeft <= 0) endTurn();
    }, 1000);
  }

  function endTurn() {
    if (!playing) return;
    playing = false;
    stopTimer();
    if (guessBtn) guessBtn.style.display = "none";
    if (passBtn) passBtn.style.display = "none";
    if (revealBtn) revealBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "inline-flex";
    setMessage("Temps écoulé pour " + teams[teamIdx].name + " — " + teams[teamIdx].points + " point(s) !", "quiz-feedback-incorrect");
    SFX.bad();
  }

  function showResult() {
    stopTimer();
    playing = false;
    const best = teams.reduce((m, t) => Math.max(m, t.points), -Infinity);
    const winners = teams.filter(t => t.points === best).map(t => t.name);
    scoreTextEl.textContent = winners.length > 1
      ? "Égalité parfaite : " + winners.join(" & ") + " finissent à " + best + " points !"
      : "🏆 " + winners[0] + " l'emporte avec " + best + " points !";
    resultEl.style.display = "flex";
    if (startBtn) startBtn.style.display = "none";
    if (revealBtn) revealBtn.style.display = "none";
    setMessage("Bravo pour ce tour de mime — la salle a ri !", "quiz-feedback-correct");
    SFX.win();
    ACHV.evaluate(true);
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function nextTurn() {
    teamIdx++;
    if (teamIdx >= teamsCount) { showResult(); return; }
    renderTeams();
    drawCard();
    idleTurn();
    setMessage("À vous, " + teams[teamIdx].name + " : lancez le chrono quand tout le monde est prêt !");
    SFX.flip();
  }

  function restart() {
    stopTimer();
    buildTeams();
    buildDeck();
    drawCard();
    renderTeams();
    idleTurn();
    if (resultEl) resultEl.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    setMessage("L'équipe 1 s'apprête à mimez — lancez le chrono quand vous êtes prêt !");
  }

  if (guessBtn) {
    guessBtn.addEventListener("click", () => {
      if (!playing) return;
      SFX.good();
      teams[teamIdx].points++;
      renderTeams();
      drawCard();
      setMessage("Bien vu ! +1 point pour " + teams[teamIdx].name + " — mot suivant !", "quiz-feedback-correct");
    });
  }

  if (passBtn) {
    passBtn.addEventListener("click", () => {
      if (!playing) return;
      SFX.click();
      drawCard();
      setMessage("Mot suivant, sans point !");
    });
  }

  game.start(restart);
})();

/* ============================
   JEU 12 — BLAGUES & ANECDOTES (à plusieurs)
   ============================ */
(function () {
  const game = initGame({
    id: "jokes",
    els: {
      setupEl: "joke-setup",
      tagEl: "joke-tag",
      punchEl: "joke-punchline",
      revealBtn: "jokes-reveal-btn",
      ratingEl: "joke-rating",
      nextBtn: "jokes-next-btn",
      progressEl: "jokes-progress",
      scoreEl: "jokes-score",
      laughsEl: "jokes-laughs",
      resultEl: "jokes-result",
      scoreTextEl: "jokes-score-text",
      restartBtn: "jokes-restart-btn",
      levelContainer: "jokes-level-select",
      submitBlock: "jokes-score-submit",
      leaderboardEl: "jokes-leaderboard"
    },
    required: ["setupEl"],
    leaderboard: { format: e => e.score + " pts" },
    score: {
      input: "jokes-name-input",
      button: "jokes-save-score-btn",
      entry: name => ({ name, score, level: MODES[currentLevel].label }),
      sort: (a, b) => b.score - a.score
    },
    levels: { onChange: level => { currentLevel = level; restart(); } },
    clicks: {
      nextBtn: () => { index++; renderCard(); },
      restartBtn: () => restart()
    },
    rawClicks: { revealBtn: reveal },
    onShow: () => { if (resultEl.style.display !== "flex") renderCard(); }
  });
  if (!game) return;
  const {
    setupEl, tagEl, punchEl, revealBtn, ratingEl, nextBtn, progressEl,
    scoreEl, laughsEl, resultEl, scoreTextEl, restartBtn,
    levelContainer, submitBlock, leaderboardEl
  } = game.els;

  const CARDS = [
    { type: "Blague", text: "Le client dit au barbier : « C'est la première fois que je viens chez vous ? »", punch: "« Non… c'est la première fois que je repars ! »" },
    { type: "Blague", text: "Pourquoi le barbier fait-il toujours des blagues courtes ?", punch: "Parce qu'il a le sens du raccourci." },
    { type: "Blague", text: "Le client : « Étonnez-moi avec ma coiffure ! »", punch: "« Très bien : je vous laisse la barbe pousser. »" },
    { type: "Blague", text: "Qu'est-ce qu'un cheveu rebelle ?", punch: "Un cheveu qui refuse de suivre la raie." },
    { type: "Blague", text: "Combien de barbiers faut-il pour changer une ampoule ?", punch: "Aucun : on leur demande seulement de monter le volume." },
    { type: "Blague", text: "Le maître apprenti lui dit : « Tu as fini ce client ? »", punch: "« Oui, il est méconnaissable ! » — « C'est exactement le but. »" },
    { type: "Blague", text: "Quel est le sport préféré d'un dégradé bien fondu ?", punch: "Le fondu enchaîné." },
    { type: "Blague", text: "Le client arrive en retard : « Désolé, mes cheveux ont pris du temps. »", punch: "« Pas de souci, la tondeuse ne s'est pas pressée non plus. »" },
    { type: "Blague", text: "Pourquoi la tondeuse n'a jamais de secret ?", punch: "Elle dit tout à voix haute." },
    { type: "Blague", text: "Le client demande : « Faites-moi une coupe qui va avec ma personnalité. »", punch: "« Dans ce cas, on va plutôt retoucher la coupe… »" },
    { type: "Blague", text: "Que dit un cheveu qui tombe au sol ?", punch: "« Je m'étais dit que c'était le moment de prendre mon envol. »" },
    { type: "Blague", text: "Pourquoi les ciseaux sont-ils toujours calmes ?", punch: "Parce qu'ils savent couper la poisse." },
    { type: "Blague", text: "Le client demande un dégradé « invisible ».", punch: "« Pas de souci : personne ne verra rien… sauf ma facture. »" },
    { type: "Blague", text: "Qu'est-ce qu'un barbier fatigue après 40 clients ?", punch: "Ses mochetés… de rires ! Il passe la journée à faire rire tout le monde." },
    { type: "Anecdote", text: "Le poteau tournant blanc, rouge et bleu vient du Moyen Âge.", punch: "Le rouge évoquait le sang, le bleu les veines, le blanc les pansements : les barbiers étaient aussi chirurgiens." },
    { type: "Anecdote", text: "Le mot « barbier » vient du latin barba.", punch: "Il signifie tout simplement… barbe !" },
    { type: "Anecdote", text: "Le blaireau doit son nom au pinceau.", punch: "Les poils les plus doux pour étaler la mousse venaient autrefois de la queue du blaireau." },
    { type: "Anecdote", text: "En Égypte antique, se raser était un signe de pureté.", punch: "Les prêtres se rasaient entièrement le crâne et portaient des perruques." },
    { type: "Anecdote", text: "Le mot « coiffeur » vient aussi d'un vieux mot latin.", punch: "« Coife » désignait un bonnet ou un casque : la coiffe qui protège les cheveux." },
    { type: "Anecdote", text: "Le barbier-chirurgien a longtemps été le médecin du peuple.", punch: "Il extrayait les dents et soignait les plaies, avant d'être interdit de chirurgie au XIXe siècle." },
    { type: "Anecdote", text: "Le fauteuil de barbier est un vrai bijou mécanique.", punch: "Il s'incline, s'élève et pivote grâce à un mécanisme hydraulique popularisé au XIXe siècle." },
    { type: "Anecdote", text: "Le dégradé moderne doit tout à la tondeuse.", punch: "Les lames réglables ont rendu possibles les fondus progressifs qui font le style d'aujourd'hui." },
    { type: "Anecdote", text: "Le mot « shampoing » vient du hindi.", punch: "« Chāmpo » signifiait masser la tête, bien avant l'invention des bouteilles de gel." },
    { type: "Anecdote", text: "Le peigne est l'un des plus vieux outils de beauté.", punch: "On en taillait déjà de l'ivoire dans l'Antiquité, avant même l'invention des ciseaux modernes." },
    { type: "Anecdote", text: "Au XIXe siècle, on offrait des cheveux à ses proches.", punch: "Des mèches tressées servaient de souvenir, un peu comme une photo avant l'instantanée." },
    { type: "Anecdote", text: "Porter ou raser sa barbe a toujours été un message.", punch: "Selon les époques, la barbe signalait le rang, le métier ou les convictions de celui qui la portait." },
    { type: "Anecdote", text: "Le salon de barbier est d'abord un lieu de discussion.", punch: "Sport, actualités, vie du quartier : ici aussi, on repart avec une coupe et deux ou trois histoires." },
    { type: "Anecdote", text: "La barbe continue de vieillir avec vous.", punch: "Elle blanchit comme les cheveux : autant en profiter tant qu'elle est encore bien colorée !" }
  ];

  const MODES = {
    facile: { label: "Blagues", filter: "Blague", count: 8 },
    moyen: { label: "Anecdotes", filter: "Anecdote", count: 8 },
    difficile: { label: "Mélange", filter: null, count: 12 }
  };

  let currentLevel = "facile";
  let deck = [];
  let index = 0;
  let score = 0;
  let laughs = 0;

  function buildDeck() {
    const cfg = MODES[currentLevel];
    const pool = cfg.filter ? CARDS.filter(c => c.type === cfg.filter) : CARDS.slice();
    deck = shuffleArray(pool).slice(0, Math.min(cfg.count, pool.length));
    index = 0;
    score = 0;
    laughs = 0;
    if (scoreEl) scoreEl.textContent = 0;
    if (laughsEl) laughsEl.textContent = 0;
  }

  function renderCard() {
    if (index >= deck.length) { showResult(); return; }
    const card = deck[index];
    if (tagEl) tagEl.textContent = card.type;
    setupEl.textContent = card.text;
    if (punchEl) { punchEl.textContent = card.punch; punchEl.style.display = "none"; }
    if (revealBtn) revealBtn.style.display = "inline-flex";
    if (ratingEl) ratingEl.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (resultEl) resultEl.style.display = "none";
    if (progressEl) progressEl.textContent = (index + 1) + "/" + deck.length;
  }

  function reveal() {
    if (punchEl) punchEl.style.display = "block";
    if (revealBtn) revealBtn.style.display = "none";
    if (ratingEl) ratingEl.style.display = "flex";
    SFX.reveal();
  }

  function rate(points) {
    score += points;
    if (points >= 5) laughs++;
    if (scoreEl) scoreEl.textContent = score;
    if (laughsEl) laughsEl.textContent = laughs;
    SFX.good();
    if (ratingEl) ratingEl.style.display = "none";
    if (nextBtn) nextBtn.style.display = "inline-flex";
    nextBtn.textContent = index + 1 >= deck.length ? "Voir mon score" : "Carte suivante";
  }

  function showResult() {
    const max = deck.length * 5;
    const pct = max ? Math.round((score / max) * 100) : 0;
    let verdict = "Un petit rire, mais un rire quand même !";
    if (pct >= 70) verdict = "Fou rire garanti, la salle a explosé !";
    else if (pct >= 40) verdict = "Bon rire, l'ambiance est lancée !";
    if (scoreTextEl) scoreTextEl.textContent = "Points rire : " + score + "/" + max + " · " + verdict;
    if (resultEl) resultEl.style.display = "flex";
    if (nextBtn) nextBtn.style.display = "none";
    if (pct >= 40) SFX.win(); else SFX.lose();
    ACHV.evaluate(true);
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function restart() {
    buildDeck();
    renderCard();
    if (submitBlock) submitBlock.style.display = "none";
  }

  if (ratingEl) {
    ratingEl.querySelectorAll(".joke-rate").forEach(btn => {
      btn.addEventListener("click", () => { rate(Number(btn.dataset.points) || 1); });
    });
  }

  game.start(restart);
})();
