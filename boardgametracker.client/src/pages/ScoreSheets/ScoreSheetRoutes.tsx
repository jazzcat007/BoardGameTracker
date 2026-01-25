import { Route, Routes } from 'react-router-dom';
import { CreateScoreSessionPage } from './CreateScoreSessionPage';
import { ScoreSessionPage } from './ScoreSessionPage';
import { ScoreSheetTemplatesPage } from './ScoreSheetTemplatesPage';
import { ScoreSheetBuilderPage } from './ScoreSheetBuilderPage';

export const ScoreSheetRoutes = () => {
  return (
    <Routes>
      <Route path="templates" element={<ScoreSheetTemplatesPage />} />
      <Route path="templates/builder" element={<ScoreSheetBuilderPage />} />
      <Route path="create" element={<CreateScoreSessionPage />} />
      <Route path=":sessionId" element={<ScoreSessionPage />} />
    </Routes>
  );
};