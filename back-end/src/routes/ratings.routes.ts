import { Request, Response, NextFunction, Router } from "express";
import { createRating, checkAlreadyRated, getReviewsByUserId} from "../db/database.js";

const router = Router();

const submitRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { score, comment, food_listing_id, from_user_id, to_user_id } = req.body;

    if (!score || isNaN(Number(score)) || !food_listing_id || !from_user_id || !to_user_id) {
      res.status(400).json({ success: false, message: "Missing required rating fields." });
      return;
    }

    const alreadyRated = await checkAlreadyRated(Number(food_listing_id), Number(from_user_id));
    if (alreadyRated) {
      res.status(400).json({ success: false, message: "You have already submitted a rating for this food item." });
      return;
    }

    await createRating(
      Number(score),
      comment || null,
      Number(food_listing_id),
      Number(from_user_id),
      Number(to_user_id)
    );

    res.status(201).json({
      success: true,
      message: "Rating successfully registered to database."
    });
  } catch (error) {
    next(error);
  }
};

const getUserReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID format." });
      return;
    }

    const reviewsRows = await getReviewsByUserId(userId);

    res.status(200).json(reviewsRows);
  } catch (error) {
    next(error);
  }
};



router.post("/", submitRating);
router.get("/user/:userId", getUserReviews);

export default router;