import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import workerRouter from "./routes/worker.route.js";
import userRouter from "./routes/user.router.js";
import jobRouter from "./routes/job.router.js";
import adminRouter from "./routes/admin.route.js";

const app = express();

// trust proxy
app.set("trust proxy", 1);

// helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// health check endponit
app.get("/health", (req, res) => {
  res.status(200).json({ status: "okk", timestamp: new Date() });
});

app.use("/api/v1/worker", workerRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/admin", adminRouter);

export default app;
