<div align="center">

# SLR Parser Generator and Visualizer

### 🚀 A full-stack web application for generating, visualizing, and simulating multiple types of parsers from context-free grammars.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel)](https://parser-generator-visualizer.vercel.app/)
[![GitHub](https://img.shields.io/github/license/JagatKC-0506/parser-generator-visualizer?style=for-the-badge)](https://github.com/JagatKC-0506/parser-generator-visualizer)
[![React](https://img.shields.io/badge/react-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D16-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/vite-5-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

</div>

---

## ✨ Live Demo

**Try it now:** [parser-generator-visualizer.vercel.app](https://parser-generator-visualizer.vercel.app/)

---

## 📋 Supported Parser Types

| Parser | Type | Description |
|--------|------|-------------|
| **LR(0)** | Bottom-up | LR parser with no lookahead — uses LR(0) items |
| **SLR(1)** | Bottom-up | Simple LR with FOLLOW-set lookahead for reduce decisions |
| **CLR(1)** | Bottom-up | Canonical LR with full LR(1) items (most powerful) |
| **LALR(1)** | Bottom-up | Look-Ahead LR — merges CLR(1) states for smaller tables |
| **LL(1)** | Top-down | Predictive recursive-descent parser with FIRST/FOLLOW |

---

## 🎯 Features

- **Grammar Input** — write any context-free grammar with validation
- **Grammar Augmentation** — automatic `S'` start symbol + production numbering (R0, R1, ...)
- **FIRST & FOLLOW Sets** — iterative fixed-point computation displayed in tables
- **LR(0) / LR(1) Canonical Item Sets** — closure & goto construction with expandable cards
- **Interactive DFA Visualization** — zoom, pan, and drag using React Flow; click nodes to inspect items
- **Parsing Tables** — ACTION/GOTO tables for SLR(1), CLR(1), LALR(1); predictive table for LL(1)
- **Conflict Detection** — shift-reduce and reduce-reduce conflicts highlighted in red
- **String Parsing Simulation** — step-by-step animated walkthrough of the parse stack
- **Dark Mode UI** — glassmorphism design, responsive layout

---

## 🛠️ Tech Stack

| Frontend | Backend | DevOps |
|----------|---------|--------|
| React 18 | Node.js | Vercel |
| Vite 5 | Express 4 | Git |
| Tailwind CSS 3 | CORS | npm |
| React Flow (xyflow) | — | — |
| TanStack Table | — | — |
| Framer Motion | — | — |
| Axios | — | — |

---

## 🗂️ Project Structure

```
parser-generator-visualizer/
├── client/                        # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GrammarInput.jsx        # Grammar text input + validation
│   │   │   ├── AugmentedGrammar.jsx    # Augmented productions display
│   │   │   ├── FirstFollowTable.jsx    # FIRST/FOLLOW set tables
│   │   │   ├── LR0States.jsx           # LR(0) / LR(1) item sets
│   │   │   ├── DFAGraph.jsx            # Interactive DFA (React Flow)
│   │   │   ├── ParsingTable.jsx        # SLR/CLR/LALR action/goto tables
│   │   │   ├── PredictiveTable.jsx     # LL(1) predictive table
│   │   │   ├── ParserCard.jsx          # Parser type selection cards
│   │   │   ├── StringParser.jsx        # Input string + parse button
│   │   │   └── ParsingSteps.jsx        # Step-by-step animation
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing page
│   │   │   └── ParserPage.jsx          # Main interactive page
│   │   ├── services/
│   │   │   └── api.js                  # Axios client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                        # Express backend
│   ├── routes/
│   │   └── parserRoutes.js            # /api/generate, /api/parse
│   ├── controllers/
│   │   └── parserController.js        # Request handlers
│   ├── services/
│   │   ├── grammarParser.js           # Tokenize grammar → productions
│   │   ├── grammarValidator.js        # Validate grammar well-formedness
│   │   ├── augmentGrammar.js          # Add S' + number productions
│   │   ├── firstFollow.js             # FIRST & FOLLOW (fixed-point)
│   │   ├── lr0Generator.js            # LR(0) closure & goto
│   │   ├── lr1Generator.js            # LR(1) item sets (CLR/LALR)
│   │   ├── dfaGenerator.js            # DFA graph from LR states
│   │   ├── lr0TableGenerator.js       # LR(0) parsing table
│   │   ├── slrTableGenerator.js       # SLR(1) table
│   │   ├── clr1TableGenerator.js      # CLR(1) table
│   │   ├── lalr1TableGenerator.js     # LALR(1) table (state merging)
│   │   ├── ll1TableGenerator.js       # LL(1) predictive table
│   │   └── parserSimulator.js         # Generic shift-reduce simulator
│   ├── server.js
│   └── package.json
│
├── vercel.json                     # Vercel deployment config
├── package.json                    # Root build scripts
└── README.md
```

---

## 🧠 Algorithms Implemented

All parser algorithms are implemented **from scratch** (no parser-generator libraries):

- Grammar parsing, validation, and augmentation
- FIRST set computation (iterative fixed-point)
- FOLLOW set computation (iterative fixed-point)
- LR(0) Closure & GOTO functions
- LR(1) Closure & GOTO functions (for CLR/LALR)
- Canonical LR(0) and LR(1) item set construction
- DFA construction from LR states
- SLR(1) parsing table generation (ACTION/GOTO)
- CLR(1) parsing table generation
- LALR(1) table generation (state merging)
- LL(1) predictive table generation
- Shift-reduce parsing simulation (step-by-step)
- Conflict detection (shift-reduce, reduce-reduce)

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm v8+

### Local Development

```bash
# Clone
git clone https://github.com/JagatKC-0506/parser-generator-visualizer.git
cd parser-generator-visualizer

# Install all dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Terminal 1: Start backend (port 5000)
cd server && npm run dev

# Terminal 2: Start frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deployment

This project is deployed on **Vercel** using a single monorepo configuration:

- Frontend (`client/`) is built by Vite into static files
- Backend (`server/`) runs as a Vercel serverless function
- API routes (`/api/*`) are rewritten to the Express server
- All other routes serve the React SPA

The `vercel.json` at the root handles the build and routing automatically.

---

## 📡 API Endpoints

### `POST /api/generate`

Generate parser tables from a grammar.

**Request:**
```json
{
  "grammar": ["E -> E + T | T", "T -> T * F | F", "F -> ( E ) | id"],
  "type": "slr1"
}
```

**Type options:** `lr0`, `slr1`, `clr1`, `lalr1`, `ll1`

**Response:** Augmented grammar, FIRST/FOLLOW sets, item sets, DFA, parsing table, conflicts.

### `POST /api/parse`

Parse an input string using generated tables.

**Request:**
```json
{
  "input": "id * id + id",
  "actionTable": {},
  "gotoTable": {},
  "numberedProductions": [],
  "terminals": [],
  "type": "slr1"
}
```

**Response:** Step-by-step parse result (accept/reject).

---

## 📸 Screenshots

*(Add screenshots here)*

| Home | Parser Page | DFA Graph |
|------|-------------|-----------|
| | | |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Made with ❤️ for Compiler Design
</div>
