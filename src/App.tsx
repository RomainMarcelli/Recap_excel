import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recap from "./pages/Recap";
import Projet from "./pages/Projet"; // ✅ Import de la page Projet

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="/projet" element={<Projet />} /> {/* ✅ Route ajoutée */}
      </Routes>
    </Router>
  );
}

export default App;
