import { init } from "@instantdb/react"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import CircularProgress from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

import HeaderBar from "$/components/battle-voting/HeaderBar"
import { PlayerJson, VoteJson } from "$/helpers/types"

const db = init({
  appId: atob(`${import.meta.env.VITE_DB}`),
})

function Results() {
  const { isLoading, error, data } = db.useQuery({ players: {}, votes: {} })

  if (error) {
    console.debug(error)
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <Alert severity="error">Please reload the page...</Alert>
      </Box>
    )
  }
  if (isLoading || data?.players.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography mt={2} sx={{ fontFamily: "monospace" }}>
          Loading...
        </Typography>
      </Box>
    )
  }

  const players = data.players as PlayerJson[]
  const playerTop = players.find((p) => p.position === "top")
  const playerBottom = players.find((p) => p.position === "bottom")

  if (!playerTop || !playerBottom) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography mt={2} sx={{ fontFamily: "monospace" }}>
          Preparing players...
        </Typography>
      </Box>
    )
  }

  const votes = data.votes as VoteJson[]
  const topVotes = votes.reduce(
    (total, vote) => total + (vote.top ? 1 : 0),
    0,
  )
  const bottomVotes = votes.reduce(
    (total, vote) => total + (vote.bottom ? 1 : 0),
    0,
  )

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "bar",
      height: 500,
      backgroundColor: "transparent",
    },
    title: { text: undefined },
    xAxis: {
      categories: [playerTop.name, playerBottom.name],
      title: { text: null },
      labels: { style: { fontSize: "2rem" } },
    },
    yAxis: {
      min: 0,
      allowDecimals: false,
      title: { text: "Votes", align: "high" },
      labels: { overflow: "justify", style: { fontSize: "1rem" } },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          style: { fontSize: "1.2rem", fontWeight: "600" },
        },
        borderRadius: 20,
        pointPadding: 0.1,
        groupPadding: 0.1,
      },
      series: {
        animation: true,
      },
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: [
      {
        name: "Votes",
        type: "bar",
        data: [topVotes, bottomVotes],
        colorByPoint: true,
        colors: ["#1976d2", "#d32f2f"],
      },
    ],
    responsive: {
      rules: [
        {
          condition: { maxWidth: 1000 },
          chartOptions: {
            chart: { height: 500 },
            title: { style: { fontSize: "1rem" } },
            xAxis: { labels: { style: { fontSize: "0.9rem" } } },
            yAxis: { labels: { style: { fontSize: "0.9rem" } } },
            plotOptions: {
              bar: { dataLabels: { style: { fontSize: "1rem" } } },
            },
          },
        },
      ],
    },
  }

  return (
    <>
      <HeaderBar />

      <Box
        margin={2}
        sx={{
          m: { xs: 1, md: 1, lg: 2, xl: 3 },
          p: { xs: 1, sm: 2 },
        }}
      >
        <Card
          sx={{
            textAlign: "center",
            display: "block",
            px: { xs: 0, sm: 3, md: 5, lg: 20, xl: 30 },
            py: { xs: 10, sm: 12, md: 14 },
          }}
        >
          <CardHeader
            title="Live Vote Results"
            titleTypographyProps={{ variant: "h2" }}
          />
          <CardContent>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </CardContent>
        </Card>
      </Box>
    </>
  )
}

export default Results
