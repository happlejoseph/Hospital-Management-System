

import express from "express";
import cors from "cors";
import authRouters from "./routes/authRouters.js";

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRouters)



export default app;
