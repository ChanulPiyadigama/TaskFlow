import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    studySessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudySession',
        default: []
    }],
    allPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BasePost',
        default: []
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    
    incomingFriendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [] 
    }],
    outgoingFriendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [] 
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: []
    }],
    likedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BasePost',
        default: []
    }]
});

const User = mongoose.model('User', userSchema);

export default User;
