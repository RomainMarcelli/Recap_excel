import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Project {
  _id: string;
  name: string;
}

function Projet() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [updatedProjectName, setUpdatedProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() === "") return;

    const response = await fetch("http://localhost:5000/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: projectName }),
    });

    if (response.ok) {
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setProjectName("");
      toast.success("Projet ajouté avec succès !");
    }
  };

  const deleteProject = async (id: string) => {
    const response = await fetch(`http://localhost:5000/projects/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setProjects(projects.filter((project) => project._id !== id));
      toast.success("Projet supprimé avec succès !");
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditingProject(id);
    setUpdatedProjectName(name);
  };

  const updateProject = async (id: string) => {
    const response = await fetch(`http://localhost:5000/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: updatedProjectName }),
    });

    if (response.ok) {
      const updatedProject = await response.json();
      setProjects(
        projects.map((project) =>
          project._id === id ? updatedProject : project
        )
      );
      setEditingProject(null);
      toast.success("Projet modifié avec succès !");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Gérer les Projets</h1>

      <form onSubmit={addProject} className="bg-white shadow-md p-6 rounded-md w-96">
        <label className="block text-gray-700">Nom du projet :</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded-md mt-2"
          placeholder="Entrez le nom du projet"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-full"
        >
          Ajouter Projet
        </button>
      </form>

      <ul className="mt-6 w-96">
        {projects.map((project) => (
          <li
            key={project._id}
            className="p-4 bg-white shadow-md rounded-md mt-2 flex justify-between items-center"
          >
            {editingProject === project._id ? (
              <input
                type="text"
                value={updatedProjectName}
                onChange={(e) => setUpdatedProjectName(e.target.value)}
                className="border border-gray-300 p-2 w-full rounded-md"
              />
            ) : (
              <span>{project.name}</span>
            )}

            <div className="flex space-x-2">
              {editingProject === project._id ? (
                <button
                  onClick={() => updateProject(project._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                >
                  Valider
                </button>
              ) : (
                <button
                  onClick={() => startEditing(project._id, project.name)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                >
                  Modifier
                </button>
              )}
              <button
                onClick={() => deleteProject(project._id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Projet;
