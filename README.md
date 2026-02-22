<div align="center">

<pre>
███╗   ███╗ ██████╗ ██████╗ ███████╗██╗         █████╗ ██████╗ ███████╗███╗   ██╗ █████╗ 
████╗ ████║██╔═══██╗██╔══██╗██╔════╝██║        ██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗
██╔████╔██║██║   ██║██║  ██║█████╗  ██║        ███████║██████╔╝█████╗  ██╔██╗ ██║███████║
██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██║        ██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║
██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗███████╗██╗██║  ██║██║  ██║███████╗██║ ╚████║██║  ██║
╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝
</pre>

<h3>🥊 Watch AI Models Battle It Out in Real-Time 🥊</h3>

<p>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://convex.dev"><img src="https://img.shields.io/badge/Convex-Real--time-orange?style=for-the-badge" alt="Convex"></a>
  <a href="https://openrouter.ai"><img src="https://img.shields.io/badge/OpenRouter-AI_Models-10b981?style=for-the-badge" alt="OpenRouter"></a>
</p>

<p>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Get_Started-→-FF4500?style=for-the-badge" alt="Get Started"></a>
  <a href="#-contribute"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome"></a>
</p>

</div>

---

## 🎭 What is Debate Arena?

**Debate Arena** is an open-source platform where AI models engage in structured debates on any topic you choose. Watch Claude face off against GPT-4, or pit Gemini against Llama in a battle of wits—all in real-time with a stunning industrial interface.

Built for **AI enthusiasts**, **researchers**, and **curious minds** who want to:
- 🧪 **Benchmark models** against each other on specific reasoning tasks
- 🎓 **Study debate dynamics** and argumentation patterns
- 🎪 **Entertain and educate** with AI-vs-AI showdowns
- 🔬 **Explore emergent behaviors** when LLMs interact

> *"Watching two AIs debate is like peeking into the collective unconscious of machine learning—fascinating, unpredictable, and surprisingly insightful."*

## ✨ Features

### 🥊 **Model Combat System**
- **6+ Leading Models**: Claude 3.5 Sonnet, Claude 3 Opus, GPT-4, GPT-4 Turbo, Gemini Pro, Llama 3 70B
- **Custom Objectives**: Give each debater secret goals and strategies
- **Fair Matchmaking**: Each model gets equal turns, no interruptions

### ⚡ **Real-Time Streaming**
- **Live Arguments**: Watch responses stream in real-time via Server-Sent Events
- **Typing Indicators**: See when models are "thinking"
- **Instant Updates**: No page refreshes—pure reactive magic

### 🎮 **Moderator Controls**
| Control | Action |
|---------|--------|
| ⏸️ Pause/Resume | Freeze the debate at any moment |
| ⏭️ Skip Turn | Jump to the next debater |
| 💬 Inject Comment | Add moderator commentary mid-debate |
| 🏁 Force End | Declare a winner manually |

### 🏆 **Intelligent Resolution**
- **Self-Terminate**: Models decide when consensus is reached
- **User Decides**: You vote on the winner
- **AI Judge**: A third model evaluates and picks the victor

### 🧠 **Smart Detection**
- ✅ **Agreement Detection**: Automatically ends when models converge
- 🔄 **Circular Argument Detection**: Stops redundant back-and-forth
- ⏰ **Turn Limits**: Configurable max rounds (2-50)

### 🎨 **Neo-Swiss Design**
An industrial, architectural UI aesthetic inspired by Swiss design principles:
- **High Contrast**: Black, white, and Signal Orange (#FF4500)
- **Geometric Precision**: 8px baseline grid, intentional asymmetry
- **ADHD-Optimized**: Clear hierarchy, generous whitespace
- **Zero Distraction**: No gradients, no shadows, pure content

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **npm** or **pnpm**
- **Convex** account (free tier works!)
- **OpenRouter** API key ([get one free](https://openrouter.ai))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/debate-arena.git
cd debate-arena

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.local.example .env.local

# 4. Configure your environment variables
```

Edit `.env.local`:

```env
# Convex (get these from your Convex dashboard)
CONVEX_DEPLOYMENT_URL=https://your-team-your-project.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-team-your-project.convex.cloud

# Your local dev URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# 5. Initialize Convex (one-time setup)
npx convex dev

# 6. Start the development server
npm run dev

# 7. Open http://localhost:3000 and start debating! 🎉
```

## 🎮 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   You       │────▶│  Debate      │────▶│  Convex     │
│  (Setup)    │     │   Arena      │     │  Backend    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐      ┌──────────────┐
                    │  OpenRouter  │      │  Real-time   │
                    │  (AI Models) │      │  Streaming   │
                    └──────────────┘      └──────────────┘
```

### The Debate Flow

1. **Setup**: Choose your topic, pick two models, set winning conditions
2. **Stream**: Watch arguments flow in real-time as models respond to each other
3. **Moderate**: Pause, skip, or inject comments as needed
4. **Resolve**: Debate ends based on your chosen condition
5. **Review**: Analyze the complete argument history

### Data Architecture

| Entity | Description |
|--------|-------------|
| **Debate** | Top-level container with topic, status, config |
| **Turn** | Individual argument with model, content, timestamp |
| **Events** | Real-time stream updates (typing, complete, error) |
| **Controls** | Moderator actions queued and processed |

## 🤖 Supported Models

All models powered by [OpenRouter](https://openrouter.ai)—bringing the best AI together.

| Model | Provider | Best For |
|-------|----------|----------|
| **Claude 3.5 Sonnet** | Anthropic | Balanced reasoning, nuanced arguments |
| **Claude 3 Opus** | Anthropic | Complex debates, deep analysis |
| **GPT-4** | OpenAI | Structured arguments, consistency |
| **GPT-4 Turbo** | OpenAI | Speed + quality balance |
| **Gemini Pro** | Google | Multi-modal reasoning, creativity |
| **Llama 3 70B** | Meta | Open-source powerhouse |

> 💡 **Want more models?** OpenRouter supports 100+ models. Just add them to `lib/config.ts`!

## 📸 Screenshots

*Coming soon! We'd love community screenshots.*

### The Setup Interface
A brutalist, architectural form with clear hierarchy:
- Left-aligned headers with Signal Orange accents
- Model selection with VS dividers
- Clean parameter controls

### The Debate Arena
Real-time streaming with:
- Current speaker highlighted in Signal Orange
- Typing indicators and live updates
- Scrollable debate history

### The Winner Banner
Victory announcement with:
- Bold typography
- Clean result presentation
- Option to start a new debate

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Serve production build
npm run lint     # ESLint check
npm test         # Run Vitest tests
```

### Project Structure

```
debate-arena/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Setup interface
│   └── debate/[id]/    # Live debate view
├── components/          # React components
│   ├── debate-card.tsx # Argument display
│   ├── control-bar.tsx # Moderator controls
│   └── winner-banner.tsx
├── convex/             # Backend (Convex)
│   ├── schema.ts       # Data models
│   ├── debates.ts      # Queries & mutations
│   └── cron.ts         # Cleanup jobs
├── lib/                # Utilities
│   ├── config.ts       # Models & constants
│   └── types.ts        # TypeScript types
└── public/             # Static assets
```

### The Neo-Swiss Design System

Our unique aesthetic is defined in `DESIGN.md` and implemented via:

- **Tailwind Config**: `tailwind.neo-swiss.config.js`
- **CSS Variables**: High contrast, industrial palette
- **Component Primitives**: From shadcn/ui, customized

Key principles:
- No gradients, no shadows, flat hierarchy
- 8px baseline grid
- Signal Orange (#FF4500) for CTAs and active states
- Monospace labels for technical elements

## 🗺️ Roadmap

### Phase 1: Core Experience ✅
- [x] Real-time debate streaming
- [x] Multi-model support via OpenRouter
- [x] Moderator controls
- [x] Intelligent completion detection
- [x] Neo-Swiss design system

### Phase 2: Enhanced Debating 🚧
- [ ] **Tournament Mode**: Multi-round elimination brackets
- [ ] **Debate Templates**: Common topics and formats
- [ ] **Rich Text**: Markdown support in arguments
- [ ] **Image Arguments**: Multi-modal debates

### Phase 3: Community & Analytics 📊
- [ ] **Leaderboards**: Model win rates, ELO rankings
- [ ] **Debate History**: Searchable archive
- [ ] **Analytics Dashboard**: Argument patterns, engagement
- [ ] **Sharing**: Export debates, social media cards

### Phase 4: Advanced Features 🔮
- [ ] **Custom Endpoints**: Bring your own API keys/models
- [ ] **Team Debates**: 2v2, 3v3 formats
- [ ] **AI Judging**: More sophisticated evaluation
- [ ] **Debate Bots**: Automated tournament runners

## ☁️ Deployment (Vercel)

Deploy your own instance in minutes:

### 1. Connect to Vercel

```bash
# Using Vercel CLI
npx vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com).

### 2. Configure Environment Variables

In your Vercel project settings, add:

| Variable | Value |
|----------|-------|
| `CONVEX_DEPLOYMENT_URL` | Your Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_URL` | Same as above |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

### 3. Deploy to Production

```bash
npx vercel --prod
```

### 4. Validate

- ✅ Debate creation works
- ✅ Live stream updates appear
- ✅ User controls work
- ✅ Convex functions run without errors

---

## 🤝 Contributing

We love contributions from the AI community! Whether you're fixing bugs, adding features, or improving documentation, your help is welcome.

### Quick Start for Contributors

```bash
# 1. Fork the repo
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/debate-arena.git

# 3. Create a feature branch
git checkout -b feature/amazing-feature

# 4. Make your changes
# 5. Run tests
npm test

# 6. Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# 7. Open a Pull Request 🎉
```

### Areas We Need Help

- 🎨 **UI/UX**: More Neo-Swiss components, animations
- 🧪 **Testing**: Expand test coverage
- 📝 **Documentation**: Tutorials, examples, API docs
- 🌍 **i18n**: Internationalization support
- 🔧 **DevOps**: Docker, CI/CD improvements

### Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/). Be respectful, constructive, and inclusive.

---

## 🔒 Privacy & Security

- 🔑 **API Keys**: Your OpenRouter key is **never stored**. It's kept in server memory only for the duration of the debate.
- 🗑️ **Auto-Cleanup**: Debates are automatically deleted after 24 hours via Convex cron jobs.
- 🏠 **Self-Hostable**: Run it entirely on your own infrastructure if preferred.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

Feel free to use Debate Arena for personal projects, research, or commercial applications. We'd love to hear what you build!

---

## 🙏 Acknowledgments

Built with incredible open-source tools and services:

- **[Convex](https://convex.dev)** - The real-time backend that makes streaming magic possible
- **[OpenRouter](https://openrouter.ai)** - Unified API for 100+ AI models
- **[shadcn/ui](https://ui.shadcn.com)** - Beautiful component primitives
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first styling
- **[Next.js](https://nextjs.org)** - The React framework
- **Model Providers**: Anthropic, OpenAI, Google, Meta for their amazing LLMs

---

## 💬 Community

- 🐦 **Twitter/X**: [@yourhandle](https://twitter.com/yourhandle) - Updates and highlights
- 💻 **GitHub Discussions**: Share debates, request features, ask questions
- 🐛 **Issues**: Bug reports and feature requests

---

<div align="center">

### Ready to watch AIs debate?

**[🚀 Launch Debate Arena](http://localhost:3000)**

Made with ❤️ by AI enthusiasts, for AI enthusiasts

⭐ Star this repo if you find it useful! ⭐

</div>

---

## 📝 Additional Notes

### Development Tips

- **Convex Codegen**: If Convex bindings change, run:
  ```bash
  npx convex codegen
  ```

- **Cleanup Cron**: Automatically removes old debates (defined in `convex/cron.ts`)

- **API Key Handling**: Keys are stored in server memory only—never persisted to database
