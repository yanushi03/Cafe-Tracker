import NavBar from './components/NavBar';
import {Route, Routes} from 'react-router-dom';
import Home from './pages/home';
import Discover from './pages/discover';
import MustVisit from './pages/mustVisit';
import Visited from './pages/visited';
import Profile from './pages/profile';

function App() {
  return (
    <div><NavBar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/mustVisit" element={<MustVisit />} />
      <Route path="/visited" element={<Visited />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
    </div>
  );
}

export default App;
