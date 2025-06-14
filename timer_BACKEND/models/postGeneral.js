import mongoose from 'mongoose';
import { BasePost } from './BasePost.js';

//child of post interface, meaning it will be stored in the same collection as the basePost schema
const generalPostSchema = new mongoose.Schema({

    category: {
        type: String,
        enum: ['announcement', 'discussion', 'question', 'misc'],
        required: true,
    }
});

export const GeneralPost = BasePost.discriminator('GeneralPost', generalPostSchema);