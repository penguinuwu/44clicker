import Highcharts, { Chart } from "highcharts"
import HighchartsReact from "highcharts-react-official"
import { useCallback, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import { AppMode } from "../constants"
import { deleteClick } from "../scoringHandler"
import { formatTimestamp } from "../utils"
import MyToolTip from "./MyToolTip"

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
        options={{
          title: { text: "Technical Evaluation Score Graph" },
          subtitle: {
            text:
              document.ontouchstart === undefined
                ? "Click and drag in the plot area to zoom in"
                : "Pinch the chart to zoom in",
          },
          credits: { text: "🤍" },
          chart: { animation: true, zooming: { type: "x" } },
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
                  [0, "#90ee90"],
                  [1, Highcharts.color("#90ee90").setOpacity(0).get("rgba")],
                ],
              },
              negativeFillColor: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, "#f08080"],
                  [1, Highcharts.color("#f08080").setOpacity(0).get("rgba")],
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
            backgroundColor: "#000000",
            borderRadius: 6,
            borderColor: "#000000",
            valueDecimals: 2,
            animation: true,
            style: {
              color: "white",
              opacity: 0.75,
              pointerEvents: "auto",
            },
            hideDelay: 100,
            outside: true,
            stickOnContact: true,
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
            <>
              <button
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
              </button>

              <span>
                {" "}
                {point.y === undefined || point.y >= 0 ? "+" : ""}
                {point.y}{" "}
              </span>

              <button
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
              </button>
            </>
          )
        }}
      />
    </>
  )
}

export default LookAtThisGraph
