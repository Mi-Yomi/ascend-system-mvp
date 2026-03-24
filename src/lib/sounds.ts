let audioCache: HTMLAudioElement | null = null

export function playQuestComplete() {
  if (typeof window === 'undefined') return

  if (!audioCache) {
    audioCache = new Audio('/sounds/quest-complete.mp3')
    audioCache.volume = 0.7
  }

  // Reset and play (allows rapid re-trigger)
  audioCache.currentTime = 0
  audioCache.play().catch(() => {})
}
