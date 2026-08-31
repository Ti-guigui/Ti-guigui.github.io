// ============================
// ONGLETS DE SÉLECTION DE JEU
// ============================
const gameTabs = document.querySelectorAll(".game-tab");
const gamePanels = document.querySelectorAll(".game-panel");

gameTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    gameTabs.forEach(t => t.classList.remove("active"));
    gamePanels.forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    const panel = document.getElementById("game-" + tab.dataset.game);
    if (panel) panel.classList.add("active");
  });
});

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================
// SÉLECTEUR DE NIVEAU (générique)
// Câble un groupe de boutons .level-btn à l'intérieur de containerEl
// et appelle onChange(levelKey) à chaque changement.
// ============================
function setupLevelSelector(containerEl, onChange) {
  if (!containerEl) return null;
  const buttons = containerEl.querySelectorAll(".level-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      onChange(btn.dataset.level);
    });
  });
  const initial = containerEl.querySelector(".level-btn.active") || buttons[0];
  return initial ? initial.dataset.level : null;
}

// ============================
// CLASSEMENT (localStorage — propre à cet appareil/navigateur)
// ============================
const LB_MAX_ENTRIES = 10;

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
  } catch (e) {
    /* stockage indisponible (navigation privée, quota plein) : on ignore silencieusement */
  }
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
  });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") button.click();
  });
}

// ============================
// JEU 1 — ATTRAPE LA MÈCHE (réflexes)
// ============================
(function () {
  const catchArea = document.getElementById("catch-area");
  if (!catchArea) return;

  const catchScoreEl = document.getElementById("catch-score");
  const catchLivesEl = document.getElementById("catch-lives");
  const catchStartBtn = document.getElementById("catch-start-btn");
  const levelContainer = document.getElementById("catch-level-select");
  const submitBlock = document.getElementById("catch-score-submit");
  const leaderboardEl = document.getElementById("catch-leaderboard");

  const CATCH_EMOJIS = ["✂️", "🧴", "💇", "👑", "🪒", "💈"];
  const LEVELS = {
    facile: { spawnInterval: 1200, baseSpeed: 1.1, growth: 0.04, lives: 4, label: "Facile" },
    moyen: { spawnInterval: 900, baseSpeed: 1.5, growth: 0.06, lives: 3, label: "Moyen" },
    difficile: { spawnInterval: 650, baseSpeed: 2.2, growth: 0.09, lives: 2, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let catchScore = 0;
  let catchLives = 3;
  let catchRunning = false;
  let catchObjects = [];
  let catchSpawnTimer = null;
  let catchAnimFrame = null;

  function updateLives() {
    catchLivesEl.textContent = "❤️".repeat(Math.max(catchLives, 0));
  }

  function spawnObject() {
    if (!catchRunning) return;
    const cfg = LEVELS[currentLevel];
    const emoji = CATCH_EMOJIS[Math.floor(Math.random() * CATCH_EMOJIS.length)];
    const el = document.createElement("span");
    el.className = "falling-object";
    el.textContent = emoji;
    const areaWidth = catchArea.clientWidth;
    const x = Math.random() * Math.max(areaWidth - 40, 0);
    el.style.left = x + "px";
    el.style.top = "-40px";
    catchArea.appendChild(el);

    const speed = cfg.baseSpeed + Math.min(catchScore * cfg.growth, 4);
    const obj = { el, y: -40, speed, caught: false };

    el.addEventListener("click", () => {
      if (obj.caught) return;
      obj.caught = true;
      catchScore++;
      catchScoreEl.textContent = catchScore;
      el.classList.add("caught");
      setTimeout(() => el.remove(), 150);
    });

    catchObjects.push(obj);
  }

  function loop() {
    const areaHeight = catchArea.clientHeight;
    catchObjects = catchObjects.filter(obj => {
      if (obj.caught) return false;
      obj.y += obj.speed;
      obj.el.style.top = obj.y + "px";
      if (obj.y > areaHeight) {
        obj.el.remove();
        catchLives--;
        updateLives();
        if (catchLives <= 0) endGame();
        return false;
      }
      return true;
    });
    if (catchRunning) catchAnimFrame = requestAnimationFrame(loop);
  }

  function startGame() {
    const cfg = LEVELS[currentLevel];
    catchScore = 0;
    catchLives = cfg.lives;
    catchScoreEl.textContent = 0;
    updateLives();
    catchObjects.forEach(o => o.el.remove());
    catchObjects = [];
    catchArea.innerHTML = "";
    catchRunning = true;
    catchStartBtn.textContent = "Rejouer";
    if (submitBlock) submitBlock.style.display = "none";
    clearInterval(catchSpawnTimer);
    catchSpawnTimer = setInterval(spawnObject, cfg.spawnInterval);
    cancelAnimationFrame(catchAnimFrame);
    catchAnimFrame = requestAnimationFrame(loop);
  }

  function endGame() {
    catchRunning = false;
    clearInterval(catchSpawnTimer);
    cancelAnimationFrame(catchAnimFrame);
    catchObjects.forEach(o => o.el.remove());
    catchObjects = [];
    const msg = document.createElement("p");
    msg.className = "catch-message";
    msg.textContent = `Partie terminée ! Score final : ${catchScore}`;
    catchArea.appendChild(msg);
    if (catchScore > 0 && submitBlock) submitBlock.style.display = "flex";
  }

  function renderLeaderboard() {
    const list = lbGet("catch");
    lbRender(leaderboardEl, list, e => `${e.score} pt${e.score > 1 ? "s" : ""}`);
  }

  attachScoreSubmit("catch-name-input", "catch-save-score-btn", name => {
    const list = lbSave("catch", { name, score: catchScore, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score} pt${e.score > 1 ? "s" : ""}`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  const initial = setupLevelSelector(levelContainer, level => { currentLevel = level; });
  if (initial) currentLevel = initial;

  updateLives();
  renderLeaderboard();
  catchStartBtn.addEventListener("click", startGame);
})();

// ============================
// JEU 2 — MEMORY
// ============================
(function () {
  const grid = document.getElementById("memory-grid");
  if (!grid) return;

  const movesEl = document.getElementById("memory-moves");
  const winMsgEl = document.getElementById("memory-win-message");
  const restartBtn = document.getElementById("memory-restart-btn");
  const levelContainer = document.getElementById("memory-level-select");
  const submitBlock = document.getElementById("memory-score-submit");
  const leaderboardEl = document.getElementById("memory-leaderboard");

  const ICON_POOL = ["✂️", "🪒", "💈", "👑", "🧴", "💇", "🪮", "🧢"];
  const LEVELS = {
    facile: { pairs: 4, cols: 4, label: "Facile" },
    moyen: { pairs: 6, cols: 4, label: "Moyen" },
    difficile: { pairs: 8, cols: 4, label: "Difficile" }
  };

  let currentLevel = "moyen";
  let moves = 0;
  let matched = 0;
  let firstCard = null;
  let secondCard = null;
  let lock = false;
  let totalPairs = 6;

  function buildDeck() {
    const cfg = LEVELS[currentLevel];
    totalPairs = cfg.pairs;
    const icons = ICON_POOL.slice(0, cfg.pairs);
    grid.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;
    return shuffleArray([...icons, ...icons]);
  }

  function render() {
    grid.innerHTML = "";
    moves = 0;
    matched = 0;
    firstCard = null;
    secondCard = null;
    lock = false;
    movesEl.textContent = 0;
    winMsgEl.style.display = "none";
    winMsgEl.textContent = "";
    if (submitBlock) submitBlock.style.display = "none";

    buildDeck().forEach(icon => {
      const card = document.createElement("div");
      card.className = "memory-card";
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
    card.classList.add("flipped");

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
      if (matched === totalPairs) {
        setTimeout(() => {
          winMsgEl.textContent = `Bravo ! Toutes les paires trouvées en ${moves} coups.`;
          winMsgEl.style.display = "block";
          if (submitBlock) submitBlock.style.display = "flex";
        }, 300);
      }
    } else {
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetTurn();
      }, 800);
    }
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lock = false;
  }

  function renderLeaderboard() {
    const list = lbGet("memory");
    lbRender(leaderboardEl, list, e => `${e.score} coups`);
  }

  attachScoreSubmit("memory-name-input", "memory-save-score-btn", name => {
    const list = lbSave("memory", { name, score: moves, level: LEVELS[currentLevel].label }, (a, b) => a.score - b.score);
    lbRender(leaderboardEl, list, e => `${e.score} coups`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  const initial = setupLevelSelector(levelContainer, level => { currentLevel = level; render(); });
  if (initial) currentLevel = initial;

  restartBtn.addEventListener("click", render);
  renderLeaderboard();
  render();
})();

// ============================
// JEU 3 — QUIZ CULTURE BARBERSHOP
// (questions + options mélangées à chaque partie, niveaux = nb de questions + minuteur)
// ============================
(function () {
  const questionEl = document.getElementById("quiz-question");
  if (!questionEl) return;

  const progressEl = document.getElementById("quiz-progress");
  const optionsEl = document.getElementById("quiz-options");
  const feedbackEl = document.getElementById("quiz-feedback");
  const nextBtn = document.getElementById("quiz-next-btn");
  const questionBlock = document.getElementById("quiz-question-block");
  const resultEl = document.getElementById("quiz-result");
  const scoreTextEl = document.getElementById("quiz-score-text");
  const restartBtn = document.getElementById("quiz-restart-btn");
  const levelContainer = document.getElementById("quiz-level-select");
  const timerEl = document.getElementById("quiz-timer");
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
    { question: "Quel type de produit coiffant donne souvent un fini mat et une tenue forte ?", options: ["La cire (ou pâte) coiffante", "L'après-shampoing", "L'huile essentielle", "Le shampoing sec uniquement"], correct: 0, fact: "La cire ou la pâte coiffante offre une tenue forte avec un fini mat, très utilisée pour structurer coupes courtes et dégradés." }
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
  let countdownInterval = null;

  function buildRound(source) {
    const correctText = source.options[source.correct];
    const shuffledOptions = shuffleArray(source.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctText);
    return { question: source.question, options: shuffledOptions, correct: newCorrectIndex, fact: source.fact };
  }

  function clearCountdown() {
    clearInterval(countdownInterval);
    if (timerEl) timerEl.textContent = "";
  }

  function startCountdown() {
    const cfg = LEVELS[currentLevel];
    if (!cfg.timer || !timerEl) return;
    let remaining = cfg.timer;
    timerEl.textContent = `⏱ ${remaining}s`;
    countdownInterval = setInterval(() => {
      remaining--;
      timerEl.textContent = `⏱ ${remaining}s`;
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
    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback";
    nextBtn.style.display = "none";

    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt;
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

    if (i === q.correct) {
      score++;
      feedbackEl.textContent = `Bonne réponse ! ${q.fact}`;
      feedbackEl.classList.add("quiz-feedback-correct");
    } else if (i === -1) {
      feedbackEl.textContent = `Temps écoulé ! ${q.fact}`;
      feedbackEl.classList.add("quiz-feedback-incorrect");
    } else {
      feedbackEl.textContent = `Pas tout à fait. ${q.fact}`;
      feedbackEl.classList.add("quiz-feedback-incorrect");
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
    scoreTextEl.textContent = `Score : ${score} / ${QUESTIONS.length}`;
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function renderLeaderboard() {
    const list = lbGet("quiz");
    lbRender(leaderboardEl, list, e => `${e.score}%`);
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
    resultEl.style.display = "none";
    questionBlock.style.display = "flex";
    renderQuestion();
  }

  const initial = setupLevelSelector(levelContainer, level => { currentLevel = level; initQuiz(); });
  if (initial) currentLevel = initial;

  nextBtn.addEventListener("click", nextQuestion);
  restartBtn.addEventListener("click", initQuiz);
  renderLeaderboard();
  initQuiz();
})();

// ============================
// JEU 4 — SUITE DE RYTHME (Simon)
// ============================
(function () {
  const board = document.querySelector(".simon-board");
  if (!board) return;

  const pads = document.querySelectorAll(".simon-pad");
  const levelEl = document.getElementById("simon-level");
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

  function flashPad(padIndex) {
    const cfg = LEVELS[currentLevel];
    return new Promise(resolve => {
      const pad = pads[padIndex];
      pad.classList.add("active");
      setTimeout(() => {
        pad.classList.remove("active");
        setTimeout(resolve, cfg.pause);
      }, cfg.flashDuration);
    });
  }

  async function playSequence() {
    accepting = false;
    pads.forEach(p => (p.disabled = true));
    msgEl.textContent = "Observez...";
    await new Promise(r => setTimeout(r, 500));
    for (const step of sequence) await flashPad(step);
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
    pads.forEach(p => (p.disabled = true));
    msgEl.textContent = `Perdu ! Vous avez atteint le niveau ${level}.`;
    startBtn.textContent = "Rejouer";
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
        setTimeout(nextRound, 900);
      }
    } else {
      endGame();
    }
  }

  function renderLeaderboard() {
    const list = lbGet("simon");
    lbRender(leaderboardEl, list, e => `Niveau ${e.score}`);
  }

  attachScoreSubmit("simon-name-input", "simon-save-score-btn", name => {
    const list = lbSave("simon", { name, score: level, level: LEVELS[currentLevel].label }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `Niveau ${e.score}`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  const initial = setupLevelSelector(levelContainer, lvl => { currentLevel = lvl; });
  if (initial) currentLevel = initial;

  pads.forEach((pad, i) => pad.addEventListener("click", () => handlePadClick(i)));

  startBtn.addEventListener("click", () => {
    sequence = [];
    level = 0;
    levelEl.textContent = 0;
    startBtn.textContent = "Rejouer";
    if (submitBlock) submitBlock.style.display = "none";
    nextRound();
  });

  renderLeaderboard();
})();

// ============================
// JEU 5 — MORPION (2 joueurs ou contre l'ordinateur)
// ============================
(function () {
  const board = document.getElementById("ttt-board");
  if (!board) return;

  const cells = document.querySelectorAll(".ttt-cell");
  const statusEl = document.getElementById("ttt-status");
  const statsEl = document.getElementById("ttt-stats");
  const restartBtn = document.getElementById("ttt-restart-btn");
  const modeContainer = document.getElementById("ttt-mode-select");
  const levelContainer = document.getElementById("ttt-level-select");
  const submitBlock = document.getElementById("ttt-score-submit");
  const leaderboardEl = document.getElementById("ttt-leaderboard");

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const LEVELS = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };

  let mode = "2joueurs"; // ou "ia"
  let aiLevel = "moyen";
  let cellValues = Array(9).fill(null);
  let currentPlayer = "X";
  let gameOver = false;
  let aiWins = 0;

  function getWinner(cellsArr) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (cellsArr[a] && cellsArr[a] === cellsArr[b] && cellsArr[a] === cellsArr[c]) return cellsArr[a];
    }
    if (cellsArr.every(v => v)) return "draw";
    return null;
  }

  function minimax(cellsArr, player) {
    const winner = getWinner(cellsArr);
    if (winner === "O") return { score: 1 };
    if (winner === "X") return { score: -1 };
    if (winner === "draw") return { score: 0 };

    const moves = [];
    cellsArr.forEach((c, i) => {
      if (!c) {
        const next = [...cellsArr];
        next[i] = player;
        const result = minimax(next, player === "O" ? "X" : "O");
        moves.push({ index: i, score: result.score });
      }
    });

    return player === "O"
      ? moves.reduce((best, m) => (m.score > best.score ? m : best))
      : moves.reduce((best, m) => (m.score < best.score ? m : best));
  }

  function aiMove() {
    const empties = cellValues.map((v, i) => (v ? null : i)).filter(i => i !== null);
    if (!empties.length) return;

    let choice;
    if (aiLevel === "facile") {
      choice = empties[Math.floor(Math.random() * empties.length)];
    } else if (aiLevel === "moyen") {
      choice = findWinningMove("O") ?? findWinningMove("X") ?? empties[Math.floor(Math.random() * empties.length)];
    } else {
      choice = minimax(cellValues, "O").index;
      if (choice === undefined) choice = empties[0];
    }
    applyMove(choice, "O");
  }

  function findWinningMove(player) {
    for (const i of cellValues.map((v, idx) => (v ? null : idx)).filter(v => v !== null)) {
      const next = [...cellValues];
      next[i] = player;
      if (getWinner(next) === player) return i;
    }
    return null;
  }

  function applyMove(i, player) {
    cellValues[i] = player;
    cells[i].textContent = player;
    const winner = getWinner(cellValues);
    if (winner) {
      gameOver = true;
      if (winner === "draw") {
        statusEl.textContent = "Match nul !";
      } else if (mode === "ia" && winner === "X") {
        aiWins++;
        statusEl.textContent = "Bravo, vous avez gagné !";
        updateStats();
      } else if (mode === "ia" && winner === "O") {
        statusEl.textContent = "L'ordinateur a gagné.";
      } else {
        statusEl.textContent = `${winner} a gagné !`;
      }
      return;
    }
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusEl.textContent = mode === "ia" && currentPlayer === "O" ? "L'ordinateur réfléchit..." : `Au tour de ${currentPlayer}`;
    if (mode === "ia" && currentPlayer === "O" && !gameOver) {
      setTimeout(aiMove, 500);
    }
  }

  function handleClick(i) {
    if (gameOver || cellValues[i]) return;
    if (mode === "ia" && currentPlayer !== "X") return;
    applyMove(i, currentPlayer);
  }

  function updateStats() {
    if (statsEl) statsEl.textContent = mode === "ia" ? `Victoires contre l'IA cette session : ${aiWins}` : "";
    if (submitBlock) submitBlock.style.display = mode === "ia" && aiWins > 0 ? "flex" : "none";
  }

  cells.forEach((cell, i) => cell.addEventListener("click", () => handleClick(i)));

  function restart() {
    cellValues = Array(9).fill(null);
    currentPlayer = "X";
    gameOver = false;
    cells.forEach(c => (c.textContent = ""));
    statusEl.textContent = "Au tour de X";
  }

  restartBtn.addEventListener("click", restart);

  if (modeContainer) {
    modeContainer.querySelectorAll(".level-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        modeContainer.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        mode = btn.dataset.mode;
        aiWins = 0;
        if (levelContainer) levelContainer.style.display = mode === "ia" ? "flex" : "none";
        updateStats();
        restart();
      });
    });
  }

  const initialAiLevel = setupLevelSelector(levelContainer, lvl => { aiLevel = lvl; });
  if (initialAiLevel) aiLevel = initialAiLevel;

  function renderLeaderboard() {
    const list = lbGet("tictactoe");
    lbRender(leaderboardEl, list, e => `${e.score} victoire${e.score > 1 ? "s" : ""}`);
  }

  attachScoreSubmit("ttt-name-input", "ttt-save-score-btn", name => {
    const list = lbSave("tictactoe", { name, score: aiWins, level: LEVELS[aiLevel] }, (a, b) => b.score - a.score);
    lbRender(leaderboardEl, list, e => `${e.score} victoire${e.score > 1 ? "s" : ""}`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  renderLeaderboard();
})();

// ============================
// JEU 6 — PUZZLE GLISSANT
// ============================
(function () {
  const boardEl = document.getElementById("puzzle-board");
  if (!boardEl) return;

  const movesEl = document.getElementById("puzzle-moves");
  const winMsgEl = document.getElementById("puzzle-win-message");
  const restartBtn = document.getElementById("puzzle-restart-btn");
  const levelContainer = document.getElementById("puzzle-level-select");
  const submitBlock = document.getElementById("puzzle-score-submit");
  const leaderboardEl = document.getElementById("puzzle-leaderboard");

  const LEVELS = {
    facile: { size: 3, label: "Facile (3x3)" },
    moyen: { size: 4, label: "Moyen (4x4)" },
    difficile: { size: 5, label: "Difficile (5x5)" }
  };

  let currentLevel = "facile";
  let SIZE = 3;
  let tiles = [];
  let moves = 0;

  function solvedArray() {
    const arr = [];
    for (let i = 1; i < SIZE * SIZE; i++) arr.push(i);
    arr.push(0);
    return arr;
  }

  function tileSize() {
    return boardEl.clientWidth / SIZE;
  }

  function render() {
    const TILE = tileSize();
    boardEl.innerHTML = "";
    tiles.forEach((value, pos) => {
      if (value === 0) return;
      const row = Math.floor(pos / SIZE);
      const col = pos % SIZE;
      const tile = document.createElement("div");
      tile.className = "puzzle-tile";
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
    const bp = blankPos();
    const row = Math.floor(pos / SIZE), col = pos % SIZE;
    const brow = Math.floor(bp / SIZE), bcol = bp % SIZE;
    const adjacent = Math.abs(row - brow) + Math.abs(col - bcol) === 1;
    if (!adjacent) return;
    [tiles[pos], tiles[bp]] = [tiles[bp], tiles[pos]];
    moves++;
    movesEl.textContent = moves;
    render();
    checkWin();
  }

  function checkWin() {
    const solved = solvedArray();
    if (tiles.every((v, i) => v === solved[i])) {
      winMsgEl.textContent = `Bravo ! Puzzle résolu en ${moves} coups.`;
      winMsgEl.style.display = "block";
      if (submitBlock) submitBlock.style.display = "flex";
    }
  }

  function shuffle() {
    SIZE = LEVELS[currentLevel].size;
    tiles = solvedArray();
    let bp = tiles.indexOf(0);
    let lastPos = -1;
    const shuffleMoves = SIZE * SIZE * 25;
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
    moves = 0;
    movesEl.textContent = 0;
    winMsgEl.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    render();
  }

  function renderLeaderboard() {
    const list = lbGet("puzzle");
    lbRender(leaderboardEl, list, e => `${e.score} coups`);
  }

  attachScoreSubmit("puzzle-name-input", "puzzle-save-score-btn", name => {
    const list = lbSave("puzzle", { name, score: moves, level: LEVELS[currentLevel].label }, (a, b) => a.score - b.score);
    lbRender(leaderboardEl, list, e => `${e.score} coups`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  const initial = setupLevelSelector(levelContainer, level => { currentLevel = level; shuffle(); });
  if (initial) currentLevel = initial;

  restartBtn.addEventListener("click", shuffle);
  renderLeaderboard();
  shuffle();
})();

// ============================
// JEU 7 — JEU DES DIFFÉRENCES
// ============================
(function () {
  const gridA = document.getElementById("diff-grid-a");
  if (!gridA) return;

  const gridB = document.getElementById("diff-grid-b");
  const foundEl = document.getElementById("diff-found");
  const totalEl = document.getElementById("diff-total");
  const timerEl = document.getElementById("diff-timer");
  const winMsgEl = document.getElementById("diff-win-message");
  const restartBtn = document.getElementById("diff-restart-btn");
  const levelContainer = document.getElementById("diff-level-select");
  const submitBlock = document.getElementById("diff-score-submit");
  const leaderboardEl = document.getElementById("diff-leaderboard");

  const ICON_POOL = ["🪮", "✂️", "🪞", "⏰", "🪴", "🧴", "🧻", "🪒", "🎀", "🖌️", "💡", "🪑", "🧢", "🧦", "🕯️", "🧼"];

  // "missing"/"swap" = différence évidente (case vide ou objet totalement différent)
  // "flip"/"recolor"/"resize"/"rotate" = même objet mais visuellement modifié : plus subtil, demande une vraie comparaison
  const LEVELS = {
    facile: { slots: 9, diffs: 4, gridClass: "diff-grid-3", label: "Facile", diffTypes: ["missing", "missing", "swap"] },
    moyen: { slots: 12, diffs: 6, gridClass: "", label: "Moyen", diffTypes: ["missing", "swap", "flip", "resize"] },
    difficile: { slots: 16, diffs: 8, gridClass: "diff-grid-4x4", label: "Difficile", diffTypes: ["flip", "recolor", "resize", "rotate"] }
  };

  let currentLevel = "moyen";
  let diffIndexes = [];
  let found = 0;
  let seconds = 0;
  let timerInterval = null;

  function pickIcons(n) {
    const pool = [...ICON_POOL];
    const picked = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picked;
  }

  function styleForType(type) {
    switch (type) {
      case "flip": return "transform: scaleX(-1);";
      case "recolor": return "filter: hue-rotate(150deg) saturate(3.5);";
      case "resize": return `transform: scale(${Math.random() < 0.5 ? 0.65 : 1.4});`;
      case "rotate": return `transform: rotate(${Math.random() < 0.5 ? 25 : -25}deg);`;
      default: return "";
    }
  }

  function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    if (timerEl) timerEl.textContent = "⏱ 0s";
    timerInterval = setInterval(() => {
      seconds++;
      if (timerEl) timerEl.textContent = `⏱ ${seconds}s`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
  }

  function setup() {
    const cfg = LEVELS[currentLevel];
    found = 0;
    foundEl.textContent = 0;
    totalEl.textContent = cfg.diffs;
    winMsgEl.style.display = "none";
    if (submitBlock) submitBlock.style.display = "none";
    gridA.innerHTML = "";
    gridB.innerHTML = "";
    gridA.className = "diff-grid " + cfg.gridClass;
    gridB.className = "diff-grid " + cfg.gridClass;

    const iconsA = pickIcons(cfg.slots);
    const iconsB = iconsA.map(icon => ({ icon, style: "" }));

    const allIndexes = shuffleArray([...Array(cfg.slots).keys()]);
    diffIndexes = allIndexes.slice(0, cfg.diffs);

    const usedIcons = new Set(iconsA);
    diffIndexes.forEach(i => {
      const type = cfg.diffTypes[Math.floor(Math.random() * cfg.diffTypes.length)];
      if (type === "missing") {
        iconsB[i] = { icon: null, style: "" };
      } else if (type === "swap") {
        let replacement, attempts = 0;
        do {
          replacement = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
          attempts++;
        } while ((usedIcons.has(replacement) || replacement === iconsA[i]) && attempts < 30);
        usedIcons.add(replacement);
        iconsB[i] = { icon: replacement, style: "" };
      } else {
        iconsB[i] = { icon: iconsA[i], style: styleForType(type) };
      }
    });

    iconsA.forEach(icon => {
      const slot = document.createElement("div");
      slot.className = "diff-slot";
      slot.innerHTML = `<span class="diff-icon">${icon || ""}</span>`;
      gridA.appendChild(slot);
    });

    iconsB.forEach((data, i) => {
      const slot = document.createElement("div");
      slot.className = "diff-slot clickable";
      slot.innerHTML = `<span class="diff-icon" style="${data.style}">${data.icon || ""}</span>`;
      slot.addEventListener("click", () => handleClick(slot, i));
      gridB.appendChild(slot);
    });

    startTimer();
  }

  function handleClick(slot, i) {
    if (slot.classList.contains("found")) return;
    const cfg = LEVELS[currentLevel];
    if (diffIndexes.includes(i)) {
      slot.classList.add("found");
      found++;
      foundEl.textContent = found;
      if (found === cfg.diffs) {
        stopTimer();
        winMsgEl.textContent = `Bravo ! Toutes les différences trouvées en ${seconds}s.`;
        winMsgEl.style.display = "block";
        if (submitBlock) submitBlock.style.display = "flex";
      }
    } else {
      slot.classList.add("wrong");
      setTimeout(() => slot.classList.remove("wrong"), 400);
    }
  }

  function renderLeaderboard() {
    const list = lbGet("diff");
    lbRender(leaderboardEl, list, e => `${e.score}s`);
  }

  attachScoreSubmit("diff-name-input", "diff-save-score-btn", name => {
    const list = lbSave("diff", { name, score: seconds, level: LEVELS[currentLevel].label }, (a, b) => a.score - b.score);
    lbRender(leaderboardEl, list, e => `${e.score}s`);
    if (submitBlock) submitBlock.style.display = "none";
  });

  const initial = setupLevelSelector(levelContainer, level => { currentLevel = level; setup(); });
  if (initial) currentLevel = initial;

  restartBtn.addEventListener("click", setup);
  renderLeaderboard();
  setup();
})();

// ============================
// JEU 8 — TROUVE LA BONNE COUPE
// ============================
(function () {
  const requestEl = document.getElementById("haircut-request");
  if (!requestEl) return;

  const progressEl = document.getElementById("haircut-progress");
  const optionsEl = document.getElementById("haircut-options");
  const feedbackEl = document.getElementById("haircut-feedback");
  const nextBtn = document.getElementById("haircut-next-btn");
  const blockEl = document.getElementById("haircut-block");
  const resultEl = document.getElementById("haircut-result");
  const scoreTextEl = document.getElementById("haircut-score-text");
  const restartBtn = document.getElementById("haircut-restart-btn");
  const levelContainer = document.getElementById("haircut-level-select");
  const timerEl = document.getElementById("haircut-timer");
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
      const options = shuffleArray([r.correct, ...distractors]);
      return { text: r.text, correct: r.correct, options };
    });
  }

  function clearCountdown() {
    clearInterval(countdownInterval);
    if (timerEl) timerEl.textContent = "";
  }

  function startCountdown() {
    const cfg = LEVELS[currentLevel];
    if (!cfg.timer || !timerEl) return;
    let remaining = cfg.timer;
    timerEl.textContent = `⏱ ${remaining}s`;
    countdownInterval = setInterval(() => {
      remaining--;
      timerEl.textContent = `⏱ ${remaining}s`;
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
    requestEl.textContent = `« ${r.text} »`;
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "";
    feedbackEl.className = "quiz-feedback";
    nextBtn.style.display = "none";

    r.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt;
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
    if (opt === r.correct) {
      score++;
      feedbackEl.textContent = "Le client repart satisfait !";
      feedbackEl.classList.add("quiz-feedback-correct");
    } else if (opt === null) {
      feedbackEl.textContent = `Temps écoulé — la bonne réponse était : ${r.correct}.`;
      feedbackEl.classList.add("quiz-feedback-incorrect");
    } else {
      feedbackEl.textContent = `Pas tout à fait — la bonne réponse était : ${r.correct}.`;
      feedbackEl.classList.add("quiz-feedback-incorrect");
    }
    nextBtn.style.display = "inline-flex";
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
    scoreTextEl.textContent = `Clients satisfaits : ${score} / ${rounds.length}`;
    if (submitBlock) submitBlock.style.display = "flex";
  }

  function renderLeaderboard() {
    const list = lbGet("haircut");
    lbRender(leaderboardEl, list, e => `${e.score}%`);
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
    buildRounds();
    resultEl.style.display = "none";
    blockEl.style.display = "flex";
    renderRound();
  }

  const initial = setupLevelSelector(levelContainer, level => { currentLevel = level; restart(); });
  if (initial) currentLevel = initial;

  nextBtn.addEventListener("click", next);
  restartBtn.addEventListener("click", restart);
  renderLeaderboard();
  buildRounds();
  renderRound();
})();
