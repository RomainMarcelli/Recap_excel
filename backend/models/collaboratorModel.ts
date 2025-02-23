import mongoose, { Schema, Document, Types } from "mongoose";
import { Id } from "react-toastify";

interface IProject {
    projectId: Types.ObjectId; // Référence vers la collection Project
    daysWorked: number; // Nombre de jours travaillés par projet
}

interface ICollaborator extends Document {
    name: string;
    totalDaysWorked: number;
    projects: IProject[];
}

const CollaboratorSchema = new Schema<ICollaborator>({
    name: { type: String, required: true },
    totalDaysWorked: { type: Number, default: 0 },
    projects: [
        {
            projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true }, // Référence correcte
            daysWorked: { type: Number, default: 0 },
        },
    ],
});

const Collaborator = mongoose.model<ICollaborator>("Collaborator", CollaboratorSchema);

export default Collaborator;
