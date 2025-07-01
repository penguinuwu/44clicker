export type ScoreJson = {
  id: string
  hash: string
  videoId: string
  judgeName: string
  date: number
  scores: [number, number][]
}

export type PlayerJson = {
  id: string
  name: string
  votes: number
  position?: "top" | "bottom"
}

export type VoteJson = {
  id: string
  top?: boolean
  bottom?: boolean
}
