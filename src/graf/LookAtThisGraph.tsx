import DeleteIcon from "@mui/icons-material/Delete"
import ReplayIcon from "@mui/icons-material/Replay"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import Highcharts, { Chart } from "highcharts"
import HighchartsReact from "highcharts-react-official"
// import "highcharts/css/highcharts.css" // disabled, tooltip broken
import { useCallback, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import MyToolTip from "$/graf/MyToolTip"
import { deleteClick } from "$/handlers/scoringHandler"
import { AppMode } from "$/helpers/constants"
import { formatTimestamp } from "$/helpers/utils"

interface Props {
  appMode: AppMode
  youtubePlayer: React.MutableRefObject<YouTubePlayer | null>
  videoDuration: number
  displayScoreMapArray: [number, number][]
  scoreMapArray: [number, number][]
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>
}

function LookAtThisGraph({
  appMode,
  youtubePlayer,
  videoDuration,
  displayScoreMapArray,
  scoreMapArray,
  setScoreMap,
}: Props) {
  const [chart, setChart] = useState<Highcharts.Chart | null>(null)
  const callback = useCallback((chart: Chart) => setChart(chart), [])

  return (
    <>
      <HighchartsReact
        highcharts={Highcharts}
        containerProps={{ style: { flexGrow: 1 } }}
        options={{
          title: { text: "Technical Evaluation Score" },
          subtitle: {
            text:
              document.ontouchstart === undefined
                ? "Click and drag in the plot area to zoom in / Click on the points to view or delete clicks"
                : "Pinch the chart to zoom in / Tap on the points to view or delete clicks",
          },
          credits: { text: "🤍" },
          chart: {
            animation: true,
            zooming: { type: "x" },
            // styledMode: true, // disabled, tooltip broken
          },
          xAxis: {
            title: { text: "Video Time" },
            type: "datetime",
            max: videoDuration * 1000,
            min: 0,
            labels: { format: "{value:%M:%S}" },
            crosshair: true,
          },
          yAxis: {
            title: { text: "Technical Score" },
            type: "number",
            crosshair: true,
          },
          plotOptions: {
            series: {
              cumulative: true,
              pointStart: 0,
              pointInterval: 10,
            },
          },
          series: [
            {
              name: "Score +1",
              type: "scatter",
              color: "lightgreen",
              marker: { symbol: "circle" },
              findNearestPointBy: "x",
              stickyTracking: true,
              data: scoreMapArray.map(([t, c]) => {
                // map values to null instead of filtering to preserve index
                return { x: t * 1000, y: c > 0 ? c : null }
              }),
            },
            {
              name: "Score -1",
              type: "scatter",
              color: "lightcoral",
              marker: { symbol: "circle" },
              findNearestPointBy: "x",
              stickyTracking: true,
              data: scoreMapArray.map(([t, c]) => {
                // map values to null instead of filtering to preserve index
                return { x: t * 1000, y: c < 0 ? c : null }
              }),
            },
            {
              name: "Total Score",
              type: "area",
              color: "black",
              enableMouseTracking: false,
              fillColor: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, Highcharts.color("#90ee90").setOpacity(0.5).get("rgba")],
                  [1, Highcharts.color("#90ee90").setOpacity(0).get("rgba")],
                ],
              },
              negativeFillColor: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, Highcharts.color("#f08080").setOpacity(0).get("rgba")],
                  [1, Highcharts.color("#f08080").setOpacity(0.5).get("rgba")],
                ],
              },
              marker: {
                enabled: true,
                symbol: "circle",
                radius: 2,
              },
              data: displayScoreMapArray.map(
                // https://stackoverflow.com/a/47095386
                (
                  (sum) =>
                  ([t, c]) =>
                    [t * 1000, (sum += c)]
                )(0),
              ),
            },
          ],
          tooltip: {
            useHTML: true,
            animation: true,
            hideDelay: 100,
            stickOnContact: true,
            // outside: true,
            // followPointer: true,
          },
        }}
        callback={callback}
        ignore
      />

      <MyToolTip
        chart={chart}
        youtubePlayer={youtubePlayer}
        children={({ point }) => {
          return (
            <Stack spacing={1} direction="row" alignItems="center">
              <Button
                color="success"
                startIcon={<ReplayIcon />}
                onClick={() => {
                  // array timestamp used, point.x might have float error
                  // go to 1 second before the click
                  youtubePlayer.current?.seekTo(
                    Math.max(scoreMapArray[point.index][0] - 2, 0),
                  )
                  youtubePlayer.current?.getInternalPlayer()?.playVideo()
                }}
              >
                {formatTimestamp(point.x / 1000, videoDuration)}
              </Button>

              <Typography
                color={
                  point.y === undefined || point.y >= 0 ? "success" : "error"
                }
              >
                {point.y === undefined || point.y >= 0 ? "+" : ""}
                {point.y}
              </Typography>

              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() =>
                  deleteClick(
                    appMode,
                    setScoreMap,
                    // array timestamp used, point.x might have float error
                    scoreMapArray[point.index][0],
                  )
                }
                disabled={appMode === AppMode.Playback}
              >
                Delete
              </Button>
            </Stack>
          )
        }}
      />
    </>
  )
}

export default LookAtThisGraph
