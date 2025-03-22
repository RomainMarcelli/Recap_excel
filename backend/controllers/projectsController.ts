import { Request, Response, NextFunction } from "express";
import { Project } from "../models/projectsModel";
import Collaborator from "../models/collaboratorModel"; // Import du modèle des collaborateurs

// Récupérer tous les projets
export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

// Ajouter un projet
export const addProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newProject = new Project({ name: req.body.name });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un projet
export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!updatedProject) {
      res.status(404).json({ error: "Projet non trouvé" });
      return;
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};

// Supprimer un projet
export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      res.status(404).json({ error: "Projet non trouvé" });
      return;
    }

    res.status(200).json({ message: "Projet supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};


// ✅ Fonction pour récupérer les projets groupés par mois
export const getRecapByMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Regroupement des projets par mois
    const recapData = await Collaborator.aggregate([
      {
        $unwind: "$projects", // Sépare chaque projet dans un document distinct
      },
      {
        $lookup: {
          from: "projects", // Assurez-vous que le nom de la collection est correct
          localField: "projects.projectId",
          foreignField: "_id",
          as: "projectInfo",
        },
      },
      {
        $unwind: "$projectInfo",
      },
      {
        $group: {
          _id: {
            month: "$month",
            projectId: "$projects.projectId",
          },
          projectName: { $first: "$projectInfo.name" },
          totalCost: {
            $sum: {
              $multiply: ["$projects.daysWorked", "$tjm"], // Calcul du coût total
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          projects: {
            $push: {
              _id: "$_id.projectId",
              name: "$projectName",
              totalCost: "$totalCost",
            },
          },
          totalMonthCost: { $sum: "$totalCost" }, // Total pour le mois
        },
      },
      {
        $sort: { _id: 1 }, // Trie les mois dans l'ordre croissant
      },
    ]);

    res.status(200).json(recapData);
  } catch (error) {
    console.error("Erreur lors de la récupération du récapitulatif :", error);
    next(error);
  }
};