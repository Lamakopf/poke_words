let currentAudio = null;
let unlockedByTap = false;

export function primeAudio() {
  if (unlockedByTap) return;
  const silent = new Audio();
  silent.volume = 0;
  silent.play().catch(() => {});
  unlockedByTap = true;
}

export function stopAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

export async function playFromPath(path) {
  stopAudio();
  if (!path) return false;

  const audio = new Audio(path);
  currentAudio = audio;
  try {
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

export async function playBeep(type = "ok") {
  stopAudio();
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = "sine";
  osc.frequency.value = type === "ok" ? 700 : 350;
  gain.gain.value = 0.08;

  osc.connect(gain);
  gain.connect(context.destination);

  osc.start();
  osc.stop(context.currentTime + 0.18);

  return new Promise((resolve) => {
    osc.onended = () => {
      context.close();
      resolve(true);
    };
  });
}
