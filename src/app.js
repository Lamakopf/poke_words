import { loadProgress, saveProgress, resetProgress } from "./storage.js";
import { primeAudio, playFromPath, playBeep } from "./audio.js";
import {
  loadWords,
  nextWord,
  availableButtons,
  evaluateAnswer,
  updateProgress,
  mapState,
  MAP,
  canMoveTo,
  onDuelTile,
} from "./game.js";
import {
  switchScreen,
  renderWord,
  renderBattle,
  renderButtons,
  renderStars,
  pulseFeedback,
  renderDex,
  renderMapTiles,
  setDuelHint,
  renderMap,
} from "./ui.js";

const state = {
  words: [],
  progress: loadProgress(),
  solvedInRun: new Set(),
  currentWord: null,
  hp: { player: 100, enemy: 100 },
};

const bindTap = (fn) => (event) => {
  primeAudio();
  fn(event);
};

async function init() {
  state.words = await loadWords();

  wireActions();
  renderStars(state.progress.stars);
  switchScreen("start");
  document.getElementById("boot-status").textContent = state.words.length ? "✅ Bereit" : "⚠️ Keine Wörter";
}

function wireActions() {
  document.getElementById("btn-play").addEventListener("click", bindTap(startGame));
  document.getElementById("btn-dex").addEventListener("click", bindTap(openDex));
  document.getElementById("btn-map").addEventListener("click", bindTap(openMap));
  document.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", bindTap(() => switchScreen("start"))));
  document.getElementById("btn-word-audio").addEventListener("click", bindTap(playCurrentWord));
  document.getElementById("btn-next").addEventListener("click", bindTap(loadRound));
  document.getElementById("btn-reset").addEventListener("click", bindTap(resetAll));
  document.getElementById("btn-start-duel").addEventListener("click", bindTap(() => {
    if (onDuelTile(state.progress.player)) startGame();
  }));

  document.querySelectorAll("[data-move]").forEach((btn) => {
    btn.addEventListener("click", bindTap(() => movePlayer(btn.dataset.move)));
  });

  window.addEventListener("keydown", (event) => {
    const keyMap = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    if (keyMap[event.key] && document.getElementById("screen-map").classList.contains("active")) {
      movePlayer(keyMap[event.key]);
    }
  });
}

function startGame() {
  if (!state.words.length) return;
  switchScreen("game");
  if (state.hp.player <= 0 || state.hp.enemy <= 0) state.hp = { player: 100, enemy: 100 };
  loadRound();
}

function loadRound() {
  if (!state.words.length) return;
  state.currentWord = nextWord(state.words, state.progress, state.solvedInRun);
  renderWord(state.currentWord, false);
  renderBattle(state.currentWord, "neutral", state.hp);
  renderButtons(availableButtons(state.progress), onAnswer);
  pulseFeedback("ok");
}

async function onAnswer(choice) {
  if (!state.currentWord) return;
  if (evaluateAnswer(state.currentWord, choice)) {
    renderWord(state.currentWord, true);
    state.hp.enemy = Math.max(0, state.hp.enemy - 25);
    renderBattle(state.currentWord, "ok", state.hp);
    pulseFeedback("ok");
    await playBeep("ok");
    updateProgress(state.progress, state.currentWord);
    state.solvedInRun.add(state.currentWord.id);
    saveProgress(state.progress);
    renderStars(state.progress.stars);

    if (state.hp.enemy <= 0) {
      document.getElementById("game-feedback").textContent = "🏆 Duell gewonnen";
      setTimeout(() => {
        state.hp = { player: 100, enemy: 100 };
        openMap();
      }, 900);
      return;
    }
    setTimeout(loadRound, 600);
  } else {
    state.hp.player = Math.max(0, state.hp.player - 10);
    renderBattle(state.currentWord, "wrong", state.hp);
    pulseFeedback("wrong");
    await playBeep("wrong");
    if (state.hp.player <= 0) {
      document.getElementById("game-feedback").textContent = "💖 Kein Game Over - weiter";
      state.hp.player = 50;
    }
  }
}

async function playCurrentWord() {
  const ok = await playFromPath(state.currentWord?.audio_word);
  if (!ok) await playBeep("ok");
}

function openDex() {
  renderDex(state.progress);
  switchScreen("dex");
}

function openMap() {
  renderMap(mapState(state.progress));
  renderMapTiles(MAP, state.progress.player);
  setDuelHint(onDuelTile(state.progress.player));
  switchScreen("map");
}

function movePlayer(dir) {
  const delta = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  }[dir];
  if (!delta) return;

  const target = { x: state.progress.player.x + delta.x, y: state.progress.player.y + delta.y };
  if (!canMoveTo(target.x, target.y)) return;
  state.progress.player = target;
  saveProgress(state.progress);
  renderMapTiles(MAP, state.progress.player);
  setDuelHint(onDuelTile(state.progress.player));
}

function resetAll() {
  state.progress = resetProgress();
  state.hp = { player: 100, enemy: 100 };
  state.solvedInRun.clear();
  renderStars(state.progress.stars);
  openDex();
}

init();
