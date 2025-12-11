#!/bin/bash

# ConJudge Platform Setup Script
echo "🚀 Setting up ConJudge Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed: $(node --version)${NC}"

# Check if PostgreSQL is running (optional for initial setup)
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found. You'll need it for the backend.${NC}"
fi

# Setup Backend
echo -e "\n${YELLOW}📦 Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file. Please configure your database connection.${NC}"
fi

echo "Installing backend dependencies..."
npm install

echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Setup Frontend
echo -e "\n${YELLOW}📦 Setting up Frontend...${NC}"
cd ../frontend

echo "Installing frontend dependencies..."
npm install

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Summary
echo -e "\n${GREEN}✨ Setup Complete!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Configure backend/.env with your PostgreSQL connection"
echo "2. Run database migrations:"
echo "   cd backend && npx prisma generate && npx prisma migrate dev"
echo ""
echo "3. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "4. Start the frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo -e "${GREEN}🌐 Frontend will be available at: http://localhost:3000${NC}"
echo -e "${GREEN}🔌 Backend API will be available at: http://localhost:5000${NC}"
