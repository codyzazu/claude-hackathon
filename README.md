# Prompt Eval Studio

A web-based evaluation tool for testing and improving AI system prompts. Compare Claude models side-by-side, define custom evaluation criteria with weighted importance, and automatically generate improved prompts based on test results.

## Features

✨ **Test & Evaluate**
- Write system prompts and define test cases (realistic user messages)
- Run evaluations against multiple Claude models in parallel
- Get detailed pass/fail breakdowns for each evaluation criterion

⭐ **Weighted Criteria**
- Define evaluation criteria with star-based importance weights (1-5)
- Higher weights = higher priority in scoring
- Pre-built templates for common use cases (support bots, code review, tutoring, etc.)

🎯 **Multi-Model Comparison**
- Compare responses across Haiku, Sonnet, and Opus
- View aggregate scores and per-criterion performance
- Identify which models work best for your use case

🚀 **Auto-Improvement**
- Analyze failures and automatically rewrite prompts to fix them
- Save and compare multiple prompt versions
- Track score improvements over iterations

📊 **Results & Export**
- Per-criterion pass rate and average score tables
- Detailed breakdowns with reasoning for each pass/fail
- Export results as JSON or CSV for sharing/analysis

📁 **Reference Files**
- Attach PDF and Word documents for context (UI-ready)
- Support for additional reference materials during evaluation

💾 **Prompt History**
- Auto-save all prompts and scores
- Restore previous versions instantly
- Compare before/after improvements

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
npm install
```

### Setup Environment

Create a `.env.local` file in the project root:

```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build

```bash
npm run build
```

## How It Works

1. **Write a system prompt** — Define the AI assistant's behavior (top-left panel)
2. **Add test cases** — Provide realistic user inputs to test against
3. **Define criteria** — Set evaluation rules with star weights (importance)
4. **Choose models** — Select one or more Claude models to compare
5. **Run evaluation** — Let Claude score responses against your criteria
6. **Review results** — View overall scores, pass rates, and per-criterion breakdowns
7. **Export & share** — Download results as JSON or CSV
8. **Auto-improve** — Have Claude rewrite your prompt based on failures

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: cmdk (command palette)
- **API**: Anthropic Claude API
- **State Management**: React Hooks

## Project Structure

```
src/
├── components/
│   ├── App.tsx                 # Main app orchestration
│   ├── PromptSetup.tsx         # System prompt editor + file upload
│   ├── TestCaseList.tsx        # Test case manager
│   ├── CriteriaBuilder.tsx     # Criterion definition with star weights
│   ├── ModelSelector.tsx       # Model selection UI
│   ├── ResultsDashboard.tsx    # Results, export, breakdowns
│   ├── ScoreCard.tsx           # Per-test-case detail card
│   ├── ComparisonTable.tsx     # Multi-model score table
│   ├── CommandPalette.tsx      # Keyboard command palette
│   ├── PromptHistory.tsx       # Prompt version history
│   ├── CriteriaTemplates.tsx   # Pre-built template loader
│   └── HelpDialog.tsx          # Usage guide
├── services/
│   └── claude.ts              # Anthropic API integration
├── hooks/
│   └── usePromptHistory.ts    # Prompt versioning logic
└── types.ts                   # Shared TypeScript types
```

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build production bundle
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build

## Security Note

This app sends API requests directly from the browser. For production use, consider deploying a backend proxy to keep your API key secure.

## License

MIT
