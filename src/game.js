const CATEGORY_ORDER = ["vokal", "umlaut", "zwielaut"];
const BUTTONS = {
  vokal: ["a", "e", "i", "o", "u"],
  umlaut: ["ä", "ö", "ü"],
  zwielaut: ["au", "ei", "eu"],
};

export async function loadWords() {
  const response = await fetch("assets/data/words.json");
  if (!response.ok) {
    throw new Error("Wortdaten konnten nicht geladen werden.");
  }
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
  return (unsolved.length ? unsolved : list)[Math.floor(Math.random() * list.length)];
}

export function evaluateAnswer(word, choice) {
  return word.answer.toLowerCase() === choice.toLowerCase();
}

export function updateProgress(progress, word) {
  const now = Date.now();
  if (!progress.dex[word.id]) {
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
    progress.dex[word.id].stars = Math.min(progress.dex[word.id].stars + 1, 3);
    progress.dex[word.id].solvedAt = now;
  }

  progress.stars += 1;
  unlockAreas(progress);
}

function unlockAreas(progress) {
  const umlautSolved = countByCategory(progress.dex, "umlaut");
  const vokalSolved = countByCategory(progress.dex, "vokal");
  const zwielautSolved = countByCategory(progress.dex, "zwielaut");

  if (!progress.unlocked.umlaut && (progress.stars >= 6 || vokalSolved >= 3)) {
    progress.unlocked.umlaut = true;
  }

  if (!progress.unlocked.zwielaut && (progress.stars >= 12 || umlautSolved >= 3)) {
    progress.unlocked.zwielaut = true;
  }

  if (zwielautSolved >= 3) {
    progress.stars = Math.max(progress.stars, 15);
  }
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
