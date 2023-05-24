import { Router } from "express";
import userRouter from "./user.routes.js";
import linksRouter from "./url.routes.js";


const router = Router();

router.use(userRouter);
router.use(linksRouter);


export default router;