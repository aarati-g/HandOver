import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts';
import {
  HomePage,
  AssetsPage,
  AssetDetailPage,
  NewHandoverPage,
  HandoverDetailPage,
  NextWorkerPage,
  HistoryPage,
} from '@/pages';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/:assetId" element={<AssetDetailPage />} />
          <Route path="/handover/new" element={<NewHandoverPage />} />
          <Route path="/handover/:handoverId" element={<HandoverDetailPage />} />
          <Route path="/handover/:handoverId/next-worker" element={<NextWorkerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
