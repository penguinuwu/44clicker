import { id, init } from "@instantdb/react"
import Button from "@mui/material/Button"
import TextareaAutosize from "@mui/material/TextareaAutosize"
import { useState } from "react"

import { PlayerJson, VoteJson } from "$/helpers/types"

const db = init({
  appId: atob(`${import.meta.env.VITE_DB}`),
})

let bingus = localStorage.getItem("bingus")

function Manage() {
  // add new player name
  const [newName, setNewName] = useState<string | null>(null)

  // subscribe for player/vote changes
  const { isLoading, error, data } = db.useQuery({
    players: {},
    votes: {},
    bingus: {},
  })

  if (error) {
    console.debug(error)
    return <p className="italic text-gray-700">Please reload the page...</p>
  }
  if (isLoading) {
    return <p className="italic text-gray-700">Loading...</p>
  }

  const checkBingus = (bgs: string | null) =>
    data?.bingus?.some((b) => b?.str === bgs)
  if (bingus === null || !checkBingus(bingus)) {
    bingus = prompt("yo yo")
    if (!checkBingus(bingus)) {
      return <p className="italic text-gray-700">Please reload the page...</p>
    }
    localStorage.setItem("bingus", `${bingus}`)
  }

  const players = data.players as PlayerJson[]
  const votes = data.votes as VoteJson[]

  const playerTop = players.find((p) => p.position === "top")
  const totalTop = votes.reduce((total, vote) => total + (vote.top ? 1 : 0), 0)

  const playerBottom = players.find((p) => p.position === "bottom")
  const totalBottom = votes.reduce(
    (total, vote) => total + (vote.bottom ? 1 : 0),
    0,
  )

  return (
    <>
      <p>
        1. {renderRecordVotes(playerTop, totalTop, playerBottom, totalBottom)}
      </p>
      <p>2. {renderPlayerPositionReset(players)}</p>
      <p>3. {renderClearVotes(votes)}</p>

      {renderPlayers(players, playerTop, playerBottom)}

      <div>
        <TextareaAutosize
          onChange={(e) => setNewName(e.target.value)}
          value={newName ?? ""}
          minRows={3}
        />
        <Button
          onClick={() => {
            db.transact(
              db.tx.players[id()].update({
                name: newName,
                votes: 0,
              }),
            )
              .then(() => setNewName(null))
              .catch((e) => setNewName(e))
          }}
          disabled={!newName}
        >
          add
        </Button>
      </div>
    </>
  )
}

function renderClearVotes(votes: VoteJson[]) {
  return (
    <Button
      onClick={() => {
        votes.forEach((vote) => {
          db.transact(
            db.tx.votes[vote.id].update({ top: false, bottom: false }),
          )
        })
      }}
    >
      clear votes
    </Button>
  )
}

function renderRecordVotes(
  playerTop: PlayerJson | undefined,
  totalTop: number,
  playerBottom: PlayerJson | undefined,
  totalBottom: number,
) {
  return (
    <>
      <p>
        {playerTop?.name ?? "top player not selected"} | Votes: {totalTop}
      </p>
      <p>
        {playerBottom?.name ?? "bottom player not selected"} | Votes:{" "}
        {totalBottom}
      </p>
      <Button
        onClick={() => {
          if (playerTop) {
            db.transact(db.tx.players[playerTop.id].update({ votes: totalTop }))
          }

          if (playerBottom) {
            db.transact(
              db.tx.players[playerBottom.id].update({ votes: totalBottom }),
            )
          }
        }}
      >
        record votes
      </Button>
    </>
  )
}

function renderPlayers(
  players: PlayerJson[],
  playerTop: PlayerJson | undefined,
  playerBottom: PlayerJson | undefined,
) {
  return (
    <ul>
      {players.map((player) => (
        <li key={player.id}>
          {player.name} - votes:{player.votes} - {player.position}
          <br />
          <Button
            onClick={() => {
              if (playerTop) updatePosition(playerTop.id, null)
              updatePosition(player.id, "top")
            }}
            disabled={player.id === playerTop?.id}
          >
            top
          </Button>
          <Button
            onClick={() => {
              if (playerBottom) updatePosition(playerBottom.id, null)
              updatePosition(player.id, "bottom")
            }}
            disabled={player.id === playerBottom?.id}
          >
            bottom
          </Button>
          <Button onClick={() => updatePosition(player.id, null)}>clear</Button>
          <Button
            onClick={() => db.transact(db.tx.players[player.id].delete())}
          >
            delete
          </Button>
        </li>
      ))}
    </ul>
  )
}

function renderPlayerPositionReset(players: PlayerJson[]) {
  return (
    <Button
      onClick={() => {
        players.forEach((player) => updatePosition(player.id, null))
      }}
    >
      reset players
    </Button>
  )
}

function updatePosition(id: string, pos: "top" | "bottom" | null) {
  db.transact(db.tx.players[id].update({ position: pos }))
}

export default Manage
