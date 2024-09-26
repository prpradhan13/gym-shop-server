import express from 'express';
import { upload } from '../middlewares/multerMiddleware.js';
import { createProduct, deleteProduct, getAllProducts, updateProduct } from '../controllers/productController.js';
import caching from '../middlewares/cachingMiddleware.js';

const router = express.Router();

// Create product route
router.post('/create-product',
     upload.fields([
        {name: 'image', maxCount: 1},
        {name: 'relatedImages', maxCount: 5}
    ]), 
    createProduct
);

// Update product route
router.put('/update-product/:prodId',
    upload.fields([
        {name: 'image', maxCount: 1},
        {name: 'relatedImages', maxCount: 5}
    ]),
    updateProduct
);

// Getting All Products
router.get('/allproducts', caching, getAllProducts);

// Get Single Product
// router.get('/singleproduct/:prodId', getSingleProducts);

// Delete Single Product
router.delete('/deleteproduct/:prodId', deleteProduct);

export default router;