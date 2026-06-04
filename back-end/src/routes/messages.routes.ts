import { Request, Response, NextFunction, Router } from "express";
import { createMessage, getPrivateMessages } from "../db/database.js";

const router = Router();

/* =========================================================
   CONTROLLER FUNCTIONS
   ========================================================= */

// Fetch historical message logs filtered strictly by listing and buyer context rules
const fetchChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = Number(req.query.listingId);
    const buyerId = Number(req.query.buyerId);

    // Validate essential composite channel parameters
    if (isNaN(listingId) || isNaN(buyerId)) {
      res.status(400).json({
        success: false,
        message: "Valid listingId and buyerId query parameters are required.",
      });
      return;
    }

    // Call updated database filter matching seller and current requester context
    const chatHistory = await getPrivateMessages(listingId, buyerId);

    res.status(200).json(chatHistory);
  } catch (error) {
    next(error);
  }
};

// Send a new private message inside a specific listing context stream
const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, user_id, food_listing_id } = req.body;

    if (!content || content.trim() === "" || isNaN(Number(user_id)) || isNaN(Number(food_listing_id))) {
      res.status(400).json({
        success: false,
        message: "Missing content, user_id, or food_listing_id parameters.",
      });
      return;
    }

    await createMessage(content.trim(), Number(user_id), Number(food_listing_id));

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   EXPRESS ROUTER ATTACHMENTS
   ========================================================= */
router.get("/", fetchChatHistory);
router.post("/", sendMessage);

export default router;