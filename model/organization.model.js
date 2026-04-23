import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    deletedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    members:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
}, {timestamps: true});

const Organization = mongoose.model("Organization", OrganizationSchema);
export default Organization;