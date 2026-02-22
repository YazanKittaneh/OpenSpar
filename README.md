<div align="center">

<!-- BANNER - Replace with your own banner image -->
<a href="https://openspar.vercel.app">
  <img src="public/banner.png" alt="OpenSpar - AI Model Analysis Platform" width="100%">
</a>

<h3>🔬 Compare, Analyze & Synthesize with Multiple AI Models</h3>

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

## 🔍 What is OpenSpar?

**OpenSpar** is an open-source platform for **comparative AI analysis**. Run structured dialogue sessions between multiple language models to explore reasoning patterns, compare approaches, and synthesize insights—all in real-time with a stunning analytical interface.

Built for **AI researchers**, **engineers**, and **curious minds** who want to:
- 🧪 **Benchmark reasoning** across different models on the same task
- 🔍 **Analyze thought patterns** and observe how models construct arguments
- 🤝 **Study collaborative dynamics** when AIs build on each other's ideas
- 📊 **Compare outputs side-by-side** for evaluation and testing

> *"Watching two models reason together reveals not just *what* they know, but *how* they think. It's like having a window into different cognitive architectures."*

## ✨ Features

### 🔬 **Multi-Model Analysis**
- **6+ Leading Models**: Claude 3.5 Sonnet, Claude 3 Opus, GPT-4, GPT-4 Turbo, Gemini Pro, Llama 3 70B
- **Custom Directives**: Give each model specific goals or constraints to test
- **Fair Comparison**: Each model gets equal turns, synchronized interaction

### ⚡ **Real-Time Streaming**
- **Live Reasoning**: Watch responses stream in real-time via Server-Sent Events
- **Processing Indicators**: See when models are formulating responses
- **Instant Updates**: No page refreshes—pure reactive observation

### 🎛️ **Session Controls**
| Control | Action |
|---------|--------|
| ⏸️ Pause/Resume | Pause the session to review at any moment |
| ⏭️ Skip Turn | Move to the next model's response |
| 💬 Add Context | Inject clarifying questions or new information |
| 🏁 Conclude | End session and view synthesis |

### 🧠 **Intelligent Synthesis**
- **Auto-Convergence**: Detects when models reach shared understanding
- **Circular Detection**: Identifies when the exchange becomes redundant
- **Session Limits**: Configurable interaction rounds (2-50)

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
git clone https://github.com/yourusername/openspar.git
cd openspar

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

# 7. Open http://localhost:3000 and start analyzing! 🎉
```

## 🎮 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   You       │────▶│   OpenSpar   │────▶│  Convex     │
│  (Setup)    │     │  Platform    │     │  Backend    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐      ┌──────────────┐
                    │  OpenRouter  │      │  Real-time   │
                    │  (AI Models) │      │  Streaming   │
                    └──────────────┘      └──────────────┘
```

### The Session Flow

1. **Setup**: Choose your topic/prompt, select two models, set session parameters
2. **Observe**: Watch reasoning flow in real-time as models respond to each other
3. **Guide**: Pause, redirect, or add context as needed
4. **Conclude**: Session ends based on your chosen criteria
5. **Review**: Analyze the complete reasoning exchange

### Data Architecture

| Entity | Description |
|--------|-------------|
| **Session** | Top-level container with topic, status, configuration |
| **Exchange** | Individual response with model, content, timestamp |
| **Events** | Real-time stream updates (processing, complete, error) |
| **Controls** | Researcher actions queued and processed |

## 🤖 Supported Models

All models powered by [OpenRouter](https://openrouter.ai)—bringing the best AI together.

| Model | Provider | Best For |
|-------|----------|----------|
| **Claude 3.5 Sonnet** | Anthropic | Balanced reasoning, nuanced analysis |
| **Claude 3 Opus** | Anthropic | Complex synthesis, deep exploration |
| **GPT-4** | OpenAI | Structured reasoning, consistency |
| **GPT-4 Turbo** | OpenAI | Speed + quality balance |
| **Gemini Pro** | Google | Multi-modal reasoning, creative analysis |
| **Llama 3 70B** | Meta | Open-source research, local testing |

> 💡 **Want more models?** OpenRouter supports 100+ models. Just add them to `lib/config.ts`!

## 📸 Screenshots

### 🎨 Banner Design

<div align="center">
  <!-- Replace with your actual banner.png after creating it -->
  <img src="docs/images/banner-preview.png" alt="OpenSpar Banner" width="800">
  <p><em>Clean Neo-Swiss aesthetic with Signal Orange accents</em></p>
</div>

---

### 🖥️ Application Interface

#### 1. Setup Interface
<div align="center">
  <img src="docs/images/setup-interface.png" alt="Setup Interface" width="800">
  <p><em>Configure your analysis: select models, define prompt, set session mode</em></p>
</div>

**Key Features:**
- 🎛️ **Model Selection**: Choose from 6+ leading LLMs
- ↔️ **Comparison View**: Side-by-side model configuration
- 🎯 **Session Modes**: Collaborative, Comparative, or Facilitated
- 🔐 **API Key Input**: Secure, server-memory-only handling

---

#### 2. Live Analysis Session
<div align="center">
  <img src="docs/images/analysis-session.png" alt="Live Analysis" width="800">
  <p><em>Real-time streaming with processing indicators and response history</em></p>
</div>

**Key Features:**
- 📡 **Real-time Streaming**: SSE-powered live updates
- 🎤 **Active Model**: Current responder highlighted in Signal Orange (#FF4500)
- ⏸️ **Session Controls**: Pause, redirect, add context
- 📜 **Scrollable History**: Complete reasoning exchange

---

#### 3. Session Conclusion
<div align="center">
  <img src="docs/images/session-conclusion.png" alt="Session Conclusion" width="800">
  <p><em>Synthesis view with key insights and next steps</em></p>
</div>

**Key Features:**
- 📊 **Convergence Analysis**: Where models agreed/diverged
- 📝 **Synthesis Summary**: Combined insights from the exchange
- 🔄 **New Session**: Quick link to start another analysis

---

### 🌓 Dark/Light Mode

<div align="center"
  <table>
    <tr>
      <td align="center">
        <img src="docs/images/dark-mode.png" alt="Dark Mode" width="400">
        <br>
        <sub>🌙 Dark Mode</sub>
      </td>
      <td align="center">
        <img src="docs/images/light-mode.png" alt="Light Mode" width="400">
        <br>
        <sub>☀️ Light Mode</sub>
      </td>
    </tr>
  </table>
</div>

---

### 📱 Mobile Responsive

<div align="center">
  <img src="docs/images/mobile-view.png" alt="Mobile Responsive" width="400">
  <p><em>Fully responsive design for analysis on the go</em></p>
</div>

---

### 🎥 Demo Video

<div align="center">
  
[![OpenSpar Demo](docs/images/video-thumbnail.png)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

*[▶️ Click to watch the demo video]*

</div>

---

> 📤 **Want to add your screenshots?** 
> 
> 1. Take screenshots of your sessions
> 2. Save them to `docs/images/` directory
> 3. Submit a PR with your images
> 4. We'll feature interesting model comparisons!

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
openspar/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Setup interface
│   └── session/[id]/   # Live analysis view
├── components/          # React components
│   ├── exchange-card.tsx     # Response display
│   ├── control-bar.tsx       # Session controls
│   └── synthesis-banner.tsx  # Conclusion view
├── convex/             # Backend (Convex)
│   ├── schema.ts       # Data models
│   ├── sessions.ts     # Queries & mutations
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

### Phase 1: Core Analysis ✅
- [x] Real-time session streaming
- [x] Multi-model support via OpenRouter
- [x] Session controls and moderation
- [x] Intelligent completion detection
- [x] Neo-Swiss design system

### Phase 2: Enhanced Analysis 🚧
- [ ] **Batch Mode**: Run multiple prompt variations
- [ ] **Analysis Templates**: Common research scenarios
- [ ] **Rich Responses**: Markdown, code, structured output
- [ ] **Multi-Modal**: Image and document analysis

### Phase 3: Research Tools 📊
- [ ] **Comparison Matrix**: Side-by-side feature analysis
- [ ] **Session Archive**: Searchable history
- [ ] **Analytics Dashboard**: Pattern detection, engagement metrics
- [ ] **Export Tools**: PDF reports, data extraction

### Phase 4: Advanced Features 🔮
- [ ] **Custom Endpoints**: Bring your own models
- [ ] **Multi-Model Sessions**: 3+ models simultaneously
- [ ] **Facilitated Synthesis**: AI-assisted convergence
- [ ] **Automated Testing**: Regression testing across models

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

- ✅ Session creation works
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
git clone https://github.com/YOUR_USERNAME/openspar.git

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

- 🔑 **API Keys**: Your OpenRouter key is **never stored**. It's kept in server memory only for the duration of the session.
- 🗑️ **Auto-Cleanup**: Sessions are automatically deleted after 24 hours via Convex cron jobs.
- 🏠 **Self-Hostable**: Run it entirely on your own infrastructure if preferred.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

Feel free to use OpenSpar for personal projects, research, or commercial applications. We'd love to hear what you build!

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
- 💻 **GitHub Discussions**: Share findings, request features, ask questions
- 🐛 **Issues**: Bug reports and feature requests

---

<div align="center">

### Ready to explore AI reasoning?

**[🚀 Launch OpenSpar](http://localhost:3000)**

Made with ❤️ by AI researchers, for AI researchers

⭐ Star this repo if you find it useful! ⭐

</div>

---

## 📝 Additional Notes

### Development Tips

- **Convex Codegen**: If Convex bindings change, run:
  ```bash
  npx convex codegen
  ```

- **Cleanup Cron**: Automatically removes old sessions (defined in `convex/cron.ts`)

- **API Key Handling**: Keys are stored in server memory only—never persisted to database
