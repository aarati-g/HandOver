import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Activity } from 'lucide-react';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-md w-full p-8 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-teal-950 border border-teal-800 text-teal-400 mb-2">
          <Activity className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Handover</h1>
        <p className="text-sm text-neutral-400">
          AI Operational Memory for the Next Person.
        </p>
        <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-500">
          Initial setup ready &bull; React &bull; Vite &bull; TypeScript &bull; Tailwind CSS
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
