require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const connectDb = require("./config/connectDb");
const userRoute = require("./routes/userRoute");
const connectCloudinary = require("./config/cloudinaryConnect");

app.use("/api/v1/auth", userRoute);

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
  connectDb();
  connectCloudinary();
});
