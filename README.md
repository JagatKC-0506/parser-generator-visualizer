# SLR Parser Generator and Visualizer

A full-stack web application for generating and visualizing SLR parsers from context-free grammars. Built with React.js, Node.js, and Express.js.

## Features

- Grammar input with validation
- Augmented grammar with production numbering (R0, R1, ...)
- FIRST and FOLLOW set computation
- Canonical LR(0) item sets
- Interactive LR(0) DFA visualization (React Flow with zoom, pan, drag)
- SLR parsing table generation with conflict detection
- String parsing simulation with step-by-step animation
- Accept/Reject result display
- Dark mode UI with glassmorphism design
- Responsive layout

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 18 | Node.js |
| Vite | Express.js |
| Tailwind CSS | CORS |
| React Flow | |
| TanStack Table | |
| Framer Motion | |
| Axios | |

## Project Structure

```
slr-parser-generator/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GrammarInput.jsx
│   │   │   ├── AugmentedGrammar.jsx
│   │   │   ├── FirstFollowTable.jsx
│   │   │   ├── LR0States.jsx
│   │   │   ├── DFAGraph.jsx
│   │   │   ├── ParsingTable.jsx
│   │   │   ├── StringParser.jsx
│   │   │   └── ParsingSteps.jsx
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/
│   ├── routes/
│   │   └── parserRoutes.js
│   ├── controllers/
│   │   └── parserController.js
│   ├── services/
│   │   ├── grammarParser.js
│   │   ├── augmentGrammar.js
│   │   ├── firstFollow.js
│   │   ├── lr0Generator.js
│   │   ├── dfaGenerator.js
│   │   ├── slrTableGenerator.js
│   │   ├── parserSimulator.js
│   │   └── grammarValidator.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Algorithms Implemented (without external libraries)

- Grammar Parsing & Validation
- Grammar Augmentation
- FIRST Set Computation (iterative fixed-point)
- FOLLOW Set Computation (iterative fixed-point)
- LR(0) Closure function
- LR(0) GOTO function
- Canonical LR(0) item set construction
- DFA construction from LR(0) states
- SLR parsing table generation (ACTION/GOTO)
- Shift-Reduce parsing algorithm
- Conflict detection (shift-reduce, reduce-reduce)

## Installation

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd slr-parser-generator

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running

Start both servers in separate terminals:

```bash
# Terminal 1: Backend (port 5000)
cd server
npm run dev

# Terminal 2: Frontend (port 5173)
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

## API Endpoints

### POST /api/generate

Generate parser tables from grammar.

**Request:**
```json
{
  "grammar": [
    "E -> E + T | T",
    "T -> T * F | F",
    "F -> ( E ) | id"
  ]
}
```

**Response:** Augmented grammar, FIRST/FOLLOW sets, LR(0) states, DFA, SLR table, conflicts.

### POST /api/parse

Parse an input string using generated tables.

**Request:**
```json
{
  "input": "id * id + id",
  "actionTable": {},
  "gotoTable": {},
  "numberedProductions": [],
  "terminals": []
}
```

**Response:** Parse result with steps.

## Usage

1. Enter a context-free grammar in the textarea
2. Click "Generate Parser"
3. Expand each section to explore:
   - Augmented Grammar with production numbers
   - FIRST and FOLLOW sets
   - LR(0) item sets in collapsible cards
   - Interactive DFA (click nodes to see items)
   - SLR Parsing Table with conflict highlighting
4. Enter an input string and click "Parse String"
5. Watch the step-by-step parsing animation
