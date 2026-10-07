import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan";
import workerRouter from "./routes/worker.route.js";
import userRouter from "./routes/user.router.js";

const app = express()


app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())


app.use("/api/v1/worker", workerRouter)
app.use("/api/v1/user", userRouter)

export default app;