require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT;
const connectDb = require("./config/connectDb");
const connectCloudinary = require("./config/cloudinaryConnect");

const userRoute = require("./routes/userRoute");
const blogRoute = require("./routes/blogRoute");
const likeRoute = require("./routes/likeRoute");
const commentRoute = require("./routes/commentRoute");
const roleRoute = require("./routes/roleRoute");
const permissionRoute = require("./routes/permissionRoute");
const { apiLimiter } = require("./middlewares/rateLimiter");

// Apply the general API limiter globally to all API routes
app.use("/api", apiLimiter);

app.use("/api/v1/auth", userRoute);
app.use("/api/v1/blogs", blogRoute);
app.use("/api/v1/blogs/:blogId/like", likeRoute);
app.use("/api/v1/blogs/:blogId/comments", commentRoute);
app.use("/api/v1/comments", commentRoute);
app.use("/api/v1/roles", roleRoute);
app.use("/api/v1/permissions", permissionRoute);


app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);
  await connectDb();
  await connectCloudinary();
});