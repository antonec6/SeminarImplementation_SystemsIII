import { Router, Request, Response, NextFunction } from "express";
import { 
  allFoodListings, 
  foodListingById, 
  createFoodListing, 
  deleteFoodListing, 
  updateFoodListing,
  getRequestersByListing
} from "../db/database.js";

const router = Router();

const getFoodListings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // FIXED: Invoking allFoodListings which now carries the active relational request_id tokens
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
    const imageUrl = req.body.image_url?.trim();
    const userId = Number(req.body.user_id);

    if (!title || isNaN(quantity) || isNaN(userId)) {
      res.status(400).json({ 
        success: false, 
        message: "Title, valid quantity and user_id are required." 
      });
      return;
    }

    const queryResult = await createFoodListing(title, description, dietaryDetails, quantity, expirationDate, imageUrl, userId);
    
    if (queryResult.affectedRows === 1) {
      res.status(201).json({ success: true, message: "Food listing published successfully!" });
      return;
    }
    
    res.status(500).json({ success: false, message: "Error creating food listing." });
  } catch (error) {
    next(error);
  }
};

const removeFoodListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = Number(req.params.id);

    if (isNaN(listingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid food listing ID.",
      });
      return;
    }

    const queryResult = await deleteFoodListing(listingId);

    if (queryResult.affectedRows === 1) {
      res.status(200).json({
        success: true,
        message: "Food listing deleted successfully.",
      });
      return;
    }

    res.status(404).json({
      success: false,
      message: "Food listing not found.",
    });
  } catch (error) {
    next(error); 
  }
};

const editFoodListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = Number(req.params.id);
    const { title, description, dietary_details, quantity, expiration_date, image_url } = req.body;

    if (isNaN(listingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid food listing ID.",
      });
      return;
    }

    const queryResult = await updateFoodListing(
      listingId,
      title?.trim(),
      description?.trim(),
      dietary_details?.trim(),
      Number(quantity),
      expiration_date,
      image_url?.trim()
    );

    if (queryResult.affectedRows === 1) {
      res.status(200).json({
        success: true,
        message: "Food listing updated successfully.",
      });
      return;
    }

    res.status(404).json({
      success: false,
      message: "Food listing not found.",
    });
  } catch (error) {
    next(error);
  }
};

const fetchListingChatsMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = Number(req.params.id);

    if (isNaN(listingId)) {
      res.status(400).json({
        success: false,
        message: "A valid food listing ID parameter is required.",
      });
      return;
    }

    const activeChats = await getRequestersByListing(listingId);
    res.status(200).json(activeChats);
  } catch (error) {
    next(error);
  }
};


router.get("/", getFoodListings);
router.get("/:id", getFoodListingById);
router.get("/:id/chats", fetchListingChatsMenu);
router.post("/", postFoodListing);
router.put("/:id", editFoodListing);
router.delete("/:id", removeFoodListing);

export default router;