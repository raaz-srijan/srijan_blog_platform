const Blog = require("../models/blogSchema");
const { uploadImage, deleteImagefromCloudinary } = require("../utils/uploadImage");

async function addBlog(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(403).json({ success: false, message: "Login first" });

        const { title, content, draft, tags } = req.body;
        if (!title || !title.trim())
            return res.status(400).json({ success: false, message: "Post should have a title" });

        let imagesData = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadImage(file.path);
                imagesData.push({ url: result.secure_url, public_id: result.public_id });
            }
        }

        const parsedTags = tags
            ? Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim().toLowerCase())
            : [];

        const newBlog = await Blog.create({
            userId,
            title: title.trim(),
            content: content?.trim() || "",
            draft: Boolean(draft),
            tags: parsedTags,
            images: imagesData, 
        });

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: newBlog,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updateBlog(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(403).json({ success: false, message: "Login first" });

        const { blogId } = req.params;
        const { title, content, draft, tags } = req.body;

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Invalid blog id" });
        if (blog.userId.toString() !== userId)
            return res.status(403).json({ success: false, message: "You are not authorized to update this blog" });

        const updatedData = {};
        if (title) updatedData.title = title.trim();
        if (content) updatedData.content = content.trim();
        if (typeof draft !== "undefined") updatedData.draft = draft;
        if (tags) updatedData.tags = Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim().toLowerCase());

        if (req.files && req.files.length > 0) {
            if (blog.images && blog.images.length > 0) {
                for (const img of blog.images) {
                    if (img.public_id) await deleteImagefromCloudinary(img.public_id);
                }
            }

            let imagesData = [];
            for (const file of req.files) {
                const result = await uploadImage(file.path);
                imagesData.push({ url: result.secure_url, public_id: result.public_id });
            }

            updatedData.images = imagesData;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(blogId, { $set: updatedData }, { new: true });

        return res.status(200).json({ success: true, message: "Blog updated successfully", blog: updatedBlog });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deleteBlog(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const { blogId } = req.params;
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Invalid blog id" });
        if (blog.userId.toString() !== userId)
            return res.status(403).json({ success: false, message: "You are not authorized to delete this blog" });

        if (blog.images && blog.images.length > 0) {
            for (const img of blog.images) {
                if (img.public_id) await deleteImagefromCloudinary(img.public_id);
            }
        }

        await Blog.findByIdAndDelete(blogId);
        return res.status(200).json({ success: true, message: "Blog deleted successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchBlogs(req, res) {
    try {
        const blogs = await Blog.find({ draft: false }).populate("userId", "name").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: blogs.length, blogs });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchBlogById(req, res) {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId).populate("userId", "name email");
        if (!blog) return res.status(404).json({ success: false, message: "Invalid blog id" });

        if (blog.draft && blog.userId._id.toString() !== req.user?.id)
            return res.status(403).json({ success: false, message: "You are not authorized to view this blog" });

        return res.status(200).json({ success: true, blog });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchOwnedBlog(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const blogs = await Blog.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: blogs.length, blogs });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = {
    addBlog,
    updateBlog,
    deleteBlog,
    fetchBlogs,
    fetchBlogById,
    fetchOwnedBlog
};