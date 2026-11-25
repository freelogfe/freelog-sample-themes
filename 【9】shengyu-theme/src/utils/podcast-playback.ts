export const podcastRates = [2, 1.5, 1.25, 1, 0.75, 0.5] as const;

export function applyPodcastRate(audio: HTMLMediaElement | undefined, podcast: boolean, rate: number) {
  if (!audio) return;
  const next = podcast && podcastRates.some(value => value === rate) ? rate : 1;
  audio.defaultPlaybackRate = next;
  audio.playbackRate = next;
}

export function seekPodcast(audio: HTMLMediaElement | undefined, offset: number): number | undefined {
  if (!audio || !audio.readyState || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
  const target = Math.min(audio.duration, Math.max(0, audio.currentTime + offset));
  audio.currentTime = target;
  return target;
}
