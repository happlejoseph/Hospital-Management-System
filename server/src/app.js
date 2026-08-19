

import express from "express";
import cors from "cors";
import authRouters from "./routes/authRouters.js";
import userRoutes  from "./routes/userRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRouters);
app.use('/api/users', userRoutes);



export default app;
