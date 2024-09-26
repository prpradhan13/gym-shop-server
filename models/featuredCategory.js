import mongoose from "mongoose";

const featuredCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    slug: {
        type: String,
        lowercase: true
    },
    featuredGender: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: true,
    }
}, {timestamps: true});

export const FeaturedCategoryModel = mongoose.model('FeaturedCategory', featuredCategorySchema);