const express = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: String,
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, {
    timestamps: true
});

const tagSchema = new mongoose.Schema({
    id: String,
}, {
    timestamps: true
});

const postSchema = new mongoose.Schema({
    id: String,
    title: String,
    description: String,
    imgUrl: String,
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    likes: { type: Number, default: 0 },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
const Tag = mongoose.model('Tag', tagSchema);
const Post = mongoose.model('Post', postSchema);

const app = express();
const port = 3002;

app.get('/api/hot', async (req, res) => {
    try {
        const { limit, start } = req.query;
        if (start) {
            const hotPosts = await Post.find({ likes: { $gte: 5 } })
                .sort({ likes: -1, createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(start));
            return res.json(hotPosts);
        } else {
            hotPosts = await Post.find({ likes: { $gte: 5 } })
                .sort({ likes: -1, createdAt: -1 })
                .limit(parseInt(limit));
        }

    } catch (e) {
        console.log(e.message);
        return res.status(500).json("Problem in fetching hot posts");
    }
});

app.get('/api/recent', async (req, res) => {
    try {
        const { limit, start } = req.query;
        var recentPosts = [];
        if (start) {
            recentPosts = await Post.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(start));

        } else {
            recentPosts = await Post.find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
        }
        return res.json(recentPosts);
    } catch (e) {
        console.log(e.message);
        return res.status(500).json("Problem in fetching recent posts");
    }
});

app.get('/api/following', async (req, res) => {
    try {
        const { limit, start } = req.query;
        var followingPosts = [];
        const userId = req.query.userId;
        const user = await User.findById(userId);
        if (start) {

            followingPosts = await Post.find({
                $and: [
                    { author: { $in: user.following } },
                    { likes: { $gte: 50 } },
                ]
            })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(start));
        } else {
            followingPosts = await Post.find({
                $and: [
                    { author: { $in: user.following } },
                    { likes: { $gte: 50 } },
                ]
            })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
        }
        return res.json(followingPosts);
    } catch (e) {
        console.log(e.message);
        return res.status(500).json("unable to follow the posts");
    }
});

app.post('/api/tags', async (req, res) => {
    try {
        const { tag } = req.body;
        const newTag = new Tag({ id: tag });
        await newTag.save();
        return res.json(newTag);
    } catch (e) {
        console.log(e.message);
        return res.status(500).json("Unable to create the post");
    }
});


app.listen(port, () => {
    print(`Server is running on port ${port}`);
});
