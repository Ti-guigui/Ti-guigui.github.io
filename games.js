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

// ============================
// JEU 1 — ATTRAPE LA MÈCHE (réflexes)
// ============================
(function () {
  const catchArea = document.getElementById("catch-area");
  if (!catchArea) return;

  const catchScoreEl = document.getElementById("catch-score");
  const catchLivesEl = document.getElementById("catch-lives");
  const catchStartBtn = document.getElementById("catch-start-btn");

  const CATCH_EMOJIS = ["✂️", "🧴", "💇", "👑", "🪒", "💈"];

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
    const emoji = CATCH_EMOJIS[Math.floor(Math.random() * CATCH_EMOJIS.length)];
    const el = document.createElement("span");
    el.className = "falling-object";
    el.textContent = emoji;
    const areaWidth = catchArea.clientWidth;
    const x = Math.random() * Math.max(areaWidth - 40, 0);
    el.style.left = x + "px";
    el.style.top = "-40px";
    catchArea.appendChild(el);

    const speed = 1.5 + Math.min(catchScore * 0.06, 3.5);
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
        if (catchLives <= 0) {
          endGame();
        }
        return false;
      }
      return true;
    });
    if (catchRunning) {
      catchAnimFrame = requestAnimationFrame(loop);
    }
  }

  function startGame() {
    catchScore = 0;
    catchLives = 3;
    catchScoreEl.textContent = 0;
    updateLives();
    catchObjects.forEach(o => o.el.remove());
    catchObjects = [];
    catchArea.innerHTML = "";
    catchRunning = true;
    catchStartBtn.textContent = "Rejouer";
    clearInterval(catchSpawnTimer);
    catchSpawnTimer = setInterval(spawnObject, 900);
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
  }

  updateLives();
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

  const MEMORY_ICONS = ["✂️", "🪒", "💈", "👑", "🧴", "💇"];

  let moves = 0;
  let matched = 0;
  let firstCard = null;
  let secondCard = null;
  let lock = false;

  function buildDeck() {
    const deck = [...MEMORY_ICONS, ...MEMORY_ICONS];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
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
      if (matched === MEMORY_ICONS.length) {
        setTimeout(() => {
          winMsgEl.textContent = `Bravo ! Toutes les paires trouvées en ${moves} coups.`;
          winMsgEl.style.display = "block";
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

  restartBtn.addEventListener("click", render);
  render();
})();

// ============================
// JEU 3 — QUIZ CULTURE BARBERSHOP
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

  const QUESTIONS = [
    {
      question: "Quel outil traditionnel utilise-t-on pour un rasage à l'ancienne ?",
      options: ["Le rasoir électrique", "Le rasoir coupe-chou", "Les ciseaux à effiler", "La tondeuse"],
      correct: 1,
      fact: "Le rasoir coupe-chou (ou rasoir droit) est l'outil emblématique du rasage traditionnel en salon de barbier."
    },
    {
      question: 'Que désigne une coupe "dégradé" (fade) ?',
      options: [
        "Une coupe où la longueur diminue progressivement vers les côtés",
        "Une coupe totalement rasée",
        "Une coupe avec une seule longueur uniforme",
        "Une technique de coloration"
      ],
      correct: 0,
      fact: "Le dégradé fait diminuer progressivement la longueur des cheveux, généralement du haut vers les tempes et la nuque."
    },
    {
      question: "D'où vient historiquement le poteau rayé rouge, blanc et bleu des barbershops ?",
      options: [
        "Il symbolisait à l'origine les bandages et la pratique de la saignée",
        "Il représentait les couleurs nationales françaises",
        "C'était un simple choix décoratif sans signification",
        "Il indiquait les horaires d'ouverture"
      ],
      correct: 0,
      fact: "Au Moyen Âge, les barbiers pratiquaient aussi de petits actes chirurgicaux : le rouge symbolise le sang, le blanc les bandages."
    },
    {
      question: "Quel est le rôle principal d'une taille de barbe chez le barbier ?",
      options: [
        "Uniquement raccourcir la longueur",
        "Structurer, définir les contours et entretenir la pilosité",
        "Colorer la barbe",
        "Faire pousser la barbe plus vite"
      ],
      correct: 1,
      fact: "Une bonne taille structure la forme du visage en dessinant des contours nets, bien au-delà du simple raccourcissement."
    },
    {
      question: 'Qu\'est-ce qu\'un "buzz cut" ?',
      options: [
        "Une coupe très courte et uniforme, réalisée à la tondeuse",
        "Une coiffure avec beaucoup de volume",
        "Une technique de tressage",
        "Une coupe réservée aux enfants uniquement"
      ],
      correct: 0,
      fact: "Le buzz cut est une coupe uniforme très courte, rapide à réaliser et facile à entretenir."
    },
    {
      question: "Pourquoi applique-t-on une serviette chaude avant un rasage ?",
      options: [
        "Pour le confort uniquement",
        "Pour ouvrir les pores et assouplir les poils, pour un rasage plus net",
        "Pour désinfecter la peau",
        "Pour accélérer la pousse des cheveux"
      ],
      correct: 1,
      fact: "La chaleur dilate les pores et ramollit les poils, ce qui permet un rasage plus doux et plus précis."
    }
  ];

  let index = 0;
  let score = 0;

  function renderQuestion() {
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
  }

  function selectAnswer(i) {
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
    } else {
      feedbackEl.textContent = `Pas tout à fait. ${q.fact}`;
      feedbackEl.classList.add("quiz-feedback-incorrect");
    }
    nextBtn.style.display = "inline-flex";
  }

  function nextQuestion() {
    index++;
    if (index >= QUESTIONS.length) {
      showResult();
    } else {
      renderQuestion();
    }
  }

  function showResult() {
    questionBlock.style.display = "none";
    resultEl.style.display = "flex";
    scoreTextEl.textContent = `Score : ${score} / ${QUESTIONS.length}`;
  }

  function restartQuiz() {
    index = 0;
    score = 0;
    resultEl.style.display = "none";
    questionBlock.style.display = "flex";
    renderQuestion();
  }

  nextBtn.addEventListener("click", nextQuestion);
  restartBtn.addEventListener("click", restartQuiz);
  renderQuestion();
})();
