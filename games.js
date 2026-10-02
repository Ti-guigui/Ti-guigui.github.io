/* =========================================================
   STAR BARBERSHOP — SALLE DE JEUX
   Noyau commun (onglets, son, classements, utilitaires)
   puis 10 mini-jeux (chacun isolé derrière une garde).
   ========================================================= */

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
}

gameTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    SFX.click();
    activateTab(tab);
  });
});

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

/* ---------------- Effacer tous les scores ---------------- */
(function () {
  const resetBtn = document.getElementById("reset-scores-btn");
  if (!resetBtn) return;
  resetBtn.addEventListener("click", () => {
    if (!window.confirm("Effacer tous les scores et records enregistrés sur cet appareil ?")) return;
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.indexOf("starbarbershop_leaderboard_") === 0 || k.indexOf("starbarbershop_best_") === 0) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) { /* ignore */ }
    lbRenderers.forEach(fn => fn());
    SFX.bad();
  });
})();

/* ============================
   JEU 1 — ATTRAPE LA MÈCHE (réflexes)
   ============================ */
(function () {
  const catchArea = document.getElementById("catch-area");
  if (!catchArea) return;

  const scoreEl = document.getElementById("catch-score");
  const livesEl = document.getElementById("catch-lives");
  const comboEl = document.getElementById("catch-combo");
  const startBtn = document.getElementById("catch-start-btn");
  const overlay = document.getElementById("catch-overlay");
  const levelContainer = document.getElementById("catch-level-select");
  const submitBlock = document.getElementById("catch-score-submit");
  const leaderboardEl = document.getElementById("catch-leaderboard");

  const NORMAL_ICONS = ["✂️", "🧴", "💇", "🪒", "💈", "🧢"];
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
    livesEl.textContent = "❤️".repeat(Math.max(lives, 0));
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
    if (r < 0.13) return { type: "bomb", icon: "💣" };
    if (r < 0.20) return { type: "heart", icon: "❤️" };
    if (r < 0.33) return { type: "star", icon: "⭐" };
    return { type: "normal", icon: NORMAL_ICONS[Math.floor(Math.random() * NORMAL_ICONS.length)] };
  }

  function spawnObject() {
    if (state !== "running" || !isGameActive("catch")) return;
    const cfg = LEVELS[currentLevel];
    const item = pickItem();
    const node = el("span", "falling-object", item.icon);
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
        pop(px, py, "-1 ❤️", "#e08a8a");
      } else if (obj.type === "heart") {
        lives = Math.min(lives + 1, 5);
        SFX.good();
        pop(px, py, "+1 ❤️", "#6fcf8f");
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

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("catch"), e => `${e.score} pt${e.score > 1 ? "s" : ""}`);
  }

  attachScoreSubmit("catch-name-input", "catch-save-score-btn", name => {
    const list = lbSave("catch", { name, score, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score} pt${e.score > 1 ? "s" : ""}`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  setupLevelSelector(levelContainer, level => { currentLevel = level; });

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

  lbRenderers.push(renderLeaderboard);
  updateHud();
  renderLeaderboard();
})();

/* ============================
   JEU 2 — 2048
   ============================ */
(function () {
  const board = document.getElementById("g2048-board");
  if (!board) return;

  const scoreEl = document.getElementById("g2048-score");
  const bestEl = document.getElementById("g2048-best");
  const overlay = document.getElementById("g2048-overlay");
  const overlayTitle = document.getElementById("g2048-overlay-title");
  const overlayText = document.getElementById("g2048-overlay-text");
  const continueBtn = document.getElementById("g2048-continue-btn");
  const replayBtn = document.getElementById("g2048-replay-btn");
  const undoBtn = document.getElementById("g2048-undo");
  const restartBtn = document.getElementById("g2048-restart");
  const levelContainer = document.getElementById("g2048-level-select");
  const submitBlock = document.getElementById("g2048-score-submit");
  const leaderboardEl = document.getElementById("g2048-leaderboard");

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
    const record = bestSet("g2048", score, true);
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

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("g2048"), e => `${e.score} pts`);
  }

  attachScoreSubmit("g2048-name-input", "g2048-save-score-btn", name => {
    const list = lbSave("g2048", { name, score, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score} pts`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  setupLevelSelector(levelContainer, level => { currentLevel = level; newGame(); });

  document.addEventListener("keydown", e => {
    if (!isGameActive("2048") || overlay.style.display === "flex") return;
    const map = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
    const dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    move(dir);
  });

  document.querySelectorAll("#g2048-controls .dpad-btn").forEach(btn => {
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

  undoBtn.addEventListener("click", undo);
  restartBtn.addEventListener("click", () => { SFX.click(); newGame(); });
  replayBtn.addEventListener("click", () => { SFX.click(); newGame(); });
  continueBtn.addEventListener("click", () => { SFX.click(); overlay.style.display = "none"; });

  onGameShown("2048", () => {
    if (!initialized || grid.every(row => row.every(v => !v))) {
      initialized = true;
      newGame();
    } else {
      buildBoard();
    }
  });

  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (initialized && isGameActive("2048")) buildBoard(); }, 150);
  });

  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  updateBest();
})();

/* ============================
   JEU 3 — DÉMINEUR
   ============================ */
(function () {
  const boardEl = document.getElementById("mine-board");
  if (!boardEl) return;

  const leftEl = document.getElementById("mine-left");
  const timeEl = document.getElementById("mine-time");
  const modeBtn = document.getElementById("mine-mode-btn");
  const restartBtn = document.getElementById("mine-restart");
  const replayBtn = document.getElementById("mine-replay-btn");
  const overlay = document.getElementById("mine-overlay");
  const overlayTitle = document.getElementById("mine-overlay-title");
  const overlayText = document.getElementById("mine-overlay-text");
  const levelContainer = document.getElementById("mine-level-select");
  const submitBlock = document.getElementById("mine-score-submit");
  const leaderboardEl = document.getElementById("mine-leaderboard");

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
          node.textContent = "💣";
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

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("mine"), e => fmtTime(e.score));
  }

  attachScoreSubmit("mine-name-input", "mine-save-score-btn", name => {
    const list = lbSave("mine", { name, score: timer.seconds, level: cfg().label }, (a, b) => a.score - b.score);
    lbRender(leaderboardEl, list, e => fmtTime(e.score));
    if (submitBlock) submitBlock.style.display = "none";
  });

  setupLevelSelector(levelContainer, level => { currentLevel = level; newGame(); });

  modeBtn.addEventListener("click", () => {
    flagMode = !flagMode;
    modeBtn.innerHTML = `<i class="fa-solid fa-flag"></i> Mode drapeau : ${flagMode ? "oui" : "non"}`;
    modeBtn.style.borderColor = flagMode ? "#c84646" : "";
    modeBtn.style.color = flagMode ? "#e08a8a" : "";
    SFX.click();
  });

  restartBtn.addEventListener("click", () => { SFX.click(); newGame(); });
  replayBtn.addEventListener("click", () => { SFX.click(); newGame(); });

  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  newGame();
})();

/* ============================
   JEU 4 — MEMORY
   ============================ */
(function () {
  const grid = document.getElementById("memory-grid");
  if (!grid) return;

  const movesEl = document.getElementById("memory-moves");
  const timeEl = document.getElementById("memory-time");
  const starsEl = document.getElementById("memory-stars");
  const winMsgEl = document.getElementById("memory-win-message");
  const restartBtn = document.getElementById("memory-restart-btn");
  const levelContainer = document.getElementById("memory-level-select");
  const submitBlock = document.getElementById("memory-score-submit");
  const leaderboardEl = document.getElementById("memory-leaderboard");

  const ICON_POOL = ["✂️", "🪒", "💈", "👑", "🧴", "💇", "🪮", "🧢"];
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
          <div class="memory-card-front">${icon}</div>
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
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lock = false;
  }

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("memory"), e => `${e.score} coups`);
  }

  attachScoreSubmit("memory-name-input", "memory-save-score-btn", name => {
    const list = lbSave("memory", { name, score: moves, level: LEVELS[currentLevel].label }, (a, b) => a.score - b.score);
    lbRender(leaderboardEl, list, e => `${e.score} coups`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  setupLevelSelector(levelContainer, level => { currentLevel = level; render(); });

  restartBtn.addEventListener("click", () => { SFX.click(); render(); });
  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  render();
})();

/* ============================
   JEU 5 — PUISSANCE 4
   ============================ */
(function () {
  const boardEl = document.getElementById("c4-board");
  if (!boardEl) return;

  const statusEl = document.getElementById("c4-status");
  const winsEl = document.getElementById("c4-wins");
  const modeContainer = document.getElementById("c4-mode-select");
  const levelContainer = document.getElementById("c4-level-select");
  const overlay = document.getElementById("c4-overlay");
  const overlayTitle = document.getElementById("c4-overlay-title");
  const overlayText = document.getElementById("c4-overlay-text");
  const replayBtn = document.getElementById("c4-replay-btn");
  const restartBtn = document.getElementById("c4-restart");
  const submitBlock = document.getElementById("c4-score-submit");
  const leaderboardEl = document.getElementById("c4-leaderboard");

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

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("connect4"), e => `${e.score} victoire${e.score > 1 ? "s" : ""}`);
  }

  attachScoreSubmit("c4-name-input", "c4-save-score-btn", name => {
    const list = lbSave("connect4", { name, score: wins, level: LEVELS[aiLevel] }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score} victoire${e.score > 1 ? "s" : ""}`);
    if (submitBlock) submitBlock.style.display = "none";
  });

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

  setupLevelSelector(levelContainer, lvl => { aiLevel = lvl; newGame(); });

  restartBtn.addEventListener("click", () => { SFX.click(); newGame(); });
  replayBtn.addEventListener("click", () => { SFX.click(); newGame(); });

  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  newGame();
})();

/* ============================
   JEU 6 — SUITE DE RYTHME (SIMON)
   ============================ */
(function () {
  const board = document.querySelector(".simon-board");
  if (!board) return;

  const pads = document.querySelectorAll(".simon-pad");
  const levelEl = document.getElementById("simon-level");
  const bestEl = document.getElementById("simon-best");
  const msgEl = document.getElementById("simon-message");
  const startBtn = document.getElementById("simon-start-btn");
  const levelContainer = document.getElementById("simon-level-select");
  const submitBlock = document.getElementById("simon-score-submit");
  const leaderboardEl = document.getElementById("simon-leaderboard");

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

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("simon"), e => `Niveau ${e.score}`);
  }

  attachScoreSubmit("simon-name-input", "simon-save-score-btn", name => {
    const list = lbSave("simon", { name, score: level, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `Niveau ${e.score}`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  setupLevelSelector(levelContainer, lvl => { currentLevel = lvl; });

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

  // Si l'on revient au jeu pendant la diffusion de la suite, on la rejoue.
  onGameShown("simon", () => {
    if (playing && !accepting) playSequence();
  });

  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  refreshBest();
})();

/* ============================
   JEU 7 — PENDU BARBIER
   ============================ */
(function () {
  const figureEl = document.getElementById("hangman-figure");
  if (!figureEl) return;

  const wordEl = document.getElementById("hangman-word");
  const hintEl = document.getElementById("hangman-hint");
  const wrongEl = document.getElementById("hangman-wrong");
  const keysEl = document.getElementById("hangman-keys");
  const feedbackEl = document.getElementById("hangman-feedback");
  const nextBtn = document.getElementById("hangman-next-btn");
  const resultEl = document.getElementById("hangman-result");
  const scoreTextEl = document.getElementById("hangman-score-text");
  const restartBtn = document.getElementById("hangman-restart-btn");
  const progressEl = document.getElementById("hangman-progress");
  const errorsEl = document.getElementById("hangman-errors");
  const levelContainer = document.getElementById("hangman-level-select");
  const submitBlock = document.getElementById("hangman-score-submit");
  const leaderboardEl = document.getElementById("hangman-leaderboard");

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

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("hangman"), e => `${e.score}%`);
  }

  attachScoreSubmit("hangman-name-input", "hangman-save-score-btn", name => {
    const list = lbSave("hangman", { name, score: lastPct, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score}%`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  setupLevelSelector(levelContainer, level => { currentLevel = level; SFX.click(); newSeries(); });

  nextBtn.addEventListener("click", () => {
    SFX.click();
    index++;
    if (index >= rounds.length) lastPct = showResult();
    else startRound();
  });

  restartBtn.addEventListener("click", () => { SFX.click(); newSeries(); });

  document.addEventListener("keydown", e => {
    if (!isGameActive("hangman") || index >= rounds.length) return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    const letter = (e.key || "").toUpperCase();
    if (letter.length === 1 && ALPHA.includes(letter)) guess(letter);
  });

  buildFigure();
  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  newSeries();
})();

/* ============================
   JEU 8 — QUIZ CULTURE COIFFURE
   ============================ */
(function () {
  const questionEl = document.getElementById("quiz-question");
  if (!questionEl) return;

  const progressEl = document.getElementById("quiz-progress");
  const barEl = document.getElementById("quiz-bar");
  const optionsEl = document.getElementById("quiz-options");
  const feedbackEl = document.getElementById("quiz-feedback");
  const nextBtn = document.getElementById("quiz-next-btn");
  const questionBlock = document.getElementById("quiz-question-block");
  const resultEl = document.getElementById("quiz-result");
  const scoreTextEl = document.getElementById("quiz-score-text");
  const restartBtn = document.getElementById("quiz-restart-btn");
  const levelContainer = document.getElementById("quiz-level-select");
  const timerEl = document.getElementById("quiz-timer");
  const scoreChip = document.getElementById("quiz-score");
  const streakChip = document.getElementById("quiz-streak");
  const submitBlock = document.getElementById("quiz-score-submit");
  const leaderboardEl = document.getElementById("quiz-leaderboard");

  const QUESTIONS_SOURCE = [
    { question: "Quel outil traditionnel utilise-t-on pour un rasage à l'ancienne ?", options: ["Le rasoir électrique", "Le rasoir coupe-chou", "Les ciseaux à effiler", "La tondeuse"], correct: 1, fact: "Le rasoir coupe-chou (ou rasoir droit) est l'outil emblématique du rasage traditionnel en salon de barbier." },
    { question: 'Que désigne une coupe "dégradé" (fade) ?', options: ["Une coupe où la longueur diminue progressivement vers les côtés", "Une coupe totalement rasée", "Une coupe avec une seule longueur uniforme", "Une technique de coloration"], correct: 0, fact: "Le dégradé fait diminuer progressivement la longueur des cheveux, généralement du haut vers les tempes et la nuque." },
    { question: "D'où vient historiquement le poteau rayé rouge, blanc et bleu des barbershops ?", options: ["Il symbolisait à l'origine les bandages et la pratique de la saignée", "Il représentait les couleurs nationales françaises", "C'était un simple choix décoratif sans signification", "Il indiquait les horaires d'ouverture"], correct: 0, fact: "Au Moyen Âge, les barbiers pratiquaient aussi de petits actes chirurgicaux : le rouge symbolise le sang, le blanc les bandages." },
    { question: "Quel est le rôle principal d'une taille de barbe chez le barbier ?", options: ["Uniquement raccourcir la longueur", "Structurer, définir les contours et entretenir la pilosité", "Colorer la barbe", "Faire pousser la barbe plus vite"], correct: 1, fact: "Une bonne taille structure la forme du visage en dessinant des contours nets, bien au-delà du simple raccourcissement." },
    { question: 'Qu\'est-ce qu\'un "buzz cut" ?', options: ["Une coupe très courte et uniforme, réalisée à la tondeuse", "Une coiffure avec beaucoup de volume", "Une technique de tressage", "Une coupe réservée aux enfants uniquement"], correct: 0, fact: "Le buzz cut est une coupe uniforme très courte, rapide à réaliser et facile à entretenir." },
    { question: "Pourquoi applique-t-on une serviette chaude avant un rasage ?", options: ["Pour le confort uniquement", "Pour ouvrir les pores et assouplir les poils, pour un rasage plus net", "Pour désinfecter la peau", "Pour accélérer la pousse des cheveux"], correct: 1, fact: "La chaleur dilate les pores et ramollit les poils, ce qui permet un rasage plus doux et plus précis." },
    { question: "À quoi servent les sabots (guides de coupe) sur une tondeuse ?", options: ["Garantir une longueur uniforme sur toute la zone coupée", "Couper uniquement la barbe", "Colorer les cheveux", "Laver les cheveux"], correct: 0, fact: "Les sabots se clipsent sur la tondeuse et garantissent une longueur constante, du numéro 0 à des tailles plus longues." },
    { question: 'Que signifie l\'expression "coupe entretenue" ?', options: ["Une coupe qu'il faut refaire tous les jours", "Une coupe pensée pour garder une bonne allure plusieurs semaines entre deux rendez-vous", "Une coupe très courte uniquement", "Une coupe réalisée uniquement au rasoir"], correct: 1, fact: "Une coupe bien entretenue garde une silhouette nette même quand les cheveux repoussent." },
    { question: "À quoi sert le peigne lors d'une coupe aux ciseaux ?", options: ["À soulever et guider la mèche pour une coupe régulière", "Uniquement à démêler avant le shampoing", "À appliquer la cire coiffante", "À masser le cuir chevelu"], correct: 0, fact: "Le peigne guide la mèche à la bonne tension et au bon angle, ce qui permet une coupe régulière." },
    { question: "Quel type de produit coiffant donne souvent un fini mat et une tenue forte ?", options: ["La cire (ou pâte) coiffante", "L'après-shampoing", "L'huile essentielle", "Le shampoing sec uniquement"], correct: 0, fact: "La cire ou la pâte coiffante offre une tenue forte avec un fini mat, très utilisée pour structurer coupes courtes et dégradés." },
    { question: "Quel sabot raccourcit les cheveux au plus court ?", options: ["Le numéro 0", "Le numéro 3", "Le numéro 6", "Le numéro 9"], correct: 0, fact: "Le numéro 0 coupe à quelques millimètres : c'est la base des dégradés très courts et des buzz cuts." },
    { question: "Qu'appelle-t-on le « contour » d'une coupe ?", options: ["Le tracé net des limites : tempes, nuque, alentours de la barbe", "La couleur des pointes", "Le volume sur le dessus", "Le shampoing utilisé"], correct: 0, fact: "Le contour (ou détail) est ce tracé précis, souvent finalisé au coupe-chou, qui donne un rendu net et soigné." },
    { question: "Quel accessoire chauffe-t-on pour lisser ou onduler les cheveux ?", options: ["Le peigne en corne", "La pince (lisseuse ou boucleuse)", "Le coupe-chou", "Le blaireau"], correct: 1, fact: "La pince utilise la chaleur pour lisser, onduler ou refriser — toujours avec une protection thermique." },
    { question: "À quoi sert un après-shampoing ?", options: ["À nourrir et détangler après le lavage", "À laver les cheveux", "À remplacer le shampoing", "À colorer les cheveux"], correct: 0, fact: "L'après-shampoing referme la fibre, facilite le démêlage et apporte brillance et souplesse." },
    { question: "Quel accessoire applique la mousse de rasage ?", options: ["Le blaireau", "Le peigne", "Les ciseaux", "Le miroir"], correct: 0, fact: "Le blaireau, en mousse dense et chaude, soulève les poils et prépare parfaitement la peau au rasoir." }
  ];

  const LEVELS = {
    facile: { count: 5, timer: 0, label: "Facile" },
    moyen: { count: 8, timer: 0, label: "Moyen" },
    difficile: { count: 10, timer: 15, label: "Difficile" }
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
    return { question: source.question, options: shuffledOptions, correct: shuffledOptions.indexOf(correctText), fact: source.fact };
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
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("quiz"), e => `${e.score}%`);
  }

  attachScoreSubmit("quiz-name-input", "quiz-save-score-btn", name => {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const list = lbSave("quiz", { name, score: pct, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score}%`);
    if (submitBlock) submitBlock.style.display = "none";
  });

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

  setupLevelSelector(levelContainer, level => { currentLevel = level; initQuiz(); });

  nextBtn.addEventListener("click", () => { SFX.click(); nextQuestion(); });
  restartBtn.addEventListener("click", () => { SFX.click(); initQuiz(); });
  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  initQuiz();
})();

/* ============================
   JEU 9 — PUZZLE GLISSANT
   ============================ */
(function () {
  const boardEl = document.getElementById("puzzle-board");
  if (!boardEl) return;

  const movesEl = document.getElementById("puzzle-moves");
  const timeEl = document.getElementById("puzzle-time");
  const winMsgEl = document.getElementById("puzzle-win-message");
  const restartBtn = document.getElementById("puzzle-restart-btn");
  const levelContainer = document.getElementById("puzzle-level-select");
  const submitBlock = document.getElementById("puzzle-score-submit");
  const leaderboardEl = document.getElementById("puzzle-leaderboard");

  const LEVELS = {
    facile: { size: 3, label: "Facile (3×3)" },
    moyen: { size: 4, label: "Moyen (4×4)" },
    difficile: { size: 5, label: "Difficile (5×5)" }
  };

  let currentLevel = "facile";
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

  function render() {
    const w = boardEl.clientWidth;
    if (!w) return;
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
      tile.style.backgroundSize = TILE * SIZE + "px " + TILE * SIZE + "px";
      const originalRow = Math.floor((value - 1) / SIZE);
      const originalCol = (value - 1) % SIZE;
      tile.style.backgroundPosition = `-${originalCol * TILE}px -${originalRow * TILE}px`;
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
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function shuffle() {
    SIZE = LEVELS[currentLevel].size;
    tiles = solvedArray();
    let bp = tiles.indexOf(0);
    let lastPos = -1;
    const shuffleMoves = SIZE * SIZE * 30;
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

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("puzzle"), e => `${e.score} coups`);
  }

  attachScoreSubmit("puzzle-name-input", "puzzle-save-score-btn", name => {
    const list = lbSave("puzzle", { name, score: moves, level: LEVELS[currentLevel].label }, (a, b) => a.score - b.score);
    lbRender(leaderboardEl, list, e => `${e.score} coups`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  setupLevelSelector(levelContainer, level => { currentLevel = level; shuffle(); });

  restartBtn.addEventListener("click", () => { SFX.click(); shuffle(); });

  // Le panneau est masqué au chargement (largeur mesurée = 0) : on redessine
  // dès qu'il devient visible, et au redimensionnement de la fenêtre.
  onGameShown("puzzle", () => render());
  let resizeT = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(render, 150);
  });

  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  shuffle();
})();

/* ============================
   JEU 10 — TROUVE LA BONNE COUPE
   ============================ */
(function () {
  const requestEl = document.getElementById("haircut-request");
  if (!requestEl) return;

  const progressEl = document.getElementById("haircut-progress");
  const barEl = document.getElementById("haircut-bar");
  const optionsEl = document.getElementById("haircut-options");
  const feedbackEl = document.getElementById("haircut-feedback");
  const nextBtn = document.getElementById("haircut-next-btn");
  const blockEl = document.getElementById("haircut-block");
  const resultEl = document.getElementById("haircut-result");
  const scoreTextEl = document.getElementById("haircut-score-text");
  const restartBtn = document.getElementById("haircut-restart-btn");
  const levelContainer = document.getElementById("haircut-level-select");
  const timerEl = document.getElementById("haircut-timer");
  const scoreChip = document.getElementById("haircut-score");
  const submitBlock = document.getElementById("haircut-score-submit");
  const leaderboardEl = document.getElementById("haircut-leaderboard");

  const STYLE_POOL = ["Undercut", "Buzz cut", "Slick back", "Dégradé (fade) classique", "Crew cut", "Pompadour", "Taper fade", "Coupe + taille de barbe"];

  const ROUNDS_SOURCE = [
    { text: "Je veux que ce soit très court sur les côtés et à l'arrière, mais que je garde de la longueur sur le dessus pour pouvoir coiffer avec du produit.", correct: "Undercut" },
    { text: "Rasez tout à la même longueur courte, je veux un entretien minimum.", correct: "Buzz cut" },
    { text: "Une coupe classique et nette, avec la raie sur le côté et les cheveux plaqués en arrière.", correct: "Slick back" },
    { text: "Un dégradé propre sur les côtés qui se fond bien, avec un peu de longueur sur le dessus, style moderne.", correct: "Dégradé (fade) classique" },
    { text: "Quelque chose d'assez court partout, facile à entretenir, mais pas complètement rasé.", correct: "Crew cut" },
    { text: "Je veux du volume structuré vers l'arrière sur le dessus, avec les côtés dégradés, un style rétro assumé.", correct: "Pompadour" },
    { text: "Un dégradé très progressif et discret, presque invisible, qui garde une allure naturelle.", correct: "Taper fade" },
    { text: "J'aimerais une barbe bien taillée et structurée qui accompagne ma coupe, avec des contours nets.", correct: "Coupe + taille de barbe" }
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
      return { text: r.text, correct: r.correct, options: shuffleArray([r.correct, ...distractors]) };
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
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback";
    nextBtn.style.display = "none";

    r.options.forEach(opt => {
      const btn = el("button", "quiz-option", opt);
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
      feedbackEl.textContent = "Le client repart satisfait !";
      feedbackEl.classList.add("quiz-feedback-correct");
      SFX.good();
    } else {
      feedbackEl.textContent = (opt === null ? "Temps écoulé — " : "") + `La bonne réponse était : ${r.correct}.`;
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
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function renderLeaderboard() {
    lbRender(leaderboardEl, lbGet("haircut"), e => `${e.score}%`);
  }

  attachScoreSubmit("haircut-name-input", "haircut-save-score-btn", name => {
    const pct = Math.round((score / rounds.length) * 100);
    const list = lbSave("haircut", { name, score: pct, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score}%`);
    if (submitBlock) submitBlock.style.display = "none";
  });

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

  setupLevelSelector(levelContainer, level => { currentLevel = level; restart(); });

  nextBtn.addEventListener("click", () => { SFX.click(); next(); });
  restartBtn.addEventListener("click", () => { SFX.click(); restart(); });
  lbRenderers.push(renderLeaderboard);
  renderLeaderboard();
  buildRounds();
  renderRound();
})();
