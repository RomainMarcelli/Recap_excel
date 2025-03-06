import { Request, Response, NextFunction } from "express";
import Collaborator from "../models/collaboratorModel"; // ✅ Correct : Importation par défaut
import { Project } from "../models/projectsModel";
import mongoose from "mongoose"; // Ajout pour ObjectId


// 📌 Fonction pour récupérer le mois actuel (ex: "03" pour mars)
const getCurrentMonth = (): string => {
    return new Date().toISOString().slice(5, 7);
};

// 📌 Fonction pour récupérer l'année actuelle
const getCurrentYear = (): number => {
    return new Date().getFullYear();
};

// Récupérer tous les collaborateurs avec leurs projets
export const getCollaborators = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { month, year } = req.query;

        // Utilisation des valeurs par défaut si non spécifiées
        const filterMonth = month || getCurrentMonth();
        const filterYear = year || getCurrentYear();

        const collaborators = await Collaborator.find({ month: filterMonth, year: filterYear })
            .populate("projects.projectId");

        res.status(200).json(collaborators);
    } catch (error) {
        console.error("Erreur lors de la récupération des collaborateurs :", error);
        next(error);
    }
};


export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, projects, month, year } = req.body;

        // Vérifier si les projets existent en convertissant les IDs en ObjectId
        const projectIds = projects.map((projId: string) => new mongoose.Types.ObjectId(projId));

        const existingProjects = await Project.find({ _id: { $in: projectIds } });

        if (existingProjects.length !== projects.length) {
            res.status(400).json({ error: "Un ou plusieurs projets n'existent pas" });
            return;
        }

        // Transformer projects en [{ projectId, daysWorked: 0 }]
        const formattedProjects = projectIds.map((projId: mongoose.Types.ObjectId) => ({
            projectId: projId,
            daysWorked: 0, // Initialisation des jours travaillés
        }));

        const newCollaborator = new Collaborator({
            name,
            projects: formattedProjects, // ✅ Correction ici
            month: month || new Date().toISOString().slice(5, 7),
            year: year || new Date().getFullYear(),
            totalDaysWorked: 0,
        });

        await newCollaborator.save();
        res.status(201).json(newCollaborator);
    } catch (error) {
        next(error);
    }
};


// Mettre à jour un collaborateur
export const updateCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, projects } = req.body;

        // Convertir les projectId en ObjectId
        const projectIds = projects.map((projId: string) => new mongoose.Types.ObjectId(projId));

        const existingProjects = await Project.find({ _id: { $in: projectIds } });

        if (existingProjects.length !== projects.length) {
            res.status(400).json({ error: "Un ou plusieurs projets n'existent pas" });
            return;
        }

        // Réinitialiser les projets non sélectionnés
        const formattedProjects = projectIds.map((projId: mongoose.Types.ObjectId) => ({
            projectId: projId,
            daysWorked: 0, // ✅ Réinitialise les jours travaillés
        }));

        const updatedCollaborator = await Collaborator.findByIdAndUpdate(
            req.params.id,
            { name, projects: formattedProjects },
            { new: true }
        ).populate("projects.projectId");

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
            const projectObjectId = new mongoose.Types.ObjectId(projectId); // ✅ Correction ici

            // Vérifier si le projet appartient bien au collaborateur
            const projectIndex = collaborator.projects.findIndex(
                (p) => p.projectId.toString() === projectObjectId.toString()
            );

            if (projectIndex === -1) {
                res.status(400).json({ error: "Ce projet n'est pas attribué à ce collaborateur" });
                return;
            }

            // Mettre à jour les jours travaillés pour ce projet
            collaborator.projects[projectIndex].daysWorked += days;
        }

        // Mettre à jour le total des jours travaillés
        collaborator.totalDaysWorked = collaborator.projects.reduce((total, p) => total + (p.daysWorked || 0), 0);

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


// ✅ Mettre à jour un commentaire
export const updateCollaboratorComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { comments } = req.body;
        const { id } = req.params;

        const collaborator = await Collaborator.findById(id);
        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return
        }

        collaborator.comments = comments;
        await collaborator.save();

        res.status(200).json({ message: "Commentaire mis à jour", collaborator });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur", details: error });
    }
};