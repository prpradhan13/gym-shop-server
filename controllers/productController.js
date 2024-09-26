import { cloudinaryUpload } from '../utils/cloudinary.js';
import { ProductModel } from '../models/productModel.js';
import mongoose from 'mongoose';
import NodeCache from 'node-cache';

const productCache = new NodeCache(); // Cache for 1 hour then do { stdTTL: 3600 }

// Create a new product
const createProduct = async (req, res) => {
    try {
        const {name, clothCategory, featuredCategory, gender, price, isFeatured, quantity, description} = req.body;
        if([name, clothCategory, gender, price, quantity].some((field) => field?.trim() === "")){
            return res.status(400).json({success:false, message: 'All fields are required'})
        }

        const imageLocalPath = req.files && req.files.image ? req.files.image[0].path : null;
        if(!imageLocalPath){
            return res.status(400).json({success:false, message: 'ImageLocalPath file is required'});
        }
        
        // Upload the image to Clooudinary
        const image = await cloudinaryUpload(imageLocalPath);
        if(!image){
            return res.status(500).json({success:false, message: 'Image file is required'});
        }

        const relatedImageLocalPath = req.files && req.files.relatedImages ? req.files.relatedImages.map(file => file.path) : [];
        // Upload the RelatedImages to Clooudinary
        const uploadedImages = await Promise.all(relatedImageLocalPath.map(path => cloudinaryUpload(path)));
        const relatedImages = uploadedImages.map(uploaded => ({
            _id: new mongoose.Types.ObjectId(),
            url: uploaded.url
        }));
        
        /* Why Use Promise.all :
            1. Concurrency: Promise.all allows multiple promises to run concurrently, 
                which can be significantly faster than running them sequentially, especially for I/O-bound operations like network requests.
            2. Efficiency: Instead of waiting for each upload to complete before starting the next one, 
                Promise.all initiates all uploads simultaneously, which reduces the total time required.
            3. Error Handling: Promise.all provides a unified way to handle errors. 
                If any of the promises reject, the entire Promise.all will reject, allowing you to handle errors in a centralized manner.
        */

        const product = await ProductModel.create({
            name: name.toLowerCase(),
            clothCategory,
            featuredCategory,
            gender, 
            price,
            isFeatured,
            quantity,
            image: image.url,
            relatedImages,
            description: description?.toLowerCase() || ""
        })

        // Cache the new product
        // productCache.set(`create_product_${product._id}`, product)
        productCache.del(`all_products`);

        return res
        .status(201)
        .json({ 
            success:true, 
            message: 'Product created successfully',
            product 
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Error while creating product',
            error: error.message || error
        })
    }
};

// Update product
const updateProduct = async (req, res) => {
    try {
        const { prodId } = req.params
        const { name, clothCategory, featuredCategory, gender, price, isFeatuerd, quantity, description } = req.body;

        if ([name, clothCategory, gender, price, quantity].some(field => field?.trim() === "")) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const product = await ProductModel.findById(prodId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if product Image exists
        let image;
        if (req.files && req.files.image) {
            const imageLocalPath = req.files.image[0].path;
            // console.log('New Image Local Path:', imageLocalPath);
            image = await cloudinaryUpload(imageLocalPath);
            if (!image) {
                return res.status(400).json({ success: false, message: 'Image upload failed' });
            }
        }

        // Check if the product related image exists
        let relatedImages = [];
        if (req.files && req.files.relatedImages) {
            const relatedImageLocalPath = req.files.relatedImages.map(file => file.path);
            const uploadedImages = await Promise.all(relatedImageLocalPath.map(path => cloudinaryUpload(path)));
            relatedImages = uploadedImages.map(uploaded => ({
                _id: product.relatedImages.find(img => img.url === uploaded.url)?._id || new mongoose.Types.ObjectId(),
                url: uploaded.url
            }));
        }


        const updatedProduct = await ProductModel.findByIdAndUpdate(prodId, {
            name: name.toLowerCase(),
            clothCategory,
            featuredCategory,
            gender, 
            price,
            isFeatuerd,
            quantity,
            description,
            ...(image && { image: image.url }),
            ...(relatedImages.length > 0 && { relatedImages })
        }, { new: true });

        // Cache the updated product
        // productCache.set(`update_product_${updatedProduct._id}`, updatedProduct)
        productCache.del(`all_products`);

        res.status(200).json({ success: true, message:"Updated Product", updatedProduct });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Error while creating product',
            error: error.message || error
        })
    }
};

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const { prodId } = req.query;

        if (prodId) {
            // Get single product with caching
            const cacheKey = `product-${prodId}`;
            let product = productCache.get(cacheKey);

            // console.log('Cache Check:');

            if (!product) {
                product = await ProductModel.findById(prodId).populate('clothCategory featuredCategory');
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Product not found'
                    });
                }
                productCache.set(cacheKey, product);
                // console.log('Cache Set:');
            } 
            // else {
            //     // console.log('Cache Hit:');
            // }

            return res.status(200).json({
                success: true,
                message: `Product - ${product.name}`,
                product
            });
        } else {
            // Get all products with caching
            const cacheKey = 'all_products';
            let allProducts = productCache.get(cacheKey);

            // console.log('Cache Check:');

            if (!allProducts) {
                allProducts = await ProductModel.find().populate('clothCategory featuredCategory');
                productCache.set(cacheKey, allProducts);
                // console.log('Cache Set:');
            } 
            // else {
            //     console.log('Cache Hit:');
            // }

            return res.status(200).json({
                totalProducts: allProducts.length,
                success: true,
                message: 'All products',
                allProducts
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error while getting all products',
            error: error.message || error
        })
    }
};

// Get Single Product
// const getSingleProducts = async (req, res) => {
//     try {
//         const { prodId } = req.params
//         const product = await ProductModel.findById(prodId)

//         res.status(200).json({
//             success: true,
//             message: `Product - ${product.productName}`,
//             product
//         })

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error while getting all products',
//             error: error.message || error
//         })
//     }
// };

// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { prodId } = req.params;

        await ProductModel.findByIdAndDelete(prodId);

        // Invalidate the cache for the deleted product
        // productCache.del(`product_${prodId}`);
        productCache.del('all_products');

        res.status(200).send({
            success: true,
            message: 'Product deleted successfully'
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while Product delete",
            error: error.message || error
        })
    }
};

export {createProduct, updateProduct, getAllProducts, deleteProduct}