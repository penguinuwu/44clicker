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
  position?: "left" | "right"
}

export type VoteJson = {
  id: string
  left?: boolean
  right?: boolean
}
