import express from 'express';
import { allCategories, createCategory, deleteCategory, getSingleCategory, updateCategory } from '../controllers/categoryController.js';

const router = express.Router();

// Create New Category
router.post('/new-category', createCategory);

// Update Category
router.put('/update-category/:id', updateCategory);

// Get All Category
router.get('/all-categories', allCategories);

// Get Single Category
router.get('/single-category/:id', getSingleCategory);

// Delete Category
router.delete('/delete-category/:id', deleteCategory);

export default router;