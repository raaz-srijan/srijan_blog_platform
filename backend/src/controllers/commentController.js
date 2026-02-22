const Comment = require("../models/commentSchema");
const Blog = require("../models/blogSchema");

async function addComment(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const { blogId, content, parentCommentId } = req.body;

        if (!blogId) return res.status(400).json({ success: false, message: "Blog ID is required" });
        if (!content || !content.trim()) return res.status(400).json({ success: false, message: "Comment content cannot be empty" });

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Invalid blog id" });

        const newComment = await Comment.create({
            userId,
            blogId,
            content: content.trim(),
            parentCommentId: parentCommentId || null
        });

        return res.status(201).json({ success: true, message: "Comment added successfully", comment: newComment });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchComments(req, res) {
    try {
        const { blogId } = req.params;
        if (!blogId) return res.status(400).json({ success: false, message: "Blog ID is required" });

        const comments = await Comment.find({ blogId })
            .populate("userId", "name email")
            .sort({ createdAt: 1 });

        const commentMap = {};
        const roots = [];

        comments.forEach(c => {
            commentMap[c._id] = { ...c.toObject(), replies: [] };
        });

        comments.forEach(c => {
            if (c.parentCommentId) {
                const parent = commentMap[c.parentCommentId];
                if (parent) parent.replies.push(commentMap[c._id]);
            } else {
                roots.push(commentMap[c._id]);
            }
        });

        return res.status(200).json({ success: true, count: roots.length, comments: roots });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deleteComment(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(403).json({ success: false, message: "Login first" });

        const { commentId } = req.params;
        if (!commentId) return res.status(400).json({ success: false, message: "Comment ID is required" });

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this comment" });
        }

        await Comment.deleteMany({ $or: [{ _id: commentId }, { parentCommentId: commentId }] });

        return res.status(200).json({ success: true, message: "Comment deleted successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = { addComment, fetchComments, deleteComment };