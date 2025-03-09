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

        const filterMonth = month || getCurrentMonth();
        const filterYear = year || getCurrentYear();

        // 🔥 Assure que les projets sont bien récupérés avec `populate`
        const collaborators = await Collaborator.find()
            .populate("projects.projectId");

        res.status(200).json(collaborators);
    } catch (error) {
        console.error("Erreur lors de la récupération des collaborateurs :", error);
        next(error);
    }
};

export const addCollaborator = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, projects } = req.body;

        // Vérifier si les projets existent en base de données
        const existingProjects = await Project.find({ _id: { $in: projects } });
        if (existingProjects.length !== projects.length) {
            res.status(400).json({ error: "Un ou plusieurs projets n'existent pas" });
            return;
        }

        // Formater les projets avec des `ObjectId`
        const formattedProjects = projects.map((projId: string) => ({
            projectId: new mongoose.Types.ObjectId(projId),
            daysWorked: 0,
        }));

        // Créer le nouveau collaborateur avec ses projets
        const newCollaborator = new Collaborator({
            name,
            projects: formattedProjects
        });

        await newCollaborator.save();

        // 🔥 Rechercher et retourner le collaborateur avec ses projets peuplés
        const populatedCollaborator = await Collaborator.findById(newCollaborator._id).populate("projects.projectId");

        res.status(201).json(populatedCollaborator);
    } catch (error) {
        next(error);
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

        // Conserver les jours travaillés existants lors de la mise à jour
        const collaborator = await Collaborator.findById(req.params.id);
        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        const updatedProjects = projects.map((projId: string) => {
            const existingProject = collaborator.projects.find(p => p.projectId.toString() === projId);
            return {
                projectId: new mongoose.Types.ObjectId(projId),
                daysWorked: existingProject ? existingProject.daysWorked : 0
            };
        });

        // Mise à jour du collaborateur avec ses projets
        const updatedCollaborator = await Collaborator.findByIdAndUpdate(
            req.params.id,
            { name, projects: updatedProjects },
            { new: true }
        ).populate("projects.projectId");

        res.status(200).json(updatedCollaborator);
    } catch (error) {
        next(error);
    }
};

// Ajouter des jours travaillés à un collaborateur (total ou par projet)
export const addDaysWorked = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { projectId, days, month, year } = req.body;
        const { id } = req.params;

        if (!days || days < 0) {
            res.status(400).json({ error: "Le nombre de jours doit être supérieur ou égal à 0" });
            return;
        }

        const collaborator = await Collaborator.findById(id);
        if (!collaborator) {
            res.status(404).json({ error: "Collaborateur non trouvé" });
            return;
        }

        // 🔥 Vérifie si le collaborateur a déjà une entrée pour ce mois et cette année
        let existingEntry = await Collaborator.findOne({
            _id: id,
            month,
            year
        });

        if (existingEntry) {
            // 🔥 Si une entrée existe pour ce mois, met à jour les jours travaillés
            const projectIndex = existingEntry.projects.findIndex(
                (p) => p.projectId.toString() === projectId
            );

            if (projectIndex === -1) {
                res.status(400).json({ error: "Ce projet n'est pas attribué à ce collaborateur" });
                return;
            }

            existingEntry.projects[projectIndex].daysWorked = days;
            await existingEntry.save();
        } else {
            // 🔥 Si aucune entrée n'existe pour ce mois, duplique le collaborateur et l'ajoute
            const newCollaborator = new Collaborator({
                name: collaborator.name,
                projects: collaborator.projects.map(p => ({
                    projectId: p.projectId,
                    daysWorked: p.projectId.toString() === projectId ? days : 0
                })),
                month,
                year
            });

            await newCollaborator.save();
        }

        res.status(200).json({ message: "Jours travaillés mis à jour", collaborator });
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