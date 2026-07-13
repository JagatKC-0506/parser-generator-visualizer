import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ParserPage from './pages/ParserPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/parser/:type" element={<ParserPage />} />
      </Routes>
    </BrowserRouter>
  );
}
