import { Request, Response, NextFunction, Router } from "express";
import { 
  createRequest, 
  allRequestsWithFoodDetails, 
  acceptRequestTransaction, 
  rejectRequestTransaction 
} from "../db/database.js"; // Standardized path matching your users architecture

const router = Router();

/* =========================================================
   1. CONTROLLER FUNCTIONS (IMMEDIATE ROUTE HANDLERS)
   ========================================================= */

const submitRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.body.user_id);
    const foodListingId = Number(req.body.food_listing_id);

    if (isNaN(userId) || isNaN(foodListingId)) {
      res.status(400).json({
        success: false,
        message: "Missing or invalid user_id or food_listing_id parameters.",
      });
      return;
    }

    const queryResult = await createRequest(userId, foodListingId);

    if (queryResult.affectedRows === 1) {
      res.status(201).json({
        success: true,
        message: "Food request created and listing status updated to requested.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "The food request could not be processed.",
    });
  } catch (error) {
    next(error); // Forward database errors cleanly to your index.ts handler
  }
};

const getRequests = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const requestsData = await allRequestsWithFoodDetails();

    res.status(200).json(requestsData);
  } catch (error) {
    next(error);
  }
};

const acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = Number(req.params.id);
    const foodListingId = Number(req.body.food_listing_id);

    if (isNaN(requestId) || isNaN(foodListingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid request parameters or missing food_listing_id.",
      });
      return;
    }

    // Execute safe isolated relational updates inside database.ts
    await acceptRequestTransaction(requestId, foodListingId);

    res.status(200).json({
      success: true,
      message: "Request accepted successfully. Listing status updated to reserved.",
    });
  } catch (error) {
    next(error);
  }
};

const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = Number(req.params.id);
    const foodListingId = Number(req.body.food_listing_id);

    if (isNaN(requestId) || isNaN(foodListingId)) {
      res.status(400).json({
        success: false,
        message: "Invalid request parameters or missing food_listing_id.",
      });
      return;
    }

    // Execute database operations to release the food listing back to available
    await rejectRequestTransaction(requestId, foodListingId);

    res.status(200).json({
      success: true,
      message: "Request rejected successfully. Food is available again.",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================================
   2. EXPRESS ROUTER ATTACHMENTS
   ========================================================= */

router.post("/", submitRequest);
router.get("/", getRequests);
router.patch("/:id/accept", acceptRequest);
router.patch("/:id/reject", rejectRequest);

export default router;