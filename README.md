# 🚀 ConJudge - AI-Driven Coding Esports Platform

ConJudge is the world's first AI-driven competitive programming platform that combines the intellect of Codeforces, the training system of LeetCode, and the esports dynamism of Chess.com/Fortnite.

## 🌟 Features

### Core Pillars

1. **🧠 BrainType Engine** - AI-powered coding brain analysis that creates a profile of your problem-solving patterns
2. **⚔️ Coding Esports Arena** - Live battles (1v1, 5v5, blitz, mirror) with real-time competition
3. **📊 AI Difficulty Engine** - Dynamic problem rating system that adapts to your skill level
4. **🤖 AI Problem Generator** - Unlimited, automatically generated high-quality problems
5. **🏫 SaaS School/Village OJ System** - Custom online judge for schools and communities

### Key Features

- ✅ **Multi-language Support** - 7 languages: Azerbaijani, Japanese, Turkish, Russian, English, German, French
- 🎨 **Dual Theme** - Dark mode (Black/White/Red) and Light mode (White/Black/Red)
- 🔐 **Authentication System** - Secure JWT-based authentication
- 📈 **Rating System** - Dynamic ELO-based rating for competitive play
- 🎯 **Real-time Battles** - Socket.IO powered live coding competitions
- 📊 **AI Analysis** - Deep code analysis with personalized feedback
- 💡 **BrainType Profiling** - Cognitive strengths and weaknesses identification

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Internationalization**: next-intl
- **Real-time**: Socket.IO Client
- **State Management**: React Context (Theme, Auth)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd conjudge-platform
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your PostgreSQL connection string

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
\`\`\`

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Create .env.local file with:
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_WS_URL=http://localhost:5000

# Start development server
npm run dev
\`\`\`

Frontend will run on `http://localhost:3000`

## 🗂️ Project Structure

\`\`\`
conjudge-platform/
├── frontend/
│   ├── messages/              # i18n translation files
│   │   ├── az.json           # Azerbaijani
│   │   ├── en.json           # English
│   │   ├── tr.json           # Turkish
│   │   ├── ru.json           # Russian
│   │   ├── de.json           # German
│   │   ├── fr.json           # French
│   │   └── ja.json           # Japanese
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/    # Locale-based routing
│   │   │   │   ├── page.tsx # Landing page
│   │   │   │   ├── login/   # Login page
│   │   │   │   ├── signup/  # Signup page
│   │   │   │   └── layout.tsx
│   │   │   └── globals.css
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # Authentication context
│   │   │   └── ThemeContext.tsx  # Theme switching
│   │   ├── i18n/
│   │   │   └── request.ts   # i18n configuration
│   │   └── middleware.ts    # Locale detection
│   ├── next.config.ts
│   └── package.json
│
└── backend/
    ├── prisma/
    │   └── schema.prisma    # Database schema
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts      # Authentication routes
    │   │   ├── problems.ts  # Problem routes
    │   │   ├── submissions.ts # Submission routes
    │   │   └── battles.ts   # Battle routes
    │   └── index.ts         # Main server file
    ├── tsconfig.json
    └── package.json
\`\`\`

## 🎨 Design System

### Colors
- **Primary**: #E80000 (Red)
- **Background Dark**: #000000 (Black)
- **Background Light**: #FFFFFF (White)
- **Surface Dark**: #0D0D0D
- **Text Dark**: #E6E6E6
- **Text Light**: #000000

### Typography
- **Font Family**: Space Grotesk
- **Icons**: Material Symbols Outlined

### Components
- Gradient buttons with hover effects
- Glass-morphism cards
- Smooth transitions and animations
- Responsive grid layouts

## 🌍 Multi-language Support

ConJudge supports 7 languages out of the box:

1. 🇦🇿 Azerbaijani (`/az`)
2. 🇬🇧 English (`/en`) - Default
3. 🇹🇷 Turkish (`/tr`)
4. 🇷🇺 Russian (`/ru`)
5. 🇩🇪 German (`/de`)
6. 🇫🇷 French (`/fr`)
7. 🇯🇵 Japanese (`/ja`)

The language is automatically detected from the URL path.

## 🔐 Authentication Flow

1. User signs up with username, email, and password
2. Password is hashed using bcrypt (10 rounds)
3. JWT token is generated (7-day expiration)
4. Token is stored in localStorage
5. Protected routes check for valid token
6. Token includes user ID and email in payload

## 📊 Database Schema

### Models

- **User** - User accounts with rating and BrainType
- **Problem** - Coding problems with test cases
- **Submission** - Code submissions with results
- **SubmissionAnalysis** - AI analysis of submissions
- **Battle** - Competitive battle sessions
- **BattleParticipant** - Players in battles
- **BattleRound** - Individual rounds within battles

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `POST /api/problems` - Create new problem

### Submissions
- `POST /api/submissions` - Submit solution
- `GET /api/submissions/user/:userId` - Get user submissions

### Battles
- `POST /api/battles` - Create battle
- `GET /api/battles/:id` - Get battle details

## 🎮 Real-time Features

ConJudge uses Socket.IO for real-time features:

### Events
- `join-battle` - Join a battle room
- `submit-solution` - Submit solution in real-time
- `solution-submitted` - Broadcast submission to all participants

## 🛣️ Roadmap

### Phase 1 - MVP (Current)
- ✅ User authentication system
- ✅ Multi-language support
- ✅ Theme switching
- ✅ Landing page
- ✅ Basic database schema
- ✅ REST API endpoints

### Phase 2 - Core Features
- ⏳ Problem submission engine
- ⏳ Code execution sandbox
- ⏳ Real-time battle implementation
- ⏳ Rating system (ELO)
- ⏳ User dashboard

### Phase 3 - AI Features
- ⏳ BrainType analysis v1
- ⏳ AI difficulty adjustment
- ⏳ Code style analysis
- ⏳ AI problem generator

### Phase 4 - Esports
- ⏳ 1v1 Ranked battles
- ⏳ 5v5 Team leagues
- ⏳ Global tournaments
- ⏳ Leaderboards
- ⏳ Replay system

### Phase 5 - SaaS
- ⏳ School OJ system
- ⏳ Admin dashboard
- ⏳ Analytics for teachers
- ⏳ Multi-tenant support

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

ConJudge - The Evolution of Competitive Programming

---

**Made with ❤️ using Next.js, Express, and PostgreSQL**
