import { Router } from "express";
import { shortUrl, getURLById, getShortURL, deleteURL, usersMe, ranking} from '../controllers/urls.controllers.js'
import { authorization } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { urlSchema } from "../schemas/links.schema.js";

const linksRouter = Router();

linksRouter.post("/urls/shorten", validateSchema(urlSchema),authorization,shortUrl);
linksRouter.get("/urls/:id", getURLById);
linksRouter.get("/urls/open/:shortUrl", getShortURL);
linksRouter.delete("/urls/:id", authorization,deleteURL);
linksRouter.get("/users/me", authorization,usersMe );
linksRouter.get("/ranking", ranking);

export default linksRouter;