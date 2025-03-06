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
    comments?: string;
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
});


const Collaborator = mongoose.model<ICollaborator>("Collaborator", CollaboratorSchema);

export default Collaborator;
