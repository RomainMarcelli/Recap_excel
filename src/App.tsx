import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recap from "./pages/Recap";
import Projet from "./pages/Projet"; // ✅ Import de la page Projet
import Collaborateurs from "./pages/Collaborateurs";
import TJM from "./pages/TJM";
import CollaborateurDetail from "./pages/CollaborateurDetail";
import AdminLogin from "./pages/AdminLogin";
import PrivateRoute from "./components/PrivateRoute"; // Import du PrivateRoute


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        {/* Route protégée pour la page d'accueil */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/recap"
          element={
            <PrivateRoute>
              <Recap />
            </PrivateRoute>
          }
        />
        <Route path="/projet" element={<PrivateRoute><Projet /></PrivateRoute>} /> {/* ✅ Route ajoutée */}
        <Route path="/collaborateurs" element={<PrivateRoute><Collaborateurs /></PrivateRoute>} /> {/* ✅ Route ajoutée */}
        <Route path="/tjm" element={<PrivateRoute><TJM /></PrivateRoute>} /> {/* ✅ Route ajoutée */}
        <Route path="/collaborateur/:id" element={<PrivateRoute><CollaborateurDetail /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
