import {
  Chart,
  TooltipFormatterCallbackFunction,
  TooltipFormatterContextObject,
} from "highcharts"
import { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import YouTubePlayer from "react-player/youtube"

function generateTooltipId(chartId: number) {
  return `highcharts-custom-tooltip-${chartId}`
}

interface Props {
  chart: Chart | null
  youtubePlayer: React.MutableRefObject<YouTubePlayer | null>
  children(formatterContext: TooltipFormatterContextObject): JSX.Element
}

function MyToolTip({ chart, children }: Props) {
  const isInit = useRef(false)
  const [context, setContext] = useState<TooltipFormatterContextObject | null>(
    null,
  )

  useEffect(() => {
    if (chart) {
      const formatter: TooltipFormatterCallbackFunction = function () {
        if (!isInit.current) {
          isInit.current = true

          chart.tooltip.refresh.apply(chart.tooltip, [this.point])
          chart.tooltip.hide(0)
        }

        console.info(this)
        setContext(this)

        return `<div id="${generateTooltipId(chart.index)}"></div>`
      }

      chart.update({
        tooltip: {
          formatter,
          useHTML: true,
          style: {
            "vertical-algin": "top",
            top: "0px",
          },
        },
      })
    }
  }, [chart?.tooltip])

  console.info(context)

  useEffect(() => {
    if (context) {
      const tooltip: any = context.series.chart.tooltip
      const textEl = tooltip.label.text.element

      console.info(textEl.offsetWidth)
      tooltip.label.box.attr({
        height: textEl.offsetHeight + 12,
        width: textEl.offsetWidth + 16,
      })

      tooltip.label.attr({
        height: 0,
      })

      tooltip.label.text.css({
        top: "8px",
      })
    }
  }, [chart, context])

  const node = chart && document.getElementById(generateTooltipId(chart.index))

  return node && context ? ReactDOM.createPortal(children(context), node) : null
}

export default MyToolTip
