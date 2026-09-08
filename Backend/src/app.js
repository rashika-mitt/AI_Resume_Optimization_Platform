const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// require all the routes here`
const authRouter = require("./routes/auth.route");
const interviewRouter = require("./routes/interview.routes");

// using all the routes
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;