const STORAGE_KEY = "lautland_save_v1";

const defaultProgress = {
  stars: 0,
  unlocked: { vokal: true, umlaut: false, zwielaut: false },
  dex: {},
  player: { x: 1, y: 1 },
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultProgress);
    return mergeProgress(JSON.parse(raw));
  } catch {
    return clone(defaultProgress);
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress() {
  const fresh = clone(defaultProgress);
  saveProgress(fresh);
  return fresh;
}

function mergeProgress(data) {
  return {
    stars: Number.isFinite(data?.stars) ? data.stars : 0,
    unlocked: {
      vokal: true,
      umlaut: Boolean(data?.unlocked?.umlaut),
      zwielaut: Boolean(data?.unlocked?.zwielaut),
    },
    dex: data?.dex && typeof data.dex === "object" ? data.dex : {},
    player: {
      x: Number.isInteger(data?.player?.x) ? data.player.x : 1,
      y: Number.isInteger(data?.player?.y) ? data.player.y : 1,
    },
  };
}
