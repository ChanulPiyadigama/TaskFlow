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
    timers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timer',
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
    }]
});

const User = mongoose.model('User', userSchema);

export default User;
