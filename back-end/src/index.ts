import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import usersRouter from "./routes/users.routes.js";
import foodListingRouter from "./routes/food_listing.routes.js";
import requestsRouter from "./routes/requests.routes.js";
import messagesRouter from "./routes/messages.routes.js";
import ratingsRouter from "./routes/ratings.routes.js";
import cors from "cors";
import path from "path";

const app = express();
const port = Number(process.env.PORT) || 30096;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(process.cwd(), "dist", "frontend-build")));

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "dist", "frontend-build", "index.html"));
});


app.use("/users", usersRouter);        
app.use("/food-listings", foodListingRouter);
app.use("/requests", requestsRouter);
app.use("/messages", messagesRouter);
app.use("/ratings", ratingsRouter);

/* app.get("(.*)", (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "dist", "frontend-build", "index.html"));
}); */

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});