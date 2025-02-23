import { useState } from "react";
import { motion } from "framer-motion";

interface Project {
  _id: string;
  name: string;
}

interface Collaborator {
  _id: string;
  name: string;
  projects: Project[]; // Chaque collaborateur a une liste de projets associés
}

interface Props {
  collaborators: Collaborator[];
  onAddDays: (collaboratorId: string, projectId: string | null, days: number) => void;
}

function CollaboratorList({ collaborators, onAddDays }: Props) {
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [daysWorked, setDaysWorked] = useState<number>(0);
  const [mode, setMode] = useState<"total" | "project">("total");

  // Trouver le collaborateur sélectionné
  const selectedCollab = collaborators.find((c) => c._id === selectedCollaborator);

  const handleAddDays = () => {
    if (!selectedCollaborator || daysWorked <= 0 || (mode === "project" && !selectedProject)) return;
    onAddDays(selectedCollaborator, mode === "project" ? selectedProject : null, daysWorked);
    setDaysWorked(0);
    setSelectedProject(null);
  };

  return (
    <div className="mt-6 w-full max-w-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
        Liste des Collaborateurs
      </h2>

      {/* Sélection du collaborateur */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Sélectionner un collaborateur :</label>
        <select
          value={selectedCollaborator}
          onChange={(e) => {
            setSelectedCollaborator(e.target.value);
            setSelectedProject(null); // Reset le projet lorsqu'on change de collaborateur
          }}
          className="w-full border border-gray-300 p-2 rounded-md"
        >
          <option value="">-- Choisir un collaborateur --</option>
          {collaborators.map((collab) => (
            <option key={collab._id} value={collab._id}>
              {collab.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mode d'ajout des jours */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Ajouter des jours :</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "total" | "project")}
          className="w-full border border-gray-300 p-2 rounded-md"
        >
          <option value="total">Total des jours travaillés</option>
          <option value="project">Par projet</option>
        </select>
      </div>

      {/* Sélection d'un projet (si mode "Par projet") */}
      {mode === "project" && selectedCollab && selectedCollab.projects.length > 0 && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Sélectionner un projet :</label>
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-md"
          >
            <option value="">-- Choisir un projet --</option>
            {selectedCollab.projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nombre de jours travaillés */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Nombre de jours :</label>
        <input
          type="number"
          value={daysWorked}
          onChange={(e) => setDaysWorked(Number(e.target.value))}
          className="w-full border border-gray-300 p-2 rounded-md"
          min="1"
        />
      </div>

      {/* Bouton Ajouter */}
      <button
        onClick={handleAddDays}
        disabled={!selectedCollaborator || daysWorked <= 0 || (mode === "project" && !selectedProject)}
        className={`w-full p-3 rounded-md transition ${
          !selectedCollaborator || daysWorked <= 0 || (mode === "project" && !selectedProject)
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Ajouter
      </button>

      {/* Liste des collaborateurs */}
      <div className="grid grid-cols-1 gap-4 mt-6">
        {collaborators.map((collab) => (
          <motion.div
            key={collab._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200 text-center"
          >
            <h3 className="text-lg font-semibold">{collab.name}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default CollaboratorList;
