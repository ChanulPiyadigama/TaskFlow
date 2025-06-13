import mongoose from 'mongoose';
import { BasePost } from './BasePost.js';

//child of post interface, meaning it will be stored in the same collection as the basePost schema
const studySessionPostSchema = new mongoose.Schema({
    studySession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudySession',
        required: true
    },
    studiedTime: {
        type: Number,
        required: true
    },
    exclusions: {
        type: {
            excludeTime: {
                type: Boolean,
                default: false,
            }
        }, 
        default: {}
    },
});

export const StudySessionPost = BasePost.discriminator('StudySessionPost', studySessionPostSchema);