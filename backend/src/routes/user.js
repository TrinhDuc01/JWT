import express from "express";
import userController from "../controllers/userController";
import { middlewareController } from "../controllers/middlewareController";

const router = express.Router();

export const initRouterUser = (app) => {
    //get all user
    router.get("/", middlewareController.verifyToken ,userController.getAllUsers)
    //delete user
    router.delete("/delete/:id", middlewareController.verifyTokenAndAdminAuth, userController.deleteUser)
    
    
    router.get("/test",userController.test)

    return app.use("/api/v1/user",router)
}