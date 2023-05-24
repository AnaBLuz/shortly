import { Router } from "express";
import { shortenUrl, findURLById, getShortURL, deleteURL, usersMe, getRanking} from '../controllers/urls.controllers.js'
import { authorization } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { urlSchema } from "../schemas/links.schema.js";

const linksRouter = Router();

linksRouter.post("/urls/shorten", validateSchema(urlSchema),authorization,shortenUrl);
linksRouter.get("/urls/:id", findURLById);
linksRouter.get("/urls/open/:shortUrl", getShortURL);
linksRouter.delete("/urls/:id", authorization,deleteURL);
linksRouter.get("/users/me", authorization,usersMe );
linksRouter.get("/ranking", getRanking);

export default linksRouter;