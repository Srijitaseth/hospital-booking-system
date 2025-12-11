import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SlotList from './pages/SlotList';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import { ORProvider } from './context/ORContext';

const App: React.FC = () => {
  return (
    <ORProvider>
      <Router>
        <nav className="navbar">
          <div className="nav-content">
            <Link to="/" className="brand">
              🏥 HealthFlow
            </Link>
            <div className="nav-links">
              <Link to="/">Patient Portal</Link>
              <Link to="/admin" className="nav-btn">Admin Login</Link>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<SlotList />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ORProvider>
  );
};

export default App;