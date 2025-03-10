import { useState, useEffect } from "react";

interface Project {
  _id: string;
  name: string;
  totalCost: number;
}

interface RecapData {
  month: string;
  projects: Project[];
  totalMonthCost: number;
}

// Liste des mois pour affichage
const months = [
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

function Recap() {
  const [recapData, setRecapData] = useState<RecapData[]>([]);
  const [totalOverallCost, setTotalOverallCost] = useState<number>(0);

  useEffect(() => {
    fetch("http://localhost:5000/recap")
      .then((response) => response.json())
      .then((data) => {
        setRecapData(data);
        // Calcul du coût total global
        const totalCost = data.reduce((acc: number, monthData: RecapData) => acc + monthData.totalMonthCost, 0);
        setTotalOverallCost(totalCost);
      })
      .catch((error) => console.error("Erreur lors du chargement des données :", error));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">📊 Récapitulatif des Dépenses</h1>
      <p className="text-gray-600 mb-6">Visualisez toutes vos dépenses ici.</p>

      {/* Tableau */}
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-4 border">📅 Mois</th>
              <th className="p-4 border">📂 Projets</th>
              <th className="p-4 border text-center">💰 Coût Total par Projet (€)</th>
              <th className="p-4 border text-center">📊 Coût Total du Mois (€)</th>
            </tr>
          </thead>
          <tbody>
            {recapData.length > 0 ? (
              recapData.map((monthData) => (
                <tr key={monthData.month} className="border">
                  <td className="p-4 border font-medium text-center">{months.find(m => m.value === monthData.month)?.label}</td>
                  <td className="p-4 border">
                    {monthData.projects.length > 0 ? (
                      <ul>
                        {monthData.projects.map((project) => (
                          <li key={project._id}>{project.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">Aucun projet</span>
                    )}
                  </td>
                  <td className="p-4 border text-center">
                    {monthData.projects.length > 0 ? (
                      <ul>
                        {monthData.projects.map((project) => (
                          <li key={project._id}>{project.totalCost.toLocaleString()} €</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-4 border text-center font-bold">{monthData.totalMonthCost.toLocaleString()} €</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 border text-center text-gray-500">
                  Aucun projet trouvé.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200">
              <td colSpan={3} className="p-4 border text-right font-semibold">💵 Coût Total Global :</td>
              <td className="p-4 border text-center font-bold text-green-600">{totalOverallCost.toLocaleString()} €</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default Recap;
