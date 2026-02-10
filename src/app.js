import { loadProgress, saveProgress, resetProgress } from "./storage.js";
import { primeAudio, playFromPath, playBeep } from "./audio.js";
import {
  loadWords,
  nextWord,
  availableButtons,
  evaluateAnswer,
  updateProgress,
  mapState,
} from "./game.js";
import {
  switchScreen,
  renderWord,
  renderMonster,
  renderButtons,
  renderStars,
  pulseFeedback,
  renderDex,
  renderMap,
} from "./ui.js";

const state = {
  words: [],
  progress: loadProgress(),
  currentWord: null,
  solvedInRun: new Set(),
};

const bindTap = (handler) => (event) => {
  primeAudio();
  handler(event);
};

async function init() {
  try {
    state.words = await loadWords();
  } catch {
    document.getElementById("word-display").textContent = "Daten fehlen";
  }

  wireActions();
  renderStars(state.progress.stars);
  switchScreen("start");
}

function wireActions() {
  document.getElementById("btn-play").addEventListener("click", bindTap(startGame));
  document.getElementById("btn-dex").addEventListener("click", bindTap(openDex));
  document.getElementById("btn-map").addEventListener("click", bindTap(openMap));

  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", bindTap(() => switchScreen("start")));
  });

  document.getElementById("btn-word-audio").addEventListener("click", bindTap(playCurrentWord));
  document.getElementById("btn-next").addEventListener("click", bindTap(loadRound));

  document.getElementById("btn-reset").addEventListener("click", bindTap(() => {
    state.progress = resetProgress();
    state.solvedInRun.clear();
    renderStars(state.progress.stars);
    openDex();
  }));
}

function startGame() {
  switchScreen("game");
  loadRound();
}

function loadRound() {
  if (!state.words.length) return;
  state.currentWord = nextWord(state.words, state.progress, state.solvedInRun);
  renderWord(state.currentWord, false);
  renderMonster(state.currentWord, "neutral");
  renderButtons(availableButtons(state.progress), onAnswer);
  pulseFeedback("ok");
}

async function onAnswer(choice) {
  const isCorrect = evaluateAnswer(state.currentWord, choice);
  if (isCorrect) {
    renderMonster(state.currentWord, "ok");
    renderWord(state.currentWord, true);
    pulseFeedback("ok");
    await playBeep("ok");
    updateProgress(state.progress, state.currentWord);
    saveProgress(state.progress);
    state.solvedInRun.add(state.currentWord.id);
    renderStars(state.progress.stars);
    setTimeout(loadRound, 700);
  } else {
    renderMonster(state.currentWord, "wrong");
    pulseFeedback("wrong");
    await playBeep("wrong");
  }
}

async function playCurrentWord() {
  const file = state.currentWord?.audio_word;
  const played = await playFromPath(file);
  if (!played) {
    await playBeep("ok");
  }
}

function openDex() {
  renderDex(state.progress);
  switchScreen("dex");
}

function openMap() {
  renderMap(mapState(state.progress));
  switchScreen("map");
}

init();
