import mongoose, { Schema, Document, Types } from "mongoose";

interface IProject {
    projectId: Types.ObjectId; // Référence vers la collection Project
    daysWorked: number; // Nombre de jours travaillés par projet
}

interface ICollaborator extends Document {
    name: string;
    totalDaysWorked: number;
    projects: IProject[];
    month: string; // ✅ Ajout du champ mois
    year: number;  // ✅ Ajout de l'année pour mieux gérer l'historique
    comments?: string; // ✅ Ajout du champ commentaire
    tjm?: number;  // ✅ Nouveau champ TJM (Taux Journalier Moyen)
}

const CollaboratorSchema = new Schema<ICollaborator>({
    name: { type: String, required: true },
    totalDaysWorked: { type: Number, default: 0 },
    projects: [
        {
            projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
            daysWorked: { type: Number, default: 0 },
        },
    ],
    month: { type: String, required: true, default: new Date().toISOString().slice(5, 7) }, // ✅ Ajout du mois
    year: { type: Number, required: true, default: new Date().getFullYear() }, // ✅ Ajout de l'année
    tjm: { type: Number, default: null }, // ✅ Champ TJM
    comments: { type: String, default: "" }, // ✅ Ajout du champ commentaires avec une valeur par défaut vide
});

console.log("🔵 Modèle Collaborator chargé avec succès.");

const Collaborator = mongoose.model<ICollaborator>("Collaborator", CollaboratorSchema);

export default Collaborator;
