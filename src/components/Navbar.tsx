import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-500 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Gestion Budget</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-white hover:text-gray-300">Accueil</Link>
          </li>
          <li>
            <Link to="/recap" className="text-white hover:text-gray-300">Récapitulatif</Link>
          </li>
          <li>
            <Link to="/projet" className="text-white hover:text-gray-300">Créer un Projet</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
