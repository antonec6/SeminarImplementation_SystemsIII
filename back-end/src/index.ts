import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import usersRouter from "./routes/users.routes.js";
import foodListingRouter from "./routes/food_listing.routes.js";

const app = express();
const port = Number(process.env.PORT) || 30096;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from Renourish API");
});


app.use("/users", usersRouter);        
app.use("/food-listings", foodListingRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});