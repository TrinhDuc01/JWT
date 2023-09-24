import express from "express";
import dotenv, { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"
import { initRoute } from "./routes/auth";
import { initRouterUser } from "./routes/user";

config();
const app = express();
const port = process.env.PORT || 3002

app.use(cors());
app.use(cookieParser());
app.use(express.json());


//routes

initRoute(app);
initRouterUser(app);

app.listen(port, ()=>console.log(`Server dang chay tai port ${port}`))