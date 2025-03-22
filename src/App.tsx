import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recap from "./pages/Recap";
import Projet from "./pages/Projet"; // ✅ Import de la page Projet
import Collaborateurs from "./pages/Collaborateurs";
import TJM from "./pages/TJM";
import CollaborateurDetail from "./pages/CollaborateurDetail";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="/projet" element={<Projet />} /> {/* ✅ Route ajoutée */}
        <Route path="/collaborateurs" element={<Collaborateurs />} /> {/* ✅ Route ajoutée */}
        <Route path="/tjm" element={<TJM />} /> {/* ✅ Route ajoutée */}
        <Route path="/collaborateur/:id" element={<CollaborateurDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
