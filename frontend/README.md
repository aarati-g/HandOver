# Handover Frontend

This directory contains the phone-first web application for the **Handover** project (AI Operational Memory for the Next Person).

### Scope & Features
- Mobile-first responsive layouts and design system (Tailwind CSS)
- Component library with semantic status and micro-interactions
- Client-side routing with React Router 7
- Multi-modal input capture (Audio voice note + Camera frame capture)
- API integration with FastAPI unified service layer

---

## Tech Stack
- **React 19**
- **Vite**
- **TypeScript**
- **Tailwind CSS**
- **React Router**
- **Lucide React**
- **Framer Motion**

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `frontend/` directory (or copy from root `.env.example`):
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be accessible at: [http://localhost:5173](http://localhost:5173)

### 4. Build for Production
```bash
npm run build
```

---

## Architecture & Directory Structure
```
frontend/
├── src/
│   ├── components/   # Reusable UI components (buttons, modals, cards)
│   ├── pages/        # Screen-level views
│   ├── layouts/      # App layouts (header, mobile navigation shell)
│   ├── services/     # API clients and external service calls
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript interfaces and type definitions
│   ├── data/         # Mock data for offline/demo development
│   ├── lib/          # Utilities (e.g. Tailwind `cn` helper)
│   ├── App.tsx       # Root routing & application entry component
│   ├── main.tsx      # React DOM bootstrap
│   └── index.css     # Global styles & Tailwind directives
├── public/           # Static public assets
├── package.json      # Dependencies and scripts
└── README.md         # Frontend documentation
```
