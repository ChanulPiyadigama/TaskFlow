import mongoose from 'mongoose';
import { type } from 'os';

const { Schema } = mongoose;

const timerSchema = new Schema({
    totalTime: {
        type: Number,
        required: true
    },
    timeLeft: {
        type: Number,
        required: true,
    },
    startTime: {
        type: Date,
        required: true
    },
    log: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Break',
        default: []
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPaused :{
        type: Boolean,
        default: false
    },
    currentBreak :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Break',
        default: null
    }
});

timerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Timer = mongoose.model('Timer', timerSchema);

export default Timer;