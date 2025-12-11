# 🚀 ConJudge - Quick Start Guide

Welcome to **ConJudge**, the world's first AI-driven competitive programming esports platform!

## 📋 What You Have

Your ConJudge platform includes:

### ✅ Frontend (Next.js)
- **Multi-language support**: 7 languages (Azerbaijani, English, Turkish, Russian, German, French, Japanese)
- **Dark/Light themes**: Customizable black-white-red color scheme
- **Pages**:
  - Landing page with hero, features, mission sections
  - Login page
  - Signup page
- **Internationalization**: Automatic language detection and switching
- **Authentication**: JWT-based with secure token storage

### ✅ Backend (Express + PostgreSQL)
- **REST API**: Full CRUD operations
- **Database Models**:
  - Users (with rating and BrainType)
  - Problems (coding challenges)
  - Submissions (code solutions)
  - Battles (competitive matches)
  - Analysis (AI-powered insights)
- **Real-time**: Socket.IO for live battles
- **Authentication**: bcrypt password hashing + JWT

## 🎯 Getting Started (5 Minutes)

### Option 1: Auto Setup (Recommended)

```bash
cd conjudge-platform
./setup.sh
```

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your PostgreSQL connection:
# DATABASE_URL="postgresql://username:password@localhost:5432/conjudge"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start backend
npm run dev
```

Backend runs on `http://localhost:5000` ✅

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:3000` ✅

## 🌐 Accessing the Platform

### Available URLs:

1. **English**: http://localhost:3000/en
2. **Azerbaijani**: http://localhost:3000/az
3. **Turkish**: http://localhost:3000/tr
4. **Russian**: http://localhost:3000/ru
5. **German**: http://localhost:3000/de
6. **French**: http://localhost:3000/fr
7. **Japanese**: http://localhost:3000/ja

### Pages:

- **Landing**: `/{locale}/`
- **Login**: `/{locale}/login`
- **Signup**: `/{locale}/signup`

## 🎨 Theme Switching

Themes auto-apply but can be customized:
- **Dark Mode** (default): Black background, white text, red accents
- **Light Mode**: White background, black text, red accents

## 🔐 Testing Authentication

1. Go to `http://localhost:3000/en/signup`
2. Create an account:
   - Username: testuser
   - Email: test@example.com
   - Password: password123
3. Login at `/en/login`
4. You'll be redirected to dashboard (to be implemented in Phase 2)

## 🗄️ Database Schema

Your database has these tables:
- `users` - User accounts
- `problems` - Coding problems
- `submissions` - User's code submissions
- `submission_analyses` - AI analysis results
- `battles` - Competitive matches
- `battle_participants` - Battle players
- `battle_rounds` - Battle rounds

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
```

### Problems
```
GET /api/problems
GET /api/problems/:id
POST /api/problems
```

### Submissions
```
POST /api/submissions
GET /api/submissions/user/:userId
```

### Battles
```
POST /api/battles
GET /api/battles/:id
```

## 🛠️ Development Workflow

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
```

### Backend Development
```bash
cd backend
npm run dev        # Start with hot reload
npm run build      # Compile TypeScript
npm run start      # Start compiled version
```

### Database Management
```bash
cd backend
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma generate        # Regenerate client
```

## 📦 Project Structure

```
conjudge-platform/
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/  # Multi-language pages
│   │   │   └── globals.css
│   │   ├── context/       # React contexts
│   │   ├── i18n/          # i18n config
│   │   └── messages/      # Translations
│   └── package.json
│
├── backend/               # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Server entry
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── README.md              # Full documentation
├── QUICKSTART.md          # This file
└── setup.sh               # Auto setup script
```

## 🎯 Next Steps

### Phase 2 Features to Implement:
1. **Dashboard**: User profile and stats
2. **Problem List**: Browse coding problems
3. **Code Editor**: Submit and test solutions
4. **Leaderboard**: User rankings
5. **Battle System**: Real-time 1v1 matches

### Phase 3 Features:
1. **AI Analysis**: BrainType engine
2. **Problem Generator**: Auto-create problems
3. **Difficulty Engine**: Dynamic rating

### Phase 4 Features:
1. **Esports Arena**: Tournaments
2. **Team Battles**: 5v5 matches
3. **School System**: Educational tools

## 🐛 Troubleshooting

### Frontend won't start
- Check Node.js version: `node --version` (needs 18+)
- Delete `node_modules` and `package-lock.json`, then `npm install`

### Backend database errors
- Make sure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run `npx prisma migrate reset` to reset database

### Build fails
- Run `npm run build` to see detailed errors
- Check all imports are correct
- Make sure Prisma client is generated

## 💡 Tips

1. **Use the right ports**: Frontend:3000, Backend:5000
2. **Check both terminals**: Keep an eye on both dev servers
3. **Database GUI**: Use `npx prisma studio` to view/edit data
4. **Hot reload**: Both servers auto-reload on code changes
5. **Translations**: Edit `src/messages/{locale}.json` to change text

## 📞 Support

If you encounter issues:
1. Check the main README.md
2. Look at error messages in terminal
3. Verify all dependencies are installed
4. Make sure database is accessible

## 🎉 Success!

You now have a fully functional:
- ✅ Multi-language competitive programming platform
- ✅ User authentication system
- ✅ Beautiful dark/light themed UI
- ✅ REST API backend
- ✅ PostgreSQL database
- ✅ Real-time capabilities (Socket.IO)

**Ready to code? Start building features!** 🚀
