import { Request, Response, NextFunction, Router } from "express";
import { createRating, checkAlreadyRated } from "../db/database.js";

const router = Router();

/* =========================================================
   CONTROLLER ROUTE HANDLER
   ========================================================= */

const submitRating = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { score, comment, food_listing_id, from_user_id, to_user_id } = req.body;

    // Validate essential database constraint rules
    if (!score || isNaN(Number(score)) || !food_listing_id || !from_user_id || !to_user_id) {
      res.status(400).json({ success: false, message: "Missing required rating fields." });
      return;
    }

    // Lock transaction rules: prevent user from duplicate feedback actions
    const alreadyRated = await checkAlreadyRated(Number(food_listing_id), Number(from_user_id));
    if (alreadyRated) {
      res.status(400).json({ success: false, message: "You have already submitted a rating for this food item." });
      return;
    }

    // Save record passing your schema parameters cleanly
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

/* =========================================================
   EXPRESS SERVER ROUTE ATTACHMENTS
   ========================================================= */
router.post("/", submitRating);

export default router;