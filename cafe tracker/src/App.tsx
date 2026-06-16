import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import NavBar from './components/NavBar';
import Home from './pages/home';
import Discover from './pages/discover';
import MustVisit from './pages/mustVisit';
import Visited from './pages/visited';
import CafeDetail from './pages/cafe-detail';

function App() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/cafe/');

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/cafe/:id" element={<CafeDetail />} />
        <Route path="/mustVisit" element={<MustVisit />} />
        <Route path="/visited" element={<Visited />} />
      </Routes>
      {!hideNav && <NavBar />}
    </>
  );
}

export default App;
