import mongoose from 'mongoose';
import { type } from 'os';

const { Schema } = mongoose;

const timerSchema = new Schema({
    // the parentType field is used to determine the model the parent is in
    parentType: {
        type: String,
        enum: ['StudySession', 'Challenge', 'GroupStudy'],
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // tells what model to find the id in 
        refPath: 'parentType'
    },
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
    isPaused :{
        type: Boolean,
        default: false
    },
    currentBreak :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Break',
        default: null
    },
    finished: {
        type: Boolean,
        default: false
    },
});

const Timer = mongoose.model('Timer', timerSchema);

export default Timer;