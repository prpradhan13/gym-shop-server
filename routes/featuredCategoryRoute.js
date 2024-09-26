import express from "express";
import {
  createFeaturedCategory,
  updateFeaturedCategory,
  allFeaturedCategories,
  getSingleFeaturedCategory,
  deleteFeaturedCategory,
} from "../controllers/featuredCategoryController.js";
import caching from "../middlewares/cachingMiddleware.js";

const router = express.Router();

// Create New Category
router.post("/newfeaturedcategory", createFeaturedCategory);

// Update Category
router.put("/updatefeaturedcategory/:id", updateFeaturedCategory);

// Get All Category
router.get("/allfeaturedcategories", caching, allFeaturedCategories);

// Get Single Category
router.get("/singlefeaturedcategory/:id", caching, getSingleFeaturedCategory);

// Delete Category
router.delete("/deletefeaturedcategory/:id", deleteFeaturedCategory);

export default router;
