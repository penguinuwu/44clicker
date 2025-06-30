import { init } from "@instantdb/react"

import { PlayerJson, VoteJson } from "$/helpers/types"

const db = init({
  appId: atob(`${import.meta.env.VITE_DB}`),
})

function Manage() {
  const { isLoading, error, data } = db.useQuery({ players: {}, votes: {} })

  if (error) {
    console.debug(error)
    return <p className="italic text-gray-700">Please reload the page...</p>
  }
  if (isLoading) {
    return <p className="italic text-gray-700">Loading...</p>
  }

  const players = data.players as PlayerJson[]
  const votes = data.votes as VoteJson[]

  const playerLeft = players.find((p) => p.position === "left")
  const totalLeft = votes.reduce(
    (total, vote) => total + (vote.left ? 1 : 0),
    0,
  )

  const playerRight = players.find((p) => p.position === "right")
  const totalRight = votes.reduce(
    (total, vote) => total + (vote.right ? 1 : 0),
    0,
  )

  return (
    <>
      {renderClearVotes(votes)}
      {renderRecordVotes(playerLeft, totalLeft, playerRight, totalRight)}
      {renderPlayers(players, playerLeft, playerRight)}
      {renderPlayerPositionReset(players)}
    </>
  )
}

function renderClearVotes(votes: VoteJson[]) {
  return (
    <button
      onClick={() => {
        votes.forEach((vote) => {
          db.transact(
            db.tx.votes[vote.id].update({ left: false, right: false }),
          )
        })
      }}
    >
      clear votes
    </button>
  )
}

function renderRecordVotes(
  playerLeft: PlayerJson | undefined,
  totalLeft: number,
  playerRight: PlayerJson | undefined,
  totalRight: number,
) {
  return (
    <>
      <p>
        {playerLeft?.name}:{totalLeft}
      </p>
      <p>
        {playerRight?.name}:{totalRight}
      </p>
      <button
        onClick={() => {
          if (playerLeft) {
            db.transact(
              db.tx.players[playerLeft.id].update({ votes: totalLeft }),
            )
          }

          if (playerRight) {
            db.transact(
              db.tx.players[playerRight.id].update({ votes: totalRight }),
            )
          }
        }}
      >
        tally votes
      </button>
    </>
  )
}

function renderPlayers(
  players: PlayerJson[],
  playerLeft: PlayerJson | undefined,
  playerRight: PlayerJson | undefined,
) {
  return (
    <ul>
      {players.map((player) => (
        <li key={player.id}>
          name:'{player.name}' votes:'{player.votes}' {player.position}
          <button
            onClick={() => {
              if (playerLeft) updatePosition(playerLeft.id, null)
              updatePosition(player.id, "left")
            }}
            disabled={player.id === playerLeft?.id}
          >
            left
          </button>
          <button
            onClick={() => {
              if (playerRight) updatePosition(playerRight.id, null)
              updatePosition(player.id, "right")
            }}
            disabled={player.id === playerRight?.id}
          >
            right
          </button>
          <button onClick={() => updatePosition(player.id, null)}>clear</button>
        </li>
      ))}
    </ul>
  )
}

function renderPlayerPositionReset(players: PlayerJson[]) {
  return (
    <button
      onClick={() => {
        players.forEach((player) => updatePosition(player.id, null))
      }}
    >
      reset players
    </button>
  )
}

function updatePosition(id: string, pos: "left" | "right" | null) {
  console.debug(db.transact(db.tx.players[id].update({ position: pos })))
}

export default Manage
