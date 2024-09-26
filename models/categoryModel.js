import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    slug: {
        type: String,
        lowercase: true
    }
}, {timestamps: true});

export const CategoryModel = mongoose.model('Category', categorySchema);