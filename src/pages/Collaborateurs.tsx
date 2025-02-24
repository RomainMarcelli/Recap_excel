import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CollaboratorList from "../components/CollaboratorList";

interface Project {
    _id: string;  // ID du projet
    name: string; // Nom du projet
}

interface Collaborator {
    _id: string;
    name: string;
    totalDaysWorked: number; // ✅ Ce champ doit exister
    projects: {
        projectId: Project;
        daysWorked: number;
    }[]; // ✅ Correction
}

function Collaborateurs() {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [name, setName] = useState("");
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [editingCollaborator, setEditingCollaborator] = useState<string | null>(null);
    const [updatedName, setUpdatedName] = useState("");
    const [updatedProjects, setUpdatedProjects] = useState<string[]>([]);
    const [showOnlyCollaborators, setShowOnlyCollaborators] = useState(false);

    useEffect(() => {
        fetchCollaborators();
        fetchProjects();
    }, []);

    const fetchCollaborators = async () => {
        const response = await fetch("http://localhost:5000/collaborators");
        const data: Collaborator[] = await response.json(); // ✅ Ajout du type explicite
    
        setCollaborators(data.map((collab: Collaborator) => ({
            ...collab,
            projects: collab.projects.map((p: { projectId: Project; daysWorked: number }) => ({ 
                projectId: p.projectId, // ✅ Correction pour éviter les erreurs d'affichage
                daysWorked: p.daysWorked ?? 0,
            })),
            totalDaysWorked: collab.totalDaysWorked ?? 0, // ✅ S'assurer que ce champ existe
        })));
    };
    

    const fetchProjects = async () => {
        const response = await fetch("http://localhost:5000/projects");
        const data = await response.json();
        setProjects(data);
    };

    const addCollaborator = async () => {
        const response = await fetch("http://localhost:5000/collaborators", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, projects: selectedProjects }),
        });

        if (response.ok) {
            fetchCollaborators();
            setName("");
            setSelectedProjects([]);
        }
    };

    const deleteCollaborator = async (id: string) => {
        await fetch(`http://localhost:5000/collaborators/${id}`, { method: "DELETE" });
        fetchCollaborators();
    };

    // const deleteAllCollaborators = async () => {
    //     for (const collab of collaborators) {
    //         await fetch(`http://localhost:5000/collaborators/${collab._id}`, { method: "DELETE" });
    //     }
    //     fetchCollaborators();
    // };

    const startEditing = (collab: Collaborator) => {
        setEditingCollaborator(collab._id);
        setUpdatedName(collab.name);
        setUpdatedProjects(collab.projects.map((p) => p.projectId?._id || "")); // ✅ Vérification si `projectId` est défini
    };

    const cancelEditing = () => {
        setEditingCollaborator(null);
    };

    const updateCollaborator = async (id: string) => {
        await fetch(`http://localhost:5000/collaborators/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: updatedName, projects: updatedProjects }),
        });

        setEditingCollaborator(null);
        fetchCollaborators();
    };

    const toggleShowCollaborators = () => {
        setShowOnlyCollaborators(!showOnlyCollaborators);
    };

    const handleAddDays = async (collaboratorId: string, projectId: string | null, days: number) => {
        if (!collaboratorId || days <= 0) return;

        const response = await fetch(`http://localhost:5000/collaborators/${collaboratorId}/add-days`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, days }),
        });

        if (response.ok) {
            fetchCollaborators(); // ✅ Mettre à jour l'affichage après l'ajout des jours
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            {/* Bouton Nombre de jours travaillés */}
            <button
                onClick={toggleShowCollaborators}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
                {showOnlyCollaborators ? "Revenir à l'affichage normal" : "Nombre de jours travaillés"}
            </button>

            {/* Affichage uniquement de la liste des collaborateurs */}
            {showOnlyCollaborators ? (
               <CollaboratorList
               collaborators={collaborators.map((collab) => ({
                 ...collab,
                 projects: collab.projects.map((p) => ({
                   projectId: p.projectId, // ✅ Correction : garder `projectId`
                   daysWorked: p.daysWorked ?? 0, // ✅ Ajouter `daysWorked`
                 })),
                 totalDaysWorked: collab.totalDaysWorked ?? 0,
               }))} 
               onAddDays={handleAddDays}
             />             
            ) : (
                <>
                    {/* Formulaire d'ajout */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg"
                    >
                        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">
                            Gérer les Collaborateurs
                        </h1>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Nom du collaborateur"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Sélectionner des projets :</label>
                            <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-md shadow-md border border-gray-300">
                                {projects.map((project) => (
                                    <label key={project._id} className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={project._id}
                                            checked={selectedProjects.includes(project._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProjects([...selectedProjects, project._id]);
                                                } else {
                                                    setSelectedProjects(selectedProjects.filter((id) => id !== project._id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{project.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <motion.button
                            onClick={addCollaborator}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition"
                        >
                            Ajouter Collaborateur
                        </motion.button>
                    </motion.div>

                    {/* Liste des collaborateurs */}
                    <div className="mt-6 w-full max-w-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
                            Liste des Collaborateurs
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            {collaborators.map((collab) => (
                                <motion.div
                                    key={collab._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white shadow-md rounded-lg p-4 border border-gray-200 flex justify-between items-center"
                                >
                                    <div className="w-full">
                                        {editingCollaborator === collab._id ? (
                                            <>
                                                {/* Modifier le nom */}
                                                <input
                                                    type="text"
                                                    value={updatedName}
                                                    onChange={(e) => setUpdatedName(e.target.value)}
                                                    className="w-full border border-gray-300 p-2 rounded-md mb-2"
                                                />

                                                {/* Modifier les projets */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {projects.map((project) => (
                                                        <label key={project._id} className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={updatedProjects.includes(project._id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setUpdatedProjects([...updatedProjects, project._id]);
                                                                    } else {
                                                                        setUpdatedProjects(updatedProjects.filter((id) => id !== project._id));
                                                                    }
                                                                }}
                                                            />
                                                            <span className="ml-2">{project.name}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Boutons de validation */}
                                                <div className="flex justify-end mt-2 space-x-2">
                                                    <button onClick={() => updateCollaborator(collab._id)} className="bg-green-500 text-white px-3 py-1 rounded-md">
                                                        Valider
                                                    </button>
                                                    <button onClick={cancelEditing} className="bg-gray-500 text-white px-3 py-1 rounded-md">
                                                        Annuler
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Affichage du nom et des projets */}
                                                <h3 className="text-lg font-semibold">{collab.name}</h3>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {collab.projects.length > 0 ? (
                                                        collab.projects.map((project) => (
                                                            <span
                                                                key={project.projectId?._id || Math.random()} // ✅ Ajout d’une `key` de secours
                                                                className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
                                                            >
                                                                {project.projectId?.name || "Projet inconnu"} - {project.daysWorked ?? 0} jours
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">Aucun projet attribué</span>
                                                    )}
                                                </div>


                                            </>
                                        )}
                                    </div>

                                    {/* Boutons Modifier et Supprimer */}
                                    <div className="flex space-x-2">
                                        {editingCollaborator === collab._id ? null : (
                                            <>
                                                <button onClick={() => startEditing(collab)} className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition">
                                                    Modifier
                                                </button>
                                                <button onClick={() => deleteCollaborator(collab._id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

}
export default Collaborateurs;
