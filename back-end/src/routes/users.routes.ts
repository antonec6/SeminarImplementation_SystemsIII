import { Request, Response, NextFunction, Router } from "express";
import bcrypt from "bcrypt";
import { createUser, authUser, deleteUser, updateUser} from "../db/database.js";

const router = Router();

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const firstName = req.body.first_name?.trim();
    const lastName = req.body.last_name?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const queryResult = await createUser(firstName, lastName, email, hashedPassword);

    if (queryResult.affectedRows === 1) {
      res.status(201).json({
        success: true,
        message: "User registered successfully.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "User was not registered.",
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const queryResult = await authUser(email);

    if (queryResult.length === 0) {
      res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
      return;
    }

    const user = queryResult[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
      return;
    }

    const queryResult = await deleteUser(userId);

    if (queryResult.affectedRows === 1) {
      res.status(200).json({
        success: true,
        message: "User account deleted successfully.",
      });
      return;
    }

    res.status(404).json({
      success: false,
      message: "User not found.",
    });
  } catch (error) {
    next(error); 
  }
};

const editUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    const firstName = req.body.first_name?.trim();
    const lastName = req.body.last_name?.trim();
    const email = req.body.email?.trim();

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format.",
      });
      return;
    }

    if (!firstName || !lastName || !email) {
      res.status(400).json({
        success: false,
        message: "First name, last name and email are required to update your profile.",
      });
      return;
    }

    const queryResult = await updateUser(firstName, lastName, email, userId);

    if (queryResult.affectedRows === 1) {
      res.status(200).json({
        success: true,
        message: "Profile updated successfully!",
      });
      return;
    }

    res.status(404).json({
      success: false,
      message: "User not found.",
    });
  } catch (error) {
    next(error);
  }
};

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/:id", editUser);
router.delete("/:id", removeUser);

export default router;