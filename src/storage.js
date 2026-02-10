const STORAGE_KEY = "lautland_save_v1";

const defaultProgress = {
  stars: 0,
  unlocked: {
    vokal: true,
    umlaut: false,
    zwielaut: false,
  },
  dex: {},
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultProgress);
    return mergeProgress(JSON.parse(raw));
  } catch {
    return structuredClone(defaultProgress);
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress() {
  const fresh = structuredClone(defaultProgress);
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
  };
}
