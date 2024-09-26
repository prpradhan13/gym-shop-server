import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        trim: true,
        required: true,
    },
    phone:{
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please fill a valid phone number']
    },
    city: {
        type: String,
        trim: true,
        required: true,
    },
    state: {
        type: String,
        trim: true,
        required: true,
    },
    postalCode: {
        type: String,
        trim: true,
        required: true,
    },
    country: {
        type: String,
        trim: true,
        required: true,
    },
    userOwn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

export const AddressSchema = mongoose.model('Address', addressSchema);