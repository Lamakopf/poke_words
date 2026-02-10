const CATEGORY_ORDER = ["vokal", "umlaut", "zwielaut"];
const BUTTONS = {
  vokal: ["a", "e", "i", "o", "u"],
  umlaut: ["ä", "ö", "ü"],
  zwielaut: ["au", "ei", "eu"],
};

const FALLBACK_WORDS = [
  { id: "hase", display: "H _ se", answer: "a", category: "vokal", level: 1, image: "assets/img/monsters/monster_flora.svg", audio_word: "assets/audio/woerter/hase.mp3" },
  { id: "igel", display: "_ gel", answer: "i", category: "vokal", level: 1, image: "assets/img/monsters/monster_wave.svg", audio_word: "assets/audio/woerter/igel.mp3" },
  { id: "ofen", display: "_ fen", answer: "o", category: "vokal", level: 1, image: "assets/img/monsters/monster_ember.svg", audio_word: "assets/audio/woerter/ofen.mp3" },
  { id: "baer", display: "B _ r", answer: "ä", category: "umlaut", level: 2, image: "assets/img/monsters/monster_flora.svg", audio_word: "assets/audio/woerter/baer.mp3" },
  { id: "floete", display: "Fl _ te", answer: "ö", category: "umlaut", level: 2, image: "assets/img/monsters/monster_wave.svg", audio_word: "assets/audio/woerter/floete.mp3" },
  { id: "tuer", display: "T _ r", answer: "ü", category: "umlaut", level: 2, image: "assets/img/monsters/monster_ember.svg", audio_word: "assets/audio/woerter/tuer.mp3" },
  { id: "maus", display: "M _ s", answer: "au", category: "zwielaut", level: 3, image: "assets/img/monsters/monster_flora.svg", audio_word: "assets/audio/woerter/maus.mp3" },
  { id: "seil", display: "S _ l", answer: "ei", category: "zwielaut", level: 3, image: "assets/img/monsters/monster_wave.svg", audio_word: "assets/audio/woerter/seil.mp3" },
  { id: "eule", display: "_ le", answer: "eu", category: "zwielaut", level: 3, image: "assets/img/monsters/monster_ember.svg", audio_word: "assets/audio/woerter/eule.mp3" },
];

export const MAP = {
  width: 8,
  height: 6,
  blocked: ["0,0", "0,1", "3,3", "3,4", "6,1", "6,2", "7,2"],
  duelTiles: ["2,1", "5,4", "7,5"],
};

export async function loadWords() {
  try {
    const response = await fetch("assets/data/words.json", { cache: "no-store" });
    if (!response.ok) throw new Error("no words file");
    const data = await response.json();
    if (Array.isArray(data) && data.length) return data;
  } catch {
    // Öffnen per file:// kann fetch blockieren -> lokaler Fallback hält das Spiel spielbar.
  }
  return FALLBACK_WORDS;
}

export function currentCategory(progress) {
  if (progress.unlocked.zwielaut) return "zwielaut";
  if (progress.unlocked.umlaut) return "umlaut";
  return "vokal";
}

export function availableButtons(progress) {
  const set = [...BUTTONS.vokal];
  if (progress.unlocked.umlaut) set.push(...BUTTONS.umlaut);
  if (progress.unlocked.zwielaut) set.push(...BUTTONS.zwielaut);
  return set;
}

export function nextWord(words, progress, solvedInRun = new Set()) {
  const cat = currentCategory(progress);
  const list = words.filter((word) => word.category === cat);
  const unsolved = list.filter((w) => !solvedInRun.has(w.id));
  const pool = unsolved.length ? unsolved : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const evaluateAnswer = (word, choice) => word.answer.toLowerCase() === choice.toLowerCase();

export function updateProgress(progress, word) {
  const now = Date.now();
  const entry = progress.dex[word.id];
  if (!entry) {
    progress.dex[word.id] = {
      id: word.id,
      category: word.category,
      stars: 1,
      solvedAt: now,
      display: word.display,
      answer: word.answer,
      image: word.image,
    };
  } else {
    entry.stars = Math.min(entry.stars + 1, 3);
    entry.solvedAt = now;
  }
  progress.stars += 1;
  unlockAreas(progress);
}

function unlockAreas(progress) {
  const vokalSolved = countByCategory(progress.dex, "vokal");
  const umlautSolved = countByCategory(progress.dex, "umlaut");
  if (!progress.unlocked.umlaut && (progress.stars >= 6 || vokalSolved >= 3)) progress.unlocked.umlaut = true;
  if (!progress.unlocked.zwielaut && (progress.stars >= 12 || umlautSolved >= 3)) progress.unlocked.zwielaut = true;
}

function countByCategory(dex, category) {
  return Object.values(dex).filter((entry) => entry.category === category).length;
}

export function mapState(progress) {
  return CATEGORY_ORDER.map((category) => ({
    id: category,
    unlocked: progress.unlocked[category],
    done: Object.values(progress.dex).some((entry) => entry.category === category),
  }));
}

export function canMoveTo(x, y) {
  if (x < 0 || y < 0 || x >= MAP.width || y >= MAP.height) return false;
  return !MAP.blocked.includes(`${x},${y}`);
}

export function onDuelTile(pos) {
  return MAP.duelTiles.includes(`${pos.x},${pos.y}`);
}
