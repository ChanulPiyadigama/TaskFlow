import mongoose from 'mongoose';

const { Schema } = mongoose;

//breaks could be started but not finished if the user closes the app
const breakSchema = new Schema({
    pausedTime: {
        type: Date,
        required: true
    },
    resumedTime: {
        type: Date,
    },
    elapsedTime: {
        type: Number,
    },
    timer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timer',
        required: true
    }
});

const Break = mongoose.model('Break', breakSchema);

export default Break;