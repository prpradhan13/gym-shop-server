import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({path: './.env'})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUpload = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // Upload on the cloudinary
        const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)
        return uploadResponse;

    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath); // Remove locally saved temporary file as the upload operation got failed.
    }
};

export {cloudinaryUpload};
