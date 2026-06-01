import { Router, Request, Response, NextFunction } from "express";
import { allFoodListings, foodListingById, createFoodListing } from "../db/database.js";

const router = Router();

const getAllFoodListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listings = await allFoodListings(); 
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

const getFoodListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Wrong id format." });
      return;
    }

    const queryResult = await foodListingById(id);
    if (queryResult.length === 0) {
      res.status(404).json({ success: false, message: "Food listing not found." });
      return;
    }

    res.status(200).json(queryResult[0]);
  } catch (error) {
    next(error);
  }
};


const postFoodListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    const dietaryDetails = req.body.dietary_details?.trim();
    const quantity = Number(req.body.quantity);
    const expirationDate = req.body.expiration_date;
    const userId = Number(req.body.user_id);

    if (!title || isNaN(quantity) || isNaN(userId)) {
      res.status(400).json({ 
        success: false, 
        message: "Title, valid quantity and user_id are required." 
      });
      return;
    }

    const queryResult = await createFoodListing(title, description, dietaryDetails, quantity, expirationDate, userId);
    
    if (queryResult.affectedRows === 1) {
      res.status(201).json({ success: true, message: "Food listing published successfully!" });
      return;
    }
    
    res.status(500).json({ success: false, message: "Error creating food listing." });
  } catch (error) {
    next(error);
  }
};

router.get("/", getAllFoodListings);
router.get("/:id", getFoodListingById);
router.post("/", postFoodListing);

export default router;