export enum StorageKey {
  JudgeName = "JUDGE_NAME", // TODO: not implemented yet
  KeyPositive = "KEY_POSITIVE",
  KeyNegative = "KEY_NEGATIVE",
}

export enum AppMode {
  Scoring = "SCORING",
  Playback = "PLAYBACK",
}

export const keyframesPositive = {
  easing: "ease-out",
  boxShadow: ["0 0 4em 2em darkgreen", "none"],
}
export const keyframesNegative = {
  easing: "ease-out",
  boxShadow: ["0 0 4em 2em crimson", "none"],
}
export const animeOptions = {
  duration: 800,
  iterations: 1,
}
