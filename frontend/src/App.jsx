import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerPortal from './pages/WorkerPortal';
import Simulator from './pages/Simulator';
import AdminDashboard from './pages/AdminDashboard';
import CivilianPortal from './pages/CivilianPortal';
import RegisterCivilian from './pages/RegisterCivilian';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/civilian" element={<RegisterCivilian />} />
          <Route path="/civilian" element={<CivilianPortal />} />
          <Route path="/worker" element={<WorkerPortal />} />
          <Route path="/worker/simulator" element={<Simulator />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Zonal Coordinators share the Admin interface but data is filtered by backend */}
        </Routes>
      </main>
    </Router>
  );
}

export default App;
