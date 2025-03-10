import { useState, useEffect } from "react";

interface Project {
  _id: string;
  name: string;
}

interface Collaborator {
  _id: string;
  name: string;
  month: string;
  tjm?: number;
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
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(5, 7));
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");

  const selectedMonthName = months.find((m) => m.value === selectedMonth)?.label || "Mois inconnu";

  useEffect(() => {
    fetch(`http://localhost:5000/collaborators?month=${selectedMonth}&year=${currentYear}`)
      .then((response) => response.json())
      .then((data) => setCollaborators(data))
      .catch((error) => console.error("Erreur lors du chargement :", error));
  }, [selectedMonth, currentYear]);

  const saveComment = async (id: string) => {
    if (!commentText.trim()) {
      setEditingCommentId(null);
      return;
    }

    console.log("🔵 Envoi de la mise à jour du commentaire pour :", id, "avec :", commentText);

    try {
      const response = await fetch(`http://localhost:5000/collaborators/${id}/comment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: commentText }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du commentaire");
      }

      const updatedCollaborator = await response.json();
      console.log("✅ Réponse reçue après mise à jour :", updatedCollaborator);

      // ✅ Mise à jour correcte de l'état après modification du commentaire
      setCollaborators((prev) =>
        prev.map((collab) =>
          collab._id === id ? { ...collab, comments: updatedCollaborator.comments } : collab
        )
      );
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du commentaire :", error);
    } finally {
      setEditingCommentId(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full flex justify-between items-center max-w-4xl mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Suivi du travail - {selectedMonthName} {currentYear}
        </h1>

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

      <p className="text-gray-600 mb-4">Détails des jours travaillés pour le mois sélectionné.</p>

      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              <th className="p-4 border">Nom</th>
              <th className="p-4 border">Projets</th>
              <th className="p-4 border text-center">Total Jours Travaillés</th>
              <th className="p-4 border text-center">TJM Total (€)</th>
              <th className="p-4 border">Commentaires</th>
            </tr>
          </thead>
          <tbody>
            {collaborators.length > 0 ? (
              collaborators.map((collab, index) => {
                const totalDaysWorked = collab.projects.reduce((acc, project) => acc + project.daysWorked, 0);
                const tjmTotal = collab.tjm ? totalDaysWorked * collab.tjm : 0;

                return (
                  <tr key={collab._id} className="border">
                    <td className="p-4 border font-medium">{collab.name}</td>

                    <td className="p-4 border">
                      {collab.projects.length > 0 ? (
                        <ul className="space-y-1">
                          {collab.projects.map((project) => (
                            <li key={project.projectId?._id} className="text-blue-700">
                              {project.projectId?.name} - <span className="font-bold">{project.daysWorked} jours</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">Aucun projet</span>
                      )}
                    </td>

                    <td className="p-4 border text-center font-semibold">{totalDaysWorked} jours</td>

                    <td className="p-4 border text-center font-semibold">
                      {collab.tjm ? `${tjmTotal.toLocaleString()} €` : <span className="text-gray-500">Non défini</span>}
                    </td>

                    <td
                      className="p-4 border text-gray-700 cursor-pointer hover:bg-gray-300 transition"
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
                        collab.comments || <span className="text-gray-500 italic">Double-cliquez pour ajouter</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-6 border text-center text-gray-500">
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
