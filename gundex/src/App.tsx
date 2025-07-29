import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Guns from './pages/Guns';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guns" element={<Guns />} />
      </Routes>
    </BrowserRouter>
  );
}
