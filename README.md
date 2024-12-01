# 44Clicker

A React web application for scoring yo-yo routines with real-time visualization and cloud storage.

## Features

- **YouTube Integration**: Watch and score YouTube videos in real-time
- **Interactive Scoring**: Use keyboard shortcuts for quick +1/-1 clicks
- **Data Visualization**: View scores with an interactive [Highcharts](https://highcharts.com/) graph
- **Score Management**:
  - Add/delete individual scores
  - Upload scores to cloud
  - Export scores to file
  - Import scores from file
- **Replay Mode**: Review and analyze scoring patterns
- **Responsive Design**: Built with [Material UI](https://mui.com/) components, supporting all screen sizes

## Tools Used

- [React v18](https://react.dev/)
- [InstantDB](https://instantdb.com/)
- [Vite](https://vite.dev/)
- [Highcharts](https://highcharts.com/)
- [ReactPlayer](https://github.com/cookpete/react-player/)
- [Material UI](https://mui.com/)
- [TypeScript](https://typescriptlang.org/)

## Project Structure

```plaintext
44clicker/
├── src/
│   ├── components/             # React components
│   │   ├── App.tsx               # Main application component
│   │   ├── HeaderBar.tsx         # Navigation and main actions
│   │   ├── FooterBar.tsx         # Footer notes
│   │   └── PublishDialog.tsx     # Score upload dialog
│   │
│   ├── graf/                   # Graph components
│   │   ├── LookAtThisGraph.tsx   # Main chart component
│   │   └── MyToolTip.tsx         # Chart hover tooltip
│   │
│   ├── handlers/               # Main functionality handlers
│   │   ├── replayHandler.tsx     # Score replay logic
│   │   ├── scoringHandler.tsx    # Scoring logic
│   │   └── userInputHandler.tsx  # User input parsing logic
│   │
│   ├── assets/                 # Static assets
│   └── helpers/                # Utility functions
│   
├── main.tsx                    # App entry point
└── .env.local                  # Environment variables
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [InstantDB](https://instantdb.com/)

### Setup and Usage

```sh
# 1. Clone the repository
git clone https://github.com/penguinuwu/44clicker.git

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# 4. Build for production
pnpm build
```

### Environment Variables

Required in `.env.local`:

```sh
VITE_DB=<InstantDB App ID>
```

---

Code developed by **Evan Cui** with UI/UX designed by **Bourbon Xu**
