import mongoose from "mongoose";

const { Schema } = mongoose;

const userPostSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastInteraction: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    postingObjType: {
        type: String,
        enum: ['StudySession', 'Challenge', 'GroupStudy'],
        required: true
    },
    postingObjId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // tells what model to find the id in 
        refPath: 'parentType'
    },
});

const UserPost = mongoose.model('UserPost', userPostSchema);

export default UserPost;