import { AddressSchema } from '../models/addressModel.js';
import { UserModel } from '../models/userModel.js';

const createAddress = async (req, res) => {
    try {
        const { street, phone, city, state, postalCode, country } = req.body;
        const userId = req.user._id;
        
        if ([street, phone, city, state, postalCode, country].some((field) => !field?.trim())){
            return res.status(400).json({success: false, message: "All fields are required"});
        }

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const createdAddress = await AddressSchema.create({
            street, 
            phone, 
            city, 
            state, 
            postalCode, 
            country,
            userOwn: userId
        });

        await UserModel.findByIdAndUpdate(
            userId, 
            { $push: { address: createdAddress._id } }
        );

        return res.status(200).json({
            createdAddress, 
            success: true, 
            message: "Address created successfully"
        });
      
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({
            success: false, 
            message: 'Error creating address', 
            error: error.message 
        });
    }
};


export {createAddress}