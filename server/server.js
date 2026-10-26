

import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

if(!process.env.JWT_SECRET) {
    console.log("JWT_SECRET is missing in the server .env file");
    process.exit(1);
}

connectDB();

const port = process.env.PORT || 3001

app.listen(port, ()=> {
    console.log(`Server is running on ${port}`);
});
