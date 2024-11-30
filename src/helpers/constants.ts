export enum StorageKey {
  JudgeName = "JUDGE_NAME",
  KeyPositive = "KEY_POSITIVE",
  KeyNegative = "KEY_NEGATIVE",
}

export enum AppMode {
  Scoring = "SCORING",
  Playback = "PLAYBACK",
}

export enum PlayerStates {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  VIDEO_CUED = 5,
}

export const JUDGE_NAME_LIMIT = 30

// interval delay in milliseconds
// humans can perceive every ~10ms
// so for clicker playback, we run an interval every 10ms
// https://stackoverflow.com/a/23768739
export const INTERVAL_DELAY = 10

// delay in seconds
// max delay before skipping clicks
// it's unlikely for users to intentionally seek +/- 50ms
export const INTERVAL_DELAY_THRESHOLD = 0.05

// box-shadow syntax:
// <inset> <offset-x> <offset-y> <blur-radius> <spread-radius> <colour>
// inset: inner box-shadow
export const KEYFRAMES_POSITIVE = {
  easing: "ease-out",
  boxShadow: ["inset 0 0 0.2em 0.8em #32cd32", "none"],
}
export const KEYFRAMES_NEGATIVE = {
  easing: "ease-out",
  boxShadow: ["inset 0 0 0.2em 0.8em #ff0000", "none"],
}
export const ANIME_OPTIONS = {
  duration: 500,
  iterations: 1,
  pseudoElement: "::before",
}
