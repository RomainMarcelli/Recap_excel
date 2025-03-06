import { useState, useEffect } from "react";

interface Project {
  _id: string;
  name: string;
}

interface Collaborator {
  _id: string;
  name: string;
  totalDaysWorked: number;
  month: string; // ✅ Ajout du mois dans l'objet collaborateur
  projects: {
    projectId: Project;
    daysWorked: number;
  }[];
  comments?: string;
}

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

function Home() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(5, 7) // 📌 Défaut = mois actuel
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");

  // Trouver le nom du mois sélectionné
  const selectedMonthName = months.find((m) => m.value === selectedMonth)?.label || "Mois inconnu";

  // Charger les collaborateurs du mois sélectionné
  useEffect(() => {
    fetch(`http://localhost:5000/collaborators?month=${selectedMonth}&year=${currentYear}`)
      .then((response) => response.json())
      .then((data) => setCollaborators(data))
      .catch((error) => console.error("Erreur lors du chargement :", error));
  }, [selectedMonth, currentYear]); // ✅ Recharge quand le mois ou l'année changent

  // ✅ Sauvegarder un commentaire
  const saveComment = async (id: string) => {
    if (!commentText.trim()) {
      setEditingCommentId(null);
      return;
    }

    const response = await fetch(`http://localhost:5000/collaborators/${id}/comment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: commentText }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du commentaire");
    }

    const updatedCollaborator = await response.json();
    setCollaborators((prev) =>
      prev.map((collab) =>
        collab._id === id ? { ...collab, comments: updatedCollaborator.collaborator.comments } : collab
      )
    );

    setEditingCommentId(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* 🔹 Barre du haut avec le sélecteur de mois */}
      <div className="w-full flex justify-between items-center max-w-4xl">
        <h1 className="text-3xl font-bold text-blue-600">
          Suivi du travail - {selectedMonthName} {currentYear}
        </h1>

        {/* 📌 Sélection du mois */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 p-2 rounded-md shadow-md text-gray-700 bg-white"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-gray-600 mt-2">Voici les détails des jours travaillés pour le mois sélectionné.</p>

      {/* 🔹 Tableau des collaborateurs */}
      <div className="mt-6 w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-3 border">Nom</th>
              <th className="p-3 border">Projets</th>
              <th className="p-3 border">Jours Travaillés</th>
              <th className="p-3 border">Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {collaborators.length > 0 ? (
              collaborators.map((collab) => (
                <tr key={collab._id} className="text-center border">
                  <td className="p-3 border">{collab.name}</td>
                  <td className="p-3 border">
                    {collab.projects.length > 0 ? (
                      <ul className="list-none">
                        {collab.projects.map((project) => (
                          <li key={project.projectId?._id} className="text-blue-700">
                            {project.projectId?.name} - {project.daysWorked} jours
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-500">Aucun projet</span>
                    )}
                  </td>
                  <td className="p-3 border">{collab.totalDaysWorked ?? 0} jours</td>

                  {/* ✅ Double-clic pour modifier un commentaire */}
                  <td
                    className="p-3 border text-gray-700 cursor-pointer hover:bg-gray-200"
                    onDoubleClick={() => {
                      setEditingCommentId(collab._id);
                      setCommentText(collab.comments || "");
                    }}
                  >
                    {editingCommentId === collab._id ? (
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onBlur={() => saveComment(collab._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveComment(collab._id);
                          }
                        }}
                        className="w-full border border-gray-300 p-1 rounded-md"
                        autoFocus
                      />
                    ) : (
                      collab.comments || "Double-cliquez pour ajouter un commentaire"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
                  Aucun collaborateur trouvé pour ce mois.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
