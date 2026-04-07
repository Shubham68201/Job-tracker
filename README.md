# JobTrackr 🎯

An AI-powered job application tracker with a Kanban board interface. Paste any job description and let AI auto-fill fields, extract required skills, and generate tailored resume bullet points — all powered by Groq's LLaMA 3.3 70B.

---

## Tech Stack

| Layer       | Tech                         |
| ----------- | ---------------------------- |
| Frontend    | React 18, TypeScript, Vite   |
| Styling     | Tailwind CSS, DaisyUI        |
| State       | Redux Toolkit                |
| Drag & Drop | @dnd-kit                     |
| Backend     | Node.js, Express, TypeScript |
| Database    | MongoDB + Mongoose           |
| Auth        | JWT + bcrypt                 |
| AI          | Groq SDK (LLaMA 3.3 70B)     |
| Validation  | Zod                          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone & Install

```bash
git clone https://github.com/Shubham68201/Job-tracker.git
cd job-tracker

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — copy and fill in:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client** — copy and fill in (optional, uses Vite proxy by default):

```bash
cd client
cp .env.example .env
```

### 3. Run in Development

Open two terminals:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### 4. Build for Production

```bash
# Build backend
cd server && npm run build

# Build frontend
cd client && npm run build
```

---

## Environment Variables

### Server (`server/.env`)

| Variable         | Required | Description                                            |
| ---------------- | -------- | ------------------------------------------------------ |
| `PORT`           | No       | Server port (default: 5000)                            |
| `MONGO_URI`      | Yes      | MongoDB connection string                              |
| `JWT_SECRET`     | Yes      | Secret for signing JWTs (use a long random string)     |
| `JWT_EXPIRES_IN` | No       | Token expiry (default: 7d)                             |
| `GROQ_API_KEY`   | Yes      | Your Groq API key from console.groq.com                |
| `CLIENT_URL`     | No       | Frontend URL for CORS (default: http://localhost:5173) |
| `NODE_ENV`       | No       | development or production                              |

### Client (`client/.env`)

| Variable       | Required | Description                                  |
| -------------- | -------- | -------------------------------------------- |
| `VITE_API_URL` | No       | Backend URL (Vite proxy handles this in dev) |

---

## Project Structure

```
job-tracker/
├── server/
│   └── src/
│       ├── models/          # Mongoose schemas (User, Application)
│       ├── routes/          # Express route definitions
│       ├── controllers/     # Route handler logic
│       ├── middleware/      # Auth JWT, error handler
│       ├── services/        # groqService.ts — all AI logic isolated here
│       ├── types/           # Shared TypeScript types
│       └── index.ts         # Express app entry point
└── client/
    └── src/
        ├── components/
        │   ├── ai/          # AIParser component
        │   ├── kanban/      # Board, Column, Card, Form, Detail
        │   └── ui/          # Navbar, StatsBar, LoadingScreen
        ├── pages/           # LoginPage, RegisterPage, BoardPage
        ├── store/
        │   └── slices/      # authSlice, applicationsSlice (Redux Toolkit)
        ├── services/        # api.ts — axios instance + all API calls
        ├── hooks/           # Typed useAppDispatch / useAppSelector
        └── types/           # Shared frontend types + constants
```

---

## Key Design Decisions

### Why Groq instead of OpenAI?

Groq provides dramatically faster inference (tokens/sec) via their custom hardware, making the AI parsing feel near-instant instead of waiting several seconds. LLaMA 3.3 70B gives excellent structured extraction quality comparable to GPT-4o for this use case, and the free tier is generous for development.

### AI Logic in a Service Layer

All Groq API calls live in `server/src/services/groqService.ts`. Controllers call the service functions — this keeps routes thin, makes the AI layer easily testable and swappable, and means a future model switch only touches one file.

### Redux Toolkit for State

RTK's `createAsyncThunk` handles loading/error states cleanly per-action without boilerplate. The kanban board needs optimistic drag-and-drop updates (via `moveApplication` action) before the API call completes, which Redux handles naturally.

### Optimistic Drag & Drop

Card moves are applied to local Redux state immediately on drag, giving instant visual feedback. The `updateOrder` API call happens async after the drop, so the UI never feels sluggish. If the API call fails, a toast notifies the user.

### Zod Validation

Both server-side (request bodies) and the auth flow use Zod schemas. This gives runtime type safety in addition to TypeScript's compile-time checks, and produces clear, user-friendly error messages.

### JWT Auth Persistence

The token is stored in `localStorage` and attached to every request via an Axios interceptor. On app load, `fetchCurrentUser` validates the token server-side — if expired, the interceptor clears storage and redirects to login.

---

## API Endpoints

### Auth

| Method | Endpoint             | Auth | Description       |
| ------ | -------------------- | ---- | ----------------- |
| POST   | `/api/auth/register` | No   | Register new user |
| POST   | `/api/auth/login`    | No   | Login             |
| GET    | `/api/auth/me`       | Yes  | Get current user  |

### Applications

| Method | Endpoint                  | Auth | Description              |
| ------ | ------------------------- | ---- | ------------------------ |
| GET    | `/api/applications`       | Yes  | Get all applications     |
| POST   | `/api/applications`       | Yes  | Create application       |
| PUT    | `/api/applications/order` | Yes  | Bulk update order/status |
| PUT    | `/api/applications/:id`   | Yes  | Update application       |
| DELETE | `/api/applications/:id`   | Yes  | Delete application       |

### AI

| Method | Endpoint              | Auth | Description             |
| ------ | --------------------- | ---- | ----------------------- |
| POST   | `/api/ai/parse`       | Yes  | Parse job description   |
| POST   | `/api/ai/suggestions` | Yes  | Generate resume bullets |

---

## Features

- ✅ JWT auth with persistent login
- ✅ Kanban board with 5 columns
- ✅ Drag-and-drop cards between columns
- ✅ AI job description parser (company, role, skills, seniority, location)
- ✅ AI resume bullet generator (3–5 tailored suggestions with copy button)
- ✅ Full CRUD for applications
- ✅ Skill tags (required + nice-to-have)
- ✅ Loading, error, and empty states
- ✅ Offer rate stats bar
- ✅ Responsive design

---

## Submission Notes

- All API keys are loaded from `.env` — never hardcoded
- `.env` files are in `.gitignore` — only `.env.example` is committed
- TypeScript strict mode enabled on both client and server
- `any` type not used — all data shapes are explicitly typed
