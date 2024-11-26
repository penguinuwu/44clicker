import { Chart, TooltipFormatterContextObject } from "highcharts"
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

/**
 * this thread is so good
 * https://www.highcharts.com/forum/viewtopic.php?t=50147
 */
function MyToolTip({ chart, children }: Props) {
  const isInit = useRef(false)
  const [context, setContext] = useState<TooltipFormatterContextObject | null>(
    null,
  )

  useEffect(() => {
    if (chart) {
      chart.update({
        tooltip: {
          formatter: function () {
            if (!isInit.current) {
              isInit.current = true

              chart.tooltip.refresh.apply(chart.tooltip, [this.point])
              chart.tooltip.hide(0)
            }

            console.debug(this)
            setContext(this)

            return `<div id="${generateTooltipId(chart.index)}"></div>`
          },
          useHTML: true,
        },
      })
    }
  }, [chart?.tooltip])

  console.debug(context)

  useEffect(() => {
    if (context) {
      const tooltip: any = context.series.chart.tooltip

      if (tooltip?.label) {
        const textEl = tooltip.label.text.element

        console.debug(textEl.offsetWidth)
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
    }
  }, [chart, context])

  const node = chart && document.getElementById(generateTooltipId(chart.index))

  return node && context ? ReactDOM.createPortal(children(context), node) : null
}

export default MyToolTip
