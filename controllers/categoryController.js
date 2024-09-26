import {CategoryModel} from "../models/categoryModel.js";
import slugify from "slugify";
import NodeCache from 'node-cache';

const categoryCache = new NodeCache();

const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        if(!categoryName){
            return res.status(404).send({success: false, message: 'Name is required'})
        }

        const existingCategory = await CategoryModel.findOne({ categoryName });
        if(existingCategory){
            return res.status(404).send({success: false, message: 'Category already exists'})
        }

        const category = await new CategoryModel({ categoryName, slug: slugify(categoryName) }).save()

        categoryCache.del(`all_category_cache`);

        res
        .status(200)
        .json({
            category,
            success: true,
            message: 'Category saved successfully'
        })


    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({
            success: false, 
            message: 'Error creating category', 
            error: error 
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { categoryName } = req.body

        if(!id && !categoryName){
            return res.status(404).send({ success: false, message: 'Missing data' });
        }

        const category = await CategoryModel.findByIdAndUpdate(
            id, 
            {categoryName, slug: slugify(categoryName)},
            {new: true}
        );

        categoryCache.del(`all_category_cache`);

        res
        .status(200)
        .json({
            category, 
            success: false, 
            message: 'Category updated successfully ',
        })

    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({
            success: false, 
            message: 'Error updating category', 
            error: error 
        });
    }
};

const allCategories = async (req, res) => {
    try {
        const cacheKey = 'all_category_cache';
        let allCategory = categoryCache.get(cacheKey);

        if(!allCategory){
            allCategory = await CategoryModel.find({});
            categoryCache.set(cacheKey, allCategory)
        }

        res
        .status(200)
        .json({
            success: true,
            message: 'Category updated successfully',
            totalCategory: allCategory.length,
            allCategory,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting all category', 
            error: error 
        });
    }
};

const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params
        if(id){
            const cacheKey = `category-${id}`;
            let singleCategory = categoryCache.get(cacheKey);

            if(!singleCategory){
                singleCategory = await CategoryModel.findById(id);
                categoryCache.set(cacheKey, singleCategory);
            }

            res.status(200).json({
                singleCategory,
                success: true,
                message: 'Category found successfully'
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Error getting single category', 
            error: error 
        }); 
    }
};

const deleteCategory = async (req, res) => {
    try {
       const { id } = req.params
       await CategoryModel.findByIdAndDelete(id);

       res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
       })

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Error getting category', 
            error: error 
        });
    }
};

export {createCategory, updateCategory, allCategories, getSingleCategory, deleteCategory}