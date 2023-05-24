import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userSchema, sessionSchema } from "../schemas/user.schemas.js";
import { signUpUser, SignInUser } from "../controllers/user.controllers.js";

const userRouter = Router();

userRouter.post("/signup", validateSchema(userSchema), signUpUser);
userRouter.post("/signin",validateSchema(sessionSchema), SignInUser);

export default userRouter;