import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Invoices from './pages/Invoices';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/invoices" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/invoices" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/invoices" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/invoices" element={user ? <Invoices /> : <Navigate to="/login" />} />
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
