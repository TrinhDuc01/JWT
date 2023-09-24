import express from "express";
import authController from "../controllers/authControllers";
import { middlewareController } from "../controllers/middlewareController";

const router = express.Router();

export const initRoute = (app) => {
    router.post("/register", authController.registerUser);
    router.post("/login", authController.loginUser);
    router.post("/refresh", authController.requestRefreshToken);
    router.post("/logout",middlewareController.verifyToken, authController.logoutUser);

    router.get('/', (req, res) => {
        res.send('Birds home page')
      })

    return app.use('/api/v1/auth', router);
}