const screenIds = ["start", "game", "dex", "map"];

export function switchScreen(name) {
  screenIds.forEach((id) => {
    document.getElementById(`screen-${id}`)?.classList.toggle("active", id === name);
  });
}

export function renderWord(word, solved = false) {
  const slot = document.getElementById("word-display");
  if (!slot || !word) return;
  slot.textContent = solved ? word.display.replace("_", word.answer) : word.display;
}

export function renderBattle(word, mood = "neutral", hp = { player: 100, enemy: 100 }) {
  const enemyImg = document.getElementById("enemy-monster");
  const playerImg = document.getElementById("player-monster");
  const emoji = mood === "ok" ? "😄" : mood === "wrong" ? "🤪" : "😶";

  if (enemyImg) {
    enemyImg.src = word?.image || "assets/img/monsters/monster_flora.svg";
    enemyImg.alt = word?.id || "Monster";
  }
  if (playerImg) {
    playerImg.src = "assets/img/ui/avatar.svg";
    playerImg.alt = "Spieler";
  }
  document.getElementById("enemy-mood").textContent = emoji;
  document.getElementById("hp-player").style.width = `${hp.player}%`;
  document.getElementById("hp-enemy").style.width = `${hp.enemy}%`;
}

export function renderButtons(buttons, onPick) {
  const area = document.getElementById("answer-buttons");
  area.innerHTML = "";
  buttons.forEach((label) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sound-tile";
    btn.textContent = label;
    btn.addEventListener("click", () => onPick(label));
    area.appendChild(btn);
  });
}

export const renderStars = (stars) => {
  document.getElementById("star-count").textContent = `⭐ ${stars}`;
};

export function pulseFeedback(kind = "ok") {
  const panel = document.getElementById("game-feedback");
  panel.textContent = kind === "ok" ? "✨ Treffer" : "💫 Nochmal";
  panel.className = `feedback ${kind === "ok" ? "flash-ok" : "flash-wrong"}`;
}

export function renderDex(progress) {
  const list = document.getElementById("dex-grid");
  const entries = Object.values(progress.dex).sort((a, b) => b.solvedAt - a.solvedAt);
  list.innerHTML = entries.length ? "" : '<div class="empty-card">Noch leer</div>';

  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "dex-card";
    card.innerHTML = `
      <img src="${entry.image || "assets/img/monsters/monster_flora.svg"}" alt="${entry.id}" />
      <div class="dex-word">${entry.display.replace("_", entry.answer)}</div>
      <div class="dex-stars">${"⭐".repeat(entry.stars)}</div>
    `;
    list.appendChild(card);
  });
}

export function renderMapTiles(map, player) {
  const grid = document.getElementById("map-grid");
  grid.style.setProperty("--w", map.width);
  grid.innerHTML = "";

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "map-tile";
      const key = `${x},${y}`;
      if (map.blocked.includes(key)) cell.classList.add("water");
      if (map.duelTiles.includes(key)) cell.classList.add("duel");
      if (player.x === x && player.y === y) {
        cell.classList.add("player");
        cell.textContent = "🧍";
      }
      grid.appendChild(cell);
    }
  }
}

export function setDuelHint(active) {
  document.getElementById("duel-hint").textContent = active ? "⚔️ Duell hier möglich" : "⬇️ Laufe weiter";
  document.getElementById("btn-start-duel").disabled = !active;
}

export function renderMap(state) {
  const mapInfo = document.getElementById("map-progress");
  mapInfo.innerHTML = state
    .map((area) => `<span class="chip ${area.unlocked ? "on" : "off"}">${area.id}</span>`)
    .join("");
}
