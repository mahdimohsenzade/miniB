const { validationResult } = require('express-validator');
const Post = require('../models/post');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const mongoose = require('mongoose');



exports.getPosts = async (req, res ,next) => {
    try {
        const postList = await Post.find().populate('creator', 'name');;
        res.status(200).json({
            message: 'Fetched Posts Successfully',
            posts: postList
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.createPosts = async (req, res ,next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {    
            const error = new Error('validation faild.your enterd data is invalid!');
            error.statusCode = 422;
            throw error;
        }
        if (!req.file) {
            const error = new Error('Please Upload a file');
            error.statusCode = 422;
            throw error;
        }

        const title = req.body.title;
        const content = req.body.content;

        const post = new Post({
            title: title,
            content: content,
            imageUrl: req.file.path,
            creator: req.userId
        });
        const postResult = await post.save();

        const user = await User.findById(req.userId);
        user.posts.push(postResult);
        const creator = await user.save();

        res.status(201).json({
            message: 'Post Created Successfully',
            post: postResult,
            creator:creator 
        })
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getPost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId).populate('creator');
        if (!post) {
            const error = new Error('Could Not Find Post.');
            error.statusCode = 422;
            throw error;
        }
        res.status(200).json({
            message: 'Post Fetched',
            post:post
        })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {    
            const error = new Error('validation failed. your entered data is invalid!');
            error.statusCode = 422;
            throw error;
        }

        const postId = req.params.postId;
        const title = req.body.title;
        const content = req.body.content;
        
        // ✅ اول، پست رو از دیتابیس پیدا کن
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized.you can not edit post.');
            error.statusCode = 403;
            throw error;
        }

        // ✅ حالا که post رو داری، می‌تونی ازش استفاده کنی
        let imageUrl = post.imageUrl; // نگه‌داری عکس قبلی
        
        if (req.file) {
            // اگه عکس جدید اومده، عکس قبلی رو پاک کن
            await clearImage(post.imageUrl);
            imageUrl = req.file.path;
        }

        // ✅ حالا تغییرات رو اعمال کن
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        await post.save();

        res.status(200).json({
            message: 'Post updated successfully',
            post: post
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post.');
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized.you can not deletePost');
            error.statusCode = 403;
            throw error;
        }

        clearImage(post.imageUrl);

        await Post.findByIdAndDelete(postId);

        const user = await User.findById(req.userId);
        user.posts.pull(new mongoose.Types.ObjectId(postId));  
        await user.save();

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage =async (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    if (await fs.existsSync(filePath)) {
        await fs.unlinkSync(filePath, (err) => {
            throw err;
        });
        console.log("Image deleted successfully");
    } else {
        console.log("Image not found");
    }
    
}