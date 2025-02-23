import { Request, Response, NextFunction } from "express";
import Collaborator from "../models/collaboratorModel"; // ✅ Correct : Importation par défaut
import { Project } from "../models/projectsModel";

// Récupérer tous les collaborateurs avec leurs projets
export const getCollaborators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const collaborators = await Collaborator.find().populate("projects.projectId");
        res.status(200).json(collaborators);
    } catch (error) {
        console.error("Erreur lors de la récupération des collaborateurs :", error);
        next(error);
    }
};


// Ajouter un collaborateur
export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, projects } = req.body;

        // Vérifier si les projets existent dans la base
        const existingProjects = await Project.find({ _id: { $in: projects } });

        if (existingProjects.length !== projects.length) {
            res.status(400).json({ error: "Un ou plusieurs projets n'existent pas" });
            return;
        }

        // Convertir chaque projet en { projectId, daysWorked: 0 }
        const formattedProjects = projects.map((projectId: string) => ({
            projectId,
            daysWorked: 0, // Initialisation
        }));

        const newCollaborator = new Collaborator({ name, projects: formattedProjects, totalDaysWorked: 0 });

        await newCollaborator.save();
        res.status(201).json(newCollaborator);
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur interne du serveur", details: error });
    }
};

// Mettre à jour un collaborateur
export const updateCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, projects } = req.body;

        // Vérifier si les projets existent
        const existingProjects = await Project.find({ _id: { $in: projects } });

        if (existingProjects.length !== projects.length) {
            res.status(400).json({ error: "Un ou plusieurs projets n'existent pas" });
            return;
        }

        const updatedCollaborator = await Collaborator.findByIdAndUpdate(
            req.params.id,
            { name, projects },
            { new: true }
        ).populate("projects");

        if (!updatedCollaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        res.status(200).json(updatedCollaborator);
    } catch (error) {
        next(error);
    }
};

// Ajouter des jours travaillés à un collaborateur (total ou par projet)
export const addDaysWorked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { projectId, days } = req.body;
        const { id } = req.params;

        if (!days || days <= 0) {
            res.status(400).json({ error: "Le nombre de jours doit être supérieur à 0" });
            return;
        }

        const collaborator = await Collaborator.findById(id);
        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        if (projectId) {
            // Vérifier si le projet appartient bien au collaborateur
            const projectIndex = collaborator.projects.findIndex(
                (p) => p.projectId.toString() === projectId
            );

            if (projectIndex === -1) {
                res.status(400).json({ error: "Ce projet n'est pas attribué à ce collaborateur" });
                return;
            }

            // Mettre à jour les jours travaillés pour ce projet
            collaborator.projects[projectIndex].daysWorked += days;
        } else {
            // Mettre à jour le total des jours travaillés
            collaborator.totalDaysWorked += days;
        }

        await collaborator.save();
        res.status(200).json({ message: "Jours travaillés mis à jour avec succès", collaborator });
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ error: "Erreur interne du serveur", details: error });
    }
};

// Supprimer un collaborateur
export const deleteCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deletedCollaborator = await Collaborator.findByIdAndDelete(req.params.id);

        if (!deletedCollaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        res.status(200).json({ message: "Collaborateur supprimé avec succès" });
    } catch (error) {
        next(error);
    }
};
