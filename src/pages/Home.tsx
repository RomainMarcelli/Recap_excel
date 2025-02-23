import { useState, useEffect } from "react";

interface Month {
  id: number;
  name: string;
}

function Home() {
  const [months, setMonths] = useState<Month[]>([]);

  // Charger les mois depuis l'API locale
  useEffect(() => {
    fetch("/months.json")
      .then((response) => response.json())
      .then((data) => setMonths(data.months))
      .catch((error) => console.error("Erreur lors du chargement des mois :", error));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">Bienvenue sur la Gestion des Dépenses</h1>
      <p className="text-gray-600 mt-2">Sélectionnez un mois pour voir les dépenses associées.</p>
      
      {/* Liste des mois */}
      <ul className="mt-6 grid grid-cols-3 gap-4">
        {months.map((month) => (
          <li key={month.id} className="p-4 bg-white shadow-md rounded-md text-center">
            {month.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
