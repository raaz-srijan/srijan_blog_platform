const Like = require("../models/likeSchema");
const Blog = require("../models/blogSchema");

async function likeBlog(req, res) {
    try {
        const userId = req.user?.id;
        const { blogId } = req.params;

        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Invalid blog id" });

        const existingLike = await Like.findOne({ userId, blogId });
        if (existingLike) return res.status(400).json({ success: false, message: "You already liked this blog" });

        await Like.create({ userId, blogId });

        blog.likesCount = blog.likesCount + 1;
        await blog.save();

        return res.status(200).json({ success: true, message: "Blog liked successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function unlikeBlog(req, res) {
    try {
        const userId = req.user?.id;
        const { blogId } = req.params;

        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const like = await Like.findOne({ userId, blogId });
        if (!like) return res.status(400).json({ success: false, message: "You have not liked this blog" });

        await like.remove();

        const blog = await Blog.findById(blogId);
        if (blog && blog.likesCount > 0) {
            blog.likesCount = blog.likesCount - 1;
            await blog.save();
        }

        return res.status(200).json({ success: true, message: "Blog unliked successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getBlogLikes(req, res) {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Invalid blog id" });

        return res.status(200).json({ success: true, likesCount: blog.likesCount });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = {
    likeBlog,
    unlikeBlog,
    getBlogLikes
};