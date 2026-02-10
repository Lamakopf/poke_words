const screenIds = ["start", "game", "dex", "map"];

export function switchScreen(name) {
  for (const id of screenIds) {
    document.getElementById(`screen-${id}`)?.classList.toggle("active", id === name);
  }
}

export function renderWord(word, solved = false) {
  const wordSlot = document.getElementById("word-display");
  if (!wordSlot) return;
  wordSlot.textContent = solved ? word.display.replace("_", word.answer) : word.display;
}

export function renderMonster(word, mood = "neutral") {
  const monster = document.getElementById("monster-card");
  if (!monster) return;

  const moodMap = {
    neutral: "😶",
    ok: "😄",
    wrong: "🤪",
  };

  const imageLabel = word.image ? `🪄 ${word.id}` : "👾";
  monster.textContent = `${moodMap[mood]} ${imageLabel}`;
  monster.classList.remove("mood-ok", "mood-wrong");
  if (mood === "ok") monster.classList.add("mood-ok");
  if (mood === "wrong") monster.classList.add("mood-wrong");
}

export function renderButtons(buttons, onPick) {
  const area = document.getElementById("answer-buttons");
  area.innerHTML = "";

  buttons.forEach((label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sound-tile";
    button.textContent = label;
    button.addEventListener("click", () => onPick(label));
    area.appendChild(button);
  });
}

export function renderStars(stars) {
  document.getElementById("star-count").textContent = `⭐ ${stars}`;
}

export function pulseFeedback(kind = "ok") {
  const panel = document.getElementById("game-feedback");
  panel.textContent = kind === "ok" ? "✨" : "💫";
  panel.classList.remove("flash-ok", "flash-wrong");
  panel.classList.add(kind === "ok" ? "flash-ok" : "flash-wrong");
}

export function renderDex(progress) {
  const list = document.getElementById("dex-grid");
  list.innerHTML = "";
  const entries = Object.values(progress.dex).sort((a, b) => b.solvedAt - a.solvedAt);

  if (!entries.length) {
    list.innerHTML = '<div class="empty-card">🧩</div>';
    return;
  }

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "dex-card";
    card.innerHTML = `<div class="dex-face">👾</div><div class="dex-word">${entry.display.replace("_", entry.answer)}</div><div class="dex-stars">${"⭐".repeat(entry.stars)}</div>`;
    list.appendChild(card);
  });
}

export function renderMap(state) {
  const map = document.getElementById("map-grid");
  map.innerHTML = "";

  const labels = {
    vokal: "🌳 Vokalwald",
    umlaut: "💧 Umlautsee",
    zwielaut: "🕳️ Zwielauthöhle",
  };

  state.forEach((area) => {
    const zone = document.createElement("article");
    zone.className = "map-card";
    zone.classList.toggle("locked", !area.unlocked);
    zone.innerHTML = `<h3>${labels[area.id]}</h3><p>${area.unlocked ? (area.done ? "⭐" : "✨") : "🔒"}</p>`;
    map.appendChild(zone);
  });
}
