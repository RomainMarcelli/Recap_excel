import { Request, Response, NextFunction } from "express";
import { Project } from "../models/projectsModel";

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
