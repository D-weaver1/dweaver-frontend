import { materialReadingApi } from "../api/materialReadingApi";

let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

function cleanupCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

export async function playPronunciation(text: string, languageCode: string) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return;
  }

  cleanupCurrentAudio();

  const audioBlob = await materialReadingApi.getPronunciationAudio(
    normalizedText,
    languageCode,
  );

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);

  currentAudio = audio;
  currentAudioUrl = audioUrl;

  audio.addEventListener("ended", cleanupCurrentAudio);
  audio.addEventListener("error", cleanupCurrentAudio);

  await audio.play();
}
