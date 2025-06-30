import { init } from "@instantdb/react"

import { PlayerJson, VoteJson } from "$/helpers/types"

const db = init({
  appId: atob(`${import.meta.env.VITE_DB}`),
})

function Results() {
  const { isLoading, error, data } = db.useQuery({ players: {}, votes: {} })

  if (error) {
    console.debug(error)
    return <p className="italic text-gray-700">Please reload the page...</p>
  }
  if (isLoading || data?.players.length === 0) {
    return <p className="italic text-gray-700">Loading...</p>
  }

  const players = data.players as PlayerJson[]
  const playerLeft = players.find((p) => p.position === "left")
  const playerRight = players.find((p) => p.position === "right")

  if (!playerLeft || !playerRight) {
    return <p className="italic text-gray-700">Loading...</p>
  }

  const votes = data.votes as VoteJson[]

  return (
    <>
      <p>
        {playerLeft.name}:
        {votes.reduce((total, vote) => total + (vote.left ? 1 : 0), 0)}
      </p>
      <p>
        {playerRight.name}:
        {votes.reduce((total, vote) => total + (vote.right ? 1 : 0), 0)}
      </p>
    </>
  )
}

export default Results
