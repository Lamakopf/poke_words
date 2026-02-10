const CATEGORY_ORDER = ["vokal", "umlaut", "zwielaut"];
const BUTTONS = {
  vokal: ["a", "e", "i", "o", "u"],
  umlaut: ["ä", "ö", "ü"],
  zwielaut: ["au", "ei", "eu"],
};

export const MAP = {
  width: 8,
  height: 6,
  blocked: ["0,0", "0,1", "3,3", "3,4", "6,1", "6,2", "7,2"],
  duelTiles: ["2,1", "5,4", "7,5"],
};

export async function loadWords() {
  const response = await fetch("assets/data/words.json");
  if (!response.ok) throw new Error("Wortdaten konnten nicht geladen werden.");
  return response.json();
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
