import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    clothCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    featuredCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeaturedCategory"
    },
    gender: {
        type: String,
        trim: true,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    quantity: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    relatedImages: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId()
            },
            url: {
                type: String,
            }
        }
    ],
    description: {
        type: String,
    },
}, {timestamps: true});

export const ProductModel = mongoose.model('Product', productSchema);