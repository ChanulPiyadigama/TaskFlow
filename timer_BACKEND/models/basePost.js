import mongoose from "mongoose";
const { Schema } = mongoose;

//this post schema model is an interface, meaning you can use it to create its children, not itself 
//all its children will be stored in the same collection, which is this schema's collection

//all children of posts will be stored in the same collection, and be given an extra field called postType
// which stores the name of the child model using discrimator key 
const baseOptions = {
    discriminatorKey: 'postType', 
    collection: 'posts' 
};

const basePostSchema = new Schema({
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
    comments : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: []
    }]
}, baseOptions);

export const BasePost = mongoose.model('BasePost', basePostSchema);