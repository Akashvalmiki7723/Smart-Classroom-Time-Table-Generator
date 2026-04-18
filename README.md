# 🎓 Smart Classroom & Timetable Scheduler

**An AI-Powered Intelligent Timetable Management System**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)

---

## 📋 Overview

A comprehensive timetable management system for educational institutions featuring **4 AI models with automatic fallback** and an advanced **RAG (Retrieval-Augmented Generation) system** for intelligent assistance.

### ✨ Key Features

- 🤖 **4 AI Models** - DeepSeek, GPT-OSS, Qwen, StepFun with auto-fallback
- 🧠 **RAG System** - Context-aware responses using real database data
- 💬 **AI Chatbot** - Natural language queries on all dashboards
- 🔧 **Conflict Resolution** - AI analyzes and suggests solutions
- 📊 **Timetable Optimization** - AI-powered improvement suggestions
- 👥 **5 User Roles** - Admin, HOD, Coordinator, Faculty, Student
- 🎯 **CSP Algorithm** - Advanced constraint satisfaction scheduling
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Comfortable viewing in any lighting
- 💰 **100% Free** - All AI models and features at zero cost

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-classroom-timetable.git

# Navigate to project directory
cd smart-classroom-timetable

# Install dependencies
npm install

# Set up environment variables
# Create .env.local file with:
# MONGODB_URI=your_mongodb_connection_string
# NEXTAUTH_SECRET=your_secret_key
# NEXTAUTH_URL=http://localhost:3000

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React 19** - Latest React features

### Backend
- **Next.js API Routes** - Serverless backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **NextAuth.js** - Authentication

### AI Integration
- **OpenRouter API** - Multi-model gateway
- **4 Free LLM Models** - DeepSeek, GPT-OSS, Qwen, StepFun
- **Custom RAG System** - Context retrieval from database

---

## 👥 User Roles

### 1. 🔐 Administrator
- Complete system control
- User and department management
- System-wide configuration
- AI model testing and monitoring

### 2. 🏛️ HOD (Head of Department)
- Department-specific management
- Timetable approval workflow
- Faculty workload monitoring
- Department reports and analytics

### 3. 📋 Timetable Coordinator
- Create and manage timetables
- Configure subjects, rooms, and time slots
- Resolve scheduling conflicts with AI assistance
- Generate optimized schedules

### 4. 👨‍🏫 Faculty
- View personal teaching schedule
- Mark leave and availability
- Track teaching load
- Access subject information

### 5. 🎓 Student
- View class timetables
- Check room locations
- Receive schedule notifications
- Query AI about classes

---

## 🤖 AI Features

### 💬 AI Chatbot
Available on all dashboards - ask questions in natural language:
- "What's my schedule for Monday?"
- "Show available rooms at 2 PM"
- "When is Dr. Smith free?"
- "How many subjects are in CS department?"

### 🔍 RAG System
Retrieves real data from database for accurate responses:
- Subjects, Rooms, Faculty, Batches
- Timetables, Time Slots, Departments
- System statistics and analytics

### 🔧 Conflict Resolution
When timetable generation fails:
- AI analyzes the root cause
- Suggests 3-5 practical solutions
- Explains how to prevent future issues

### 📊 Timetable Analysis
AI evaluates generated timetables:
- Identifies inefficiencies
- Suggests optimizations
- Recommends improvements

### 🔄 Multi-Model Fallback
```
Query → DeepSeek → GPT-OSS → Qwen → StepFun → Response
```
If one model fails, automatically tries the next!

---

## 📁 Project Structure

```
smart-classroom-timetable/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin pages
│   ├── coordinator/         # Coordinator pages
│   ├── hod/                 # HOD pages
│   ├── faculty/             # Faculty pages
│   ├── student/             # Student pages
│   └── api/                 # API routes
│       └── ai/              # AI endpoints
├── components/              # React components
│   ├── ui/                  # UI components
│   ├── layout/              # Layout components
│   └── AIChatbot.tsx        # AI chatbot
├── lib/                     # Utilities
│   ├── ai/                  # AI integration
│   │   ├── openrouter.ts    # Multi-model AI
│   │   ├── rag-context.ts   # RAG system
│   │   └── ai-service.ts    # AI service layer
│   ├── auth.ts              # Authentication
│   ├── db.ts                # Database connection
│   └── timetable-generator.ts # Scheduling algorithm
├── models/                  # MongoDB schemas
├── Guide/                   # Documentation
│   ├── AI_INTEGRATION_GUIDE.md
│   ├── AI_QUICK_START.md
│   └── DEVELOPMENT_STEPS.md
└── public/                  # Static assets
```

---

## 🎯 Core Features

### Timetable Generation
- **CSP Algorithm** - Constraint Satisfaction Problem solver
- **Hard Constraints** - Faculty/room/batch clash prevention
- **Soft Constraints** - Gap minimization, faculty preferences
- **Backtracking** - Automatic conflict resolution
- **Optimization Score** - Quality metrics for schedules

### Data Management
- **Departments** - Create and manage academic departments
- **Subjects** - Theory, practical, lab subjects with credits
- **Rooms** - Lecture halls, labs, seminar rooms
- **Batches** - Student groups with semester information
- **Time Slots** - Configurable daily schedule
- **Faculty** - Teacher profiles with workload tracking

### Reports & Analytics
- System statistics and overviews
- Faculty workload reports
- Room utilization analysis
- Conflict detection and resolution
- Department-wise analytics

---

## 🔐 Security

- ✅ NextAuth.js authentication
- ✅ Role-based access control
- ✅ Secure session management
- ✅ Protected API routes
- ✅ MongoDB data encryption
- ✅ Input validation and sanitization

---

## 📚 Documentation

### For Users
- [AI Quick Start Guide](./Guide/AI_QUICK_START.md) - How to use AI features
- [User Manual](./Guide/CompleteArchitecture.txt) - Complete system guide

### For Developers
- [AI Integration Guide](./Guide/AI_INTEGRATION_GUIDE.md) - Technical AI docs
- [Development Steps](./Guide/DEVELOPMENT_STEPS.md) - Phase-by-phase development
- [Architecture Diagram](./Guide/AI_ARCHITECTURE_DIAGRAM.md) - Visual architecture
- [File Structure](./Guide/AI_FILE_STRUCTURE.md) - Complete file listing

### Setup Guides
- [MongoDB Setup](./Guide/MONGODB_SETUP_GUIDE.md) - Database configuration
- [Testing Guide](./Guide/TESTING_GUIDE.md) - How to test the system

---

## 🧪 Testing

### Manual Testing
```bash
# Run development server
npm run dev

# Test features:
# 1. Login as different roles
# 2. Create departments and subjects
# 3. Generate timetables
# 4. Use AI chatbot
# 5. Test conflict resolution
```

### AI Model Testing
1. Login as Admin
2. Navigate to Settings → AI
3. Click "Test All Models"
4. Verify model status

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Data Management
- `GET/POST /api/departments` - Departments
- `GET/POST /api/subjects` - Subjects
- `GET/POST /api/rooms` - Rooms
- `GET/POST /api/batches` - Batches
- `GET/POST /api/timetables` - Timetables

### AI Endpoints
- `POST /api/ai/chat` - Chatbot queries
- `POST /api/ai/resolve-conflict` - Conflict analysis
- `POST /api/ai/analyze-timetable` - Timetable optimization
- `GET /api/ai/test-models` - Model testing

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - MONGODB_URI
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

### Other Platforms
- AWS Amplify
- Netlify
- Railway
- Render

---

## 💡 Usage Examples

### Create a Timetable
1. Login as Coordinator
2. Add subjects, rooms, faculty, batches
3. Configure time slots
4. Go to Timetables → Create New
5. Fill in details and click "Generate"
6. AI resolves conflicts automatically

### Use AI Chatbot
1. Click blue floating button on any dashboard
2. Type your question
3. Get instant AI-powered answer
4. Ask follow-up questions

### Approve Timetable (HOD)
1. Login as HOD
2. Go to Approvals
3. Review generated timetables
4. Use AI analysis for insights
5. Approve or reject with comments

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **OpenRouter** - For providing free AI model access
- **DeepSeek, Qwen, StepFun** - For open-source AI models
- **Next.js Team** - For amazing framework
- **MongoDB** - For free database hosting
- **Vercel** - For free hosting platform

---

## 📞 Support

- 📧 Email: support@smartclassroom.com
- 📖 Documentation: [Guide folder](./Guide/)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/smart-classroom-timetable/issues)

---

## 🎯 Roadmap

### Completed ✅
- [x] 5 role-based user system
- [x] CSP-based timetable generation
- [x] AI chatbot with 4 models
- [x] RAG system integration
- [x] Conflict resolution AI
- [x] Complete documentation

### Coming Soon 🔜
- [ ] Voice input for AI queries
- [ ] Export to PDF/Excel
- [ ] Calendar integration (Google, Outlook)
- [ ] Mobile app (React Native)
- [ ] Notification system
- [ ] Multi-language support

---

## 📊 Stats

- **Lines of Code**: ~15,000+
- **AI Integration**: 1,784 lines
- **Documentation**: 1,200+ lines
- **Components**: 30+
- **API Endpoints**: 20+
- **Database Models**: 9
- **User Roles**: 5
- **AI Models**: 4
- **Cost**: $0.00 (100% Free)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ using Next.js, TypeScript, and AI**

*Last Updated: February 2026 | Version 1.0.0*


























