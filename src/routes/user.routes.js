import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userSchema, sessionSchema } from "../schemas/user.schemas.js";
import { signUpUser, SignInUser, logout, getInfosUser, ranking } from "../controllers/user.controllers.js";
import { authorization } from "../middlewares/auth.middleware.js";



const userRouter = Router();

userRouter.post("/signup", validateSchema(userSchema), signUpUser);
userRouter.post("/signin",validateSchema(sessionSchema), SignInUser);
userRouter.get("/logout", authorization, logout);
userRouter.get("/users/me", authorization, getInfosUser);
userRouter.get("/ranking", ranking);


export default userRouter;