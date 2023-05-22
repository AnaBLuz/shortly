import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userSchema, sessionSchema } from "../schemas/auth.schemas.js";
import { signUpUser, SignInUser } from "../controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", validateSchema(userSchema), signUpUser);
authRouter.post("/signin",validateSchema(sessionSchema), SignInUser);

export default authRouter;