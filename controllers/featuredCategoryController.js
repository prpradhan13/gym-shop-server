import slugify from "slugify";
import { FeaturedCategoryModel } from "../models/featuredCategory.js";
import NodeCache from 'node-cache';

const featuredCategoryCache = new NodeCache();

const createFeaturedCategory = async (req, res) => {
    try {
        const { name, featuredGender, isFeatured } = req.body;
        if(!name && !featuredGender){
            return res.status(404).send({success: false, message: 'FeaturedCategory Name and gender is required'})
        }

        const featuredCategory = await new FeaturedCategoryModel({ name, slug: slugify(name), featuredGender, isFeatured }).save()

        featuredCategoryCache.del(`all_featured_categories`);

        res
        .status(200)
        .json({
            featuredCategory,
            success: true,
            message: 'FeaturedCategory saved successfully'
        })


    } catch (error) {
        console.log(error);
        res
        .status(500)
        .json({
            success: false, 
            message: 'Error creating featuredCategory', 
            error: error 
        });
    }
};

const updateFeaturedCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, featuredGender, isFeatured } = req.body

        if(!id && !name && !featuredGender){
            return res.status(404).send({ success: false, message: 'Missing data' });
        }

        const featuredCategory = await FeaturedCategoryModel.findByIdAndUpdate(
            id, 
            {name, slug: slugify(name), featuredGender, isFeatured},
            {new: true}
        );

        featuredCategoryCache.del(`all_featured_categories`);
        
        res
        .status(200)
        .json({
            featuredCategory,
            success: true, 
            message: 'FeaturedCategory updated successfully ',
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

const allFeaturedCategories = async (req, res) => {
    try {
        // Get all_featured_categories with caching
        const cacheKey = 'all_featured_categories';
        let allFeaturedCategory = featuredCategoryCache.get(cacheKey);

        if(!allFeaturedCategory){
            allFeaturedCategory = await FeaturedCategoryModel.find({})
            featuredCategoryCache.set(cacheKey, allFeaturedCategory)
        }

        res
        .status(200)
        .json({
            success: true,
            message: 'FeaturedCategory All data',
            totalCategory: allFeaturedCategory.length,
            allFeaturedCategory,
        });

    } catch (error) {
        console.log(error);
        
        res.status(500).json({
            success: false,
            message: 'Error getting all category', 
            error: error.message
        });
    }
};

const getSingleFeaturedCategory = async (req, res) => {
    try {
        const { id } = req.params
        if(id){
            const cacheKey = `featuredCategory-${id}`;
            let singleFeatured = featuredCategoryCache.get(cacheKey);

            if(!singleFeatured){
                singleFeatured = await FeaturedCategoryModel.findById(id);
                featuredCategoryCache.set(cacheKey, singleFeatured)
            }

            res.status(200).json({
                singleFeatured,
                success: true,
                message: 'SingleFeaturedCategory found successfully'
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

const deleteFeaturedCategory = async (req, res) => {
    try {
       const { id } = req.params
       await FeaturedCategoryModel.findByIdAndDelete(id);

       featuredCategoryCache.del(`all_featured_categories`);

       res.status(200).json({
        success: true,
        message: 'FeaturedCategory deleted successfully'
       })

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Error getting category', 
            error: error 
        });
    }
};

export {createFeaturedCategory, updateFeaturedCategory, allFeaturedCategories, getSingleFeaturedCategory, deleteFeaturedCategory}