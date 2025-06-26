import User from "./models/User.js";
import Timer from "./models/Timer.js";
import Break from "./models/Break.js";
import Comment from "./models/Comment.js";
import StudySession from "./models/StudySession.js";
import { GeneralPost } from "./models/postGeneral.js";
import { BasePost } from "./models/BasePost.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET } from "./util/config.js";
import mongoose from "mongoose";
import { sendPasswordResetEmail } from './Services/emailService.js';
import crypto from 'crypto';

import { createTimer, deletePostByIdUtil } from "./resolverUtils/resolverutils.js";
import { deleteStudySessionByIdUtil } from "./resolverUtils/resolverutils.js";
import { StudySessionPost } from "./models/postStudySession.js";


const resolvers = {
    //helps graphql know what children type a document is within the post collection, for certain queries
    BasePost: {
        __resolveType(post) {
            if (post.postType === 'StudySessionPost') return 'StudySessionPost';
            if (post.postType === 'GeneralPost') return 'GeneralPost';
            return null;
        },
    },


    Query: {
        //grabs objs from db and returns them
        allTimers: async () => {
            return await Timer.find({});
        },
        allUsers: async () => {
            return await User.find({});
        },
        allBreaks: async () => {
            return await Break.find({});
        },
        findUser: async (parent, args) => {
            return await User.findById(args.id);
        },
        findTimer: async (parent, args) => {
            return await Timer.findById(args.id);
        },
        findBreak: async (parent, args) => {
            return await Break.findById(args.id);
        },
        getUserTimers: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view your timers');
            }
            
            //check if user is in our db
            const user = await User.findById(context.currentUser.id);
            if (!user) {
                throw new Error('No user found');
            }

            //find all timers that belong to user, populate necessary fields, not user since the client already knows
            //the user information from the token
            const timers = await Timer.find({ user: user._id }).populate(['log', 'currentBreak']);
            return timers
        },
        getUserIncomingFriendRequests: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view incoming friend requests');
            }

            const user = await context.currentUser.populate('incomingFriendRequests');
            return user.incomingFriendRequests
        },
        getUserOutgoingFriendRequests: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view outgoing friend requests');
            }

            const user = await context.currentUser.populate('outgoingFriendRequests');
            return user.outgoingFriendRequests
        },
        getUserFriends: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view your friends');
            }
            //wait to popoulate friends
            const user = await context.currentUser.populate('friends')
            return user.friends
            
        },
        getSpecificTimer: async (parent, args, context) => {
            const timer = await Timer.findById(args.timerID);
            if (!timer) {
                throw new Error('No timer found');
            }
            const populatedTimer = await timer.populate(['log', 'currentBreak']);
            return populatedTimer
        },
        getSpecificStudySession: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view a study session');
            }

            const studySession = await StudySession.findById(args.studySessionID);
            if (!studySession) {
                throw new Error('No study session found');
            }

            const populatedStudySession = await studySession.populate([
                {
                    path: 'timer',
                    populate: [
                        { path: 'log' },       
                        { path: 'currentBreak' }  
                    ]
                },
                {
                    path: 'postedID'
                }
            ]);

            return populatedStudySession
        },
        getUserStudySessions: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view your study sessions');
            }
        
            const studySessions = await StudySession.find({ user: context.currentUser.id });
            
            // Use Promise.all since map will return an array of promises, no point using await inside map is await unaware
            const populatedStudySessions = await Promise.all(
                studySessions.map(studySession =>
                    studySession.populate([
                        {
                            path: 'timer',
                            populate: [
                                { path: 'log' },
                                { path: 'currentBreak' }
                            ]
                        },
                        {
                            path: 'postedID'
                        }
                    ])
                )
            );
            
        
            return populatedStudySessions;
        },

        getUserFriendsPosts: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view your friends posts');
            }
            console.log(context.currentUser)
            const friendIds = context.currentUser.friends 

            if (friendIds.length === 0) {
                return []; // No friends, return an empty array
            }
            
            //also grab user's own posts, so we can display them in the feed
            const userIds = [...friendIds, context.currentUser.id];

            const query = {user : {$in: userIds} };
            

            if (args.cursor) {
                //decode the base64 cursor string to original UNIX timestamp, which 
                //is conv to Date for filtering
                const decodedString = Buffer.from(args.cursor, 'base64').toString();
                const decodedTime = new Date(Number(decodedString));
                query.createdAt = { $lt: decodedTime };
            }

            
            const allFriendsPosts = await BasePost.find(query) 
            .populate(['user', 'comments', 'likes'])
            .sort({ createdAt: -1 })
            .limit(args.limit)
            return allFriendsPosts;
        },
        searchUsers: async (parent, args, context) => {

            const regex = new RegExp(args.query, 'i'); // Case-insensitive regex
            const users = await User.find({ username: regex }).limit(10); // Limit to 10 results
            
            return users 
        },
        getUserInfoById: async (parent, args, context) => {
            const user = await User.findById(args.userID)
            if (!user) {
                throw new Error('No user found');
            }

            const populatedUser = await user.populate([
                {
                    path: 'allPosts',
                    populate: [
                        {
                            path: 'likes',
                            select: 'id'
                        },
                        {
                            path: 'comments',
                            select: 'id content createdAt lastInteraction'
                        }
                    ]
                },
                {
                    path: 'friends',
                    select: 'id email name username'
                },
                {
                    path: 'likedPosts',
                    select: 'id'
                },
                {
                    path: 'studySessions',
                    select: 'id description createdAt lastInteraction studiedTime title',
                    populate: {
                        path: 'postedID',
                        select: 'id'
                    }
                }
            ]);
            
            return populatedUser;
        },
        getPostCommentsById: async (parent, args, context) => {
            const post = await BasePost.findById(args.postID)
            if (!post) {
                throw new Error('No post found');
            }
            //change here as you wish to populate other fields, for now we just want the comments
            const populatedPost = await post.populate({
                path: 'comments',
                populate: {
                    path: 'user'
                }
            })
            return populatedPost;
        },
        getUserPosts: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to view your posts');
            }

            // Build the query object
            const query = { user: context.currentUser.id };
            
            if (args.cursor) {
                // Decode the base64 cursor string to original UNIX timestamp
                const decodedString = Buffer.from(args.cursor, 'base64').toString();
                const decodedTime = new Date(Number(decodedString));
                query.createdAt = { $lt: decodedTime };
            }

            // Query posts directly from BasePost collection
            const userPosts = await BasePost.find(query)
                .populate([
                    'user',
                    'likes',
                    {
                        path: 'comments',
                        populate: {
                            path: 'user'
                        }
                    },
                    'studySession'
                ])
                .sort({ createdAt: -1 })  // Sort by newest first
                .limit(args.limit || 10); // Default limit of 10

            return userPosts;
        },
        getPostById: async (parent, args, context) => {
            const post = await BasePost.findById(args.postID);
            if (!post) {
                throw new Error('No post found');
            }
            //populate the post with likes and comments
            const populatedPost = await post.populate(['likes', 'comments','user']);
            return populatedPost;
        }
    },

    Mutation: {
        //creates a user, saves to db where details are checked by mongoose schema, then returns a token containing user details
        //which can be decoded on client side to get user details
        createUser: async (parent, args) => {
            // Input validation
            if (!args.username || !args.password || !args.name || !args.email) {
                throw new Error('All fields (username, password, name, email) are required');
            }

            // Username validation
            if (args.username.length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }

            if (args.username.length > 20) {
                throw new Error('Username must be no more than 20 characters long');
            }

            // Only allow alphanumeric characters and underscores for username
            if (!/^[a-zA-Z0-9_]+$/.test(args.username)) {
                throw new Error('Username can only contain letters, numbers, and underscores');
            }

            // Password validation
            if (args.password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Email validation (basic regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(args.email)) {
                throw new Error('Please provide a valid email address');
            }

            try {
                // Check if username already exists (case-insensitive)
                const existingUserByUsername = await User.findOne({ 
                    username: { $regex: new RegExp(`^${args.username}$`, 'i') } 
                });
                
                if (existingUserByUsername) {
                    throw new Error('Username is already taken');
                }

                // Check if email already exists (case-insensitive)
                const existingUserByEmail = await User.findOne({ 
                    email: { $regex: new RegExp(`^${args.email}$`, 'i') } 
                });
                
                if (existingUserByEmail) {
                    throw new Error('Email is already in use');
                }

                // Hash password
                const saltRounds = 10;
                const passwordHash = await bcrypt.hash(args.password, saltRounds);

                // Create user with normalized data
                const user = new User({
                    username: args.username.toLowerCase(), // Store username in lowercase
                    password: passwordHash,
                    name: args.name.trim(),
                    email: args.email.toLowerCase().trim() // Store email in lowercase
                });

                await user.save();
                
                // Create JWT token
                const token = jwt.sign(
                    { 
                        id: user._id, 
                        username: user.username, 
                        name: user.name,
                        email: user.email  
                    },
                    SECRET,
                    { expiresIn: '1h' }
                );

                return token;

            } catch (error) {
                // Handle MongoDB validation errors
                if (error.name === 'ValidationError') {
                    const messages = Object.values(error.errors).map(err => err.message);
                    throw new Error(`Validation error: ${messages.join(', ')}`);
                }

                // Handle MongoDB duplicate key errors (if you have unique indexes)
                if (error.code === 11000) {
                    const field = Object.keys(error.keyPattern)[0];
                    throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`);
                }

                // Re-throw our custom errors
                if (error.message.includes('Username is already taken') || 
                    error.message.includes('Email is already in use') ||
                    error.message.includes('must be at least') ||
                    error.message.includes('valid email') ||
                    error.message.includes('required')) {
                    throw error;
                }

                // Generic error for unexpected issues
                console.error('Error creating user:', error);
                throw new Error('Failed to create user. Please try again.');
            }
        },
        login: async (parent, args) => {
            const user = await User.findOne({ username: args.username })
            if (!user) {
              throw new Error('User not found')
            }
            
            console.log(args.username, args.password)
            const passwordValid = await bcrypt.compare(args.password, user.password)
            if (!passwordValid) {
              throw new Error('Invalid password')
            }
            
            //we sign the token with our SECRET that only this server/backend knows, meaning only the backend can create
            //these verified tokens and change them. Anyone can decode them to get the info indide, but they can't change it
            //without the SECRET, if they try the token will be invalid when being verified in the request context
            const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                name: user.name,
                email: user.email
            },
            SECRET,
            { expiresIn: '1h' }
            )
      
            return token
        },

        //if the timer is paused a break is created, but if resumed, the current break is eneded  
        handleBreak: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to handle a break');

            }

            const timer = await Timer.findById(args.timerID);
                if (!timer) {
                    throw new Error('No timer found');
                }

            if (args.isPaused) {
                //create a break for specific timer
                const newBreak = new Break({
                    pausedTime: args.timeOfChange,
                    timer: args.timerID
                });
                //save break and set it as current break for timer, then return timer
                await newBreak.save();
                timer.currentBreak = newBreak._id;
                timer.isPaused = true;
                //return timer with everything populated, including timer of the currentbreak 
                await timer.save();
                console.log("current timer" + timer)
                return await timer
                    .populate([{
                        path: 'currentBreak',
                        populate: {
                            path: 'timer', // Populate the timer field inside currentBreak
                        },
                    },'log'])


            } else {
                //special case when timer is reset and there is no current break, 
                //hopefully this is the only case where a resume is called with no break to end
                if (!timer.currentBreak) {
                    timer.isPaused = false;
                    await timer.save();
                    return await timer.populate(['log']);
                }

                //check if current break exists within that timer
                const currentBreak = await Break.findById(timer.currentBreak);
                console.log(currentBreak)
                if (!currentBreak) {
                    throw new Error('No break found');
                }
                //set resumed time and elapsed time for break, add its id to timer's log, and set current break to null, break over
                currentBreak.resumedTime = args.timeOfChange;
                currentBreak.elapsedTime = Math.round((new Date(args.timeOfChange).getTime() - 
                           new Date(currentBreak.pausedTime).getTime()) / 1000);
                await currentBreak.save();
                timer.log.push(currentBreak._id);
                timer.currentBreak = null;
                timer.isPaused = false;
                //frontend needs break objs from log to display them, so populate log with break objs
                await timer.save();
                console.log("finished timer" + timer)
                return await timer
                    .populate([{
                        path: 'currentBreak',
                        populate: {
                            path: 'timer', // Populate the timer field inside currentBreak
                        },
                    },'log'])
            }
        },
        clearBreaks: async (parent, args, context) => {
        
            try {
                // Delete all Breaks
                await Break.deleteMany({});
        
                // Update all Timers to remove logs and currentBreak references
                await Timer.updateMany({}, { $set: { log: [], currentBreak: null } });
        
                return "All breaks have been cleared successfully!";
            } catch (error) {
                console.error("Error clearing breaks:", error);
                throw new Error("Failed to clear breaks");
            }
        },
        setPause: async (parent, args, context) => {

            try {
                const timer = await Timer.findById(args.timerID);
                if (!timer) {
                    throw new Error('No timer found');
                }
                timer.isPaused = false;
                await timer.save();
                return "Timer resumed successfully";
            } catch (error) {
                console.error("Error resuming timer:", error);
                throw new Error("Failed to resume timer");
            }
        },

        //removes breaks from timer, resets values to restart a new timer 
        resetTimer: async (parent, args, context) => {

            try {
                const timer = await Timer.findById(args.timerID);
                if (!timer) {
                    throw new Error('No timer found');
                }

                //if log has breaks, we get the break ids, and provide a filter to deletemany where any
                //breaks with the id inisde the array of ids are deleted
                if(timer.log.length > 0){
                    await Break.deleteMany({ _id: { $in: timer.log.map(log => new mongoose.Types.ObjectId(log)) } });
                }
                
                //if the timer has a currentbreak, delete it in break collection 
                if(timer.currentBreak){
                    await Break.findByIdAndDelete( new mongoose.Types.ObjectId(timer.currentBreak.id))
                }
                
                timer.log = []
                timer.currentBreak = null
                timer.startTime = args.startTime
                timer.timeLeft = timer.totalTime
                timer.isPaused = true
                console.log(timer)
                return await timer.save()
            } catch (error) {
                console.error("Error resuming timer:", error);
                throw new Error("Failed to resume timer");
            }
        },
        resumeAllTimers: async (parent, args, context) => {
            try {
                // Find all timers
                const timers = await Timer.find({});
        
                // Resume all timers
                timers.forEach(async (timer) => {
                    timer.isPaused = false;
                    await timer.save();
                });
        
                return "All timers have been resumed successfully!";
            } catch (error) {
                console.error("Error resuming all timers:", error);
                throw new Error("Failed to resume all timers");
            }    
        },
        deleteAllTimers: async (parent, args, context) => {
            try {
                // Delete all Timers
                await Timer.deleteMany({});
        
                return "All timers have been deleted successfully!";
            } catch (error) {
                console.error("Error deleting all timers:", error);
                throw new Error("Failed to delete all timers");
            }
        },
        sendFriendRequest: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to send a friend request');
            }
        
            const receiver = await User.findById(args.receiverID);
            if (!receiver) {
                throw new Error('No user found');
            }
        
            if (context.currentUser.id === receiver.id) {
                throw new Error('You cannot send a friend request to yourself');
            }
            

            //even though array of objects, mongo converts object id to string, so will just be string of objects
            if (context.currentUser.friends.includes(receiver.id)) {
                throw new Error('You are already friends with this user');
            }
            

            if (context.currentUser.outgoingFriendRequests.includes(receiver.id)) {
                throw new Error('You have already sent a friend request to this user');
            }
        
            if (context.currentUser.incomingFriendRequests.includes(receiver.id)) {
                throw new Error('You have already received a friend request from this user');
            }
            

            receiver.incomingFriendRequests.push(context.currentUser.id);
            context.currentUser.outgoingFriendRequests.push(receiver.id)
            await receiver.save();
            await context.currentUser.save();
        
            return "Friend request sent successfully!";
        },
        handleFriendRequest: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to handle a friend request');
            }
        
            const sender = await User.findById(args.senderID)
            if (!sender) {
                throw new Error('No user found');
            }
            
            //check if incoming req from the sender exists in user 
            const incomingRequest = context.currentUser.incomingFriendRequests.find(senderId => senderId.equals(sender.id));
            if (!incomingRequest) {
                throw new Error('No friend request found from this user');
            }


            if (args.action) {
                // Accept friend request, add friend to both users
                context.currentUser.friends.push(sender.id);
                sender.friends.push(context.currentUser.id);

            }
            
            
            // Remove the friend request from both users
            context.currentUser.incomingFriendRequests = context.currentUser.incomingFriendRequests.filter(senderId => !senderId.equals(sender.id));
            sender.outgoingFriendRequests = sender.outgoingFriendRequests.filter(req => !req.equals(context.currentUser.id));
            await context.currentUser.save();
            await sender.save();

            return `Friend request ${args.action? "accepted" : "rejected"} successfully!`;
        },
        createStudySession: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to create a study session');
            }

            // we use a session to ensure that both the study session and the timer are created together.
            //if one messes up we can rollback everything, so for example the timer is created but the study session isn't due to error
            //and then we wuold have a lone timer 
            const session = await mongoose.startSession();
            session.startTransaction();
            try{
                const studySession = new StudySession({
                    title: args.title,
                    description: args.description,
                    createdAt: new Date(args.startTimeIsoString),
                    user: context.currentUser.id
                });

                await studySession.save({ session, validateBeforeSave: false });

                const timer = await createTimer(
                    args.duration,
                    args.startTimeIsoString,
                    "StudySession",
                    studySession._id,
                    session
                )

                await timer.save({ session });

                studySession.timer = timer._id;

                await studySession.save({ session }); 

                await session.commitTransaction();
                
                //once a timer is created, we have to return the timer of session populated with these fields
                //so we can display the needed informatoin on the study session page
                const populatedStudySession = await studySession.populate({
                    path: 'timer',
                    populate: [
                        { path: 'log' },       
                        { path: 'currentBreak' }  
                    ]
                });
                return populatedStudySession;
            }  catch (error) {
                await session.abortTransaction();
                console.error("Error creating study session:", error);
                throw new Error("Failed to create study session");
            } finally {
                session.endSession();
            }

        },
        updateStudySessionInteractionDate: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to update the interaction date of a study session');
            }

            const studySession = await StudySession.findById(args.studySessionID);
            if (!studySession) {
                throw new Error('No study session found');
            }

            studySession.lastInteraction = new Date(args.newTime);
            await studySession.save();
            
            return studySession;
        },
        deleteAllStudySessions: async (parent, args, context) => {
            try{
                await StudySession.deleteMany({});
                return "All study sessions have been deleted successfully!";
            } catch (error) {
                console.error("Error deleting all study sessions:", error);
                throw new Error("Failed to delete all study sessions");
            }
        },
        createStudySessionPost: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to create a study session post');
            }
            //check if the study session has been completed first, by checking if the studiedTime value 
            //is not -1
            const studySession = await StudySession.findById(args.studySessionId);
            if (!studySession) {
                throw new Error('No study session found');
            }
            if (studySession.studiedTime < 0) {
                throw new Error('Study session has not been completed yet');
            }

            //we defined a an input type in schema which is a dict/obj with the stats we
            //are excluding from a studysession
            const post = new StudySessionPost({
                title: args.title,
                description: args.description,
                user: context.currentUser.id,
                exclusions: args.exclusions,
                studySession: args.studySessionId,
                studiedTime: studySession.studiedTime
            });
            await post.save()

            //update the current user to add this new post to their allPosts array
            await context.currentUser.updateOne({ $push: { allPosts: post._id } });

            //update the study session to add this post to its postedID field, marking it as posted 
            studySession.postedID = post._id;
            await studySession.save();
            const populatedPost = await post.populate(['studySession', 'comments', 'likes', 'user'])
            const populatedStudySession = await studySession.populate('postedID');
            return {
                post: populatedPost,  
                studySession: populatedStudySession  
            };
        },
        clearUserOutgoingFriendRequests: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to clear outgoing friend requests');
            }

            context.currentUser.outgoingFriendRequests = []
            await context.currentUser.save()
            return "All outgoing friend requests have been cleared successfully!";
        },
        clearUserIncomingFriendRequests: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to clear incoming friend requests');
            }

            context.currentUser.incomingFriendRequests = []
            await context.currentUser.save()
            return "All incoming friend requests have been cleared successfully!";
        },
        createCommentForPost: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to create a comment');
            }

            const post = await BasePost.findById(args.postID);
            if (!post) {
                throw new Error('No post found');
            }

            if (!args.content || args.content.trim() === '') {
                throw new Error('Comment content cannot be empty');
            }

            const comment = new Comment({
                content: args.content,
                user: context.currentUser.id,
                post: post._id
            });

            await comment.save();
            post.comments.push(comment._id);
            await post.save();
            
            context.currentUser.comments.push(comment._id);
            await context.currentUser.save();

            const populatedPost = await post.populate(['comments'])
            return populatedPost;
        },
        completeStudySessionForUser: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to complete a study session');
            }

            // Get study session and populate timer
            const studySession = await StudySession.findById(args.studySessionID).populate('timer');
            if (!studySession) {
                throw new Error('No study session found');
            }
            const timer = studySession.timer;
            if (!timer) {
                throw new Error('No timer found for this study session');
            }
            // Update study session
            studySession.studiedTime = args.studiedTime;
            studySession.lastInteraction = new Date();
            await studySession.save();

            // Update timer
            timer.finished = true;
            await timer.save();
            
            return studySession.populate('timer');
        },
        userLikesPost: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to like a post');
            }

            const post = await BasePost.findById(args.postID);
            if (!post) {
                throw new Error('No post found');
            }
            // Check if user already liked the post, if so then remove the like
            if (post.likes.includes(context.currentUser.id)) {
                post.likes = post.likes.filter(userId => !userId.equals(context.currentUser.id));
                context.currentUser.likedPosts = context.currentUser.likedPosts.filter(postId => !postId.equals(args.postID));
            } else{
                // Add user to post likes
                post.likes.push(context.currentUser.id);
                // Add post to user's liked posts
                context.currentUser.likedPosts.push(args.postID);
            }
            await post.save();
            await context.currentUser.save();
            // Return the updated post and updated user
            const populatedPost = await post.populate('likes');
            const populatedUser = await context.currentUser.populate('likedPosts');
            return {
                post: populatedPost,
                user: populatedUser
            };

        },
        createGeneralPost: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to create a general post');
            }

            const post = new GeneralPost({
                title: args.title,
                description: args.description,
                user: context.currentUser.id,
                postType: 'GeneralPost',
                category: args.category
            });
            await post.save();

            //update the current user to add this new post to their allPosts array
            await context.currentUser.updateOne({ $push: { allPosts: post._id } });
            const populatedPost = await post.populate(['user', 'comments', 'likes']);
            return populatedPost;
        },
        deletePostById: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to delete a post');
            }
            
            // Get the post with populated data BEFORE deletion
            const post = await BasePost.findById(args.postID)
                .populate([
                    {
                        path: 'studySession',
                        populate: {
                            path: 'timer',
                            populate: ['log', 'currentBreak']
                        }
                    },
                    'comments'
                ]);
                if (!post) {
                    throw new Error('No post found');
                }

            // Delete using your utility function
            await deletePostByIdUtil(args.postID, context.currentUser.id);

            return post
        },
        deleteStudySessionById: async (parent, args, context) => {
            // Get the study session with all related data BEFORE deletion
            const studySession = await StudySession.findById(args.studySessionID).populate([
                {
                    path: 'timer',
                    populate: [
                        { path: 'log' },
                        { path: 'currentBreak' }
                    ]
                },
                { path: 'user' }
            ]);
            
            if (!studySession) {
                throw new Error('No study session found');
            }
            
            
            // Perform the deletion
            await deleteStudySessionByIdUtil(args.studySessionID, context.currentUser.id);
            
            console.log("Deleted study session:", studySession);
            return studySession;
        },
        updateUserDetails: async (parent, args, context) => {
            if (!context.currentUser) {
                throw new Error('You must be logged in to update your profile');
            }
            //do similar checks as in createUser, but this time we are updating the user
            const { name, username, email } = args;

            if (!name || !username || !email) {
                throw new Error('All fields (name, username, email) are required');
            }

            if (username.length < 3) {
                throw new Error('Username must be at least 3 characters long');
            }

            if (username.length > 20) {
                throw new Error('Username must be no more than 20 characters long');
            }

            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                throw new Error('Username can only contain letters, numbers, and underscores');
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please provide a valid email address');
            }

            try {
                // Check if new username is taken (excluding current user)
                if (username.toLowerCase() !== context.currentUser.username.toLowerCase()) {
                    const existingUserByUsername = await User.findOne({ 
                        username: { $regex: new RegExp(`^${username}$`, 'i') },
                        _id: { $ne: context.currentUser.id }
                    });
                    
                    if (existingUserByUsername) {
                        throw new Error('Username is already taken');
                    }
                }

                // Check if new email is taken (excluding current user)
                if (email.toLowerCase() !== context.currentUser.email?.toLowerCase()) {
                    const existingUserByEmail = await User.findOne({ 
                        email: { $regex: new RegExp(`^${email}$`, 'i') },
                        _id: { $ne: context.currentUser.id }
                    });
                    
                    if (existingUserByEmail) {
                        throw new Error('Email is already in use');
                    }
                }

                // Update user with normalized data
                const updatedUser = await User.findByIdAndUpdate(
                    context.currentUser.id,
                    {
                        name: name.trim(),
                        username: username.toLowerCase().trim(),
                        email: email.toLowerCase().trim()
                    },
                    { new: true }
                );

                if (!updatedUser) {
                    throw new Error('User not found');
                }

                // Create new JWT token with updated info since we want the user info to be securely sent back to client 
                const token = jwt.sign(
                    { 
                        id: updatedUser._id, 
                        username: updatedUser.username, 
                        name: updatedUser.name,
                        email: updatedUser.email
                    },
                    SECRET,
                    { expiresIn: '1h' }
                );

                return token;

            } catch (error) {
                // Handle MongoDB validation errors
                if (error.name === 'ValidationError') {
                    const messages = Object.values(error.errors).map(err => err.message);
                    throw new Error(`Validation error: ${messages.join(', ')}`);
                }

                // Handle MongoDB duplicate key errors (if you have unique indexes)
                if (error.code === 11000) {
                    const field = Object.keys(error.keyPattern)[0];
                    throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`);
                }

                // Re-throw our custom errors
                if (error.message.includes('Username is already taken') || 
                    error.message.includes('Email is already in use') ||
                    error.message.includes('must be at least') ||
                    error.message.includes('valid email') ||
                    error.message.includes('required') ||
                    error.message.includes('User not found')) {
                    throw error;
                }

                // Generic error for unexpected issues
                console.error('Error updating user details:', error);
                throw new Error('Failed to update user details. Please try again.');
            }
        },














        //Admin mutations 
        updatestudiedTimeforStudySessionPost: async (parent, args, context) => {
            try {
                // Update all StudySessionPost documents to set studiedTime to 10
                const result = await StudySessionPost.updateMany(
                    {}, // Empty filter means all documents
                    { $set: { studiedTime: 10 } }
                );

                return `Successfully updated ${result.modifiedCount} study session posts with studied time of 10 seconds.`;
            } catch (error) {
                console.error("Error updating studied time for study session posts:", error);
                throw new Error("Failed to update studied time for study session posts");
            }
        },
        resetAllLikesOnPosts: async (parent, args, context) => {
            // This mutation will reset all likes on all posts, setting the likes back to an empty array
            //and removing the likedPosts from all users
            try {
                // Reset likes on all posts
                await BasePost.updateMany({}, { $set: { likes: [] } });

                // Reset likedPosts for all users
                await User.updateMany({}, { $set: { likedPosts: [] } });

                return "All likes on posts have been reset successfully!";
            } catch (error) {
                console.error("Error resetting likes on posts:", error);
                throw new Error("Failed to reset likes on posts");
            }
        },
        deleteAllPosts: async (parent, args, context) => {
            try {
                // Get all posts first
                const allPosts = await BasePost.find({});
                
                if (allPosts.length === 0) {
                    return "No posts found to delete.";
                }

                let deletedCount = 0;
                let errors = [];

                // Delete each post using Util
                for (const post of allPosts) {
                    try {
                        await deletePostByIdUtil(post._id, post.user);
                        deletedCount++;
                    } catch (error) {
                        console.error(`Error deleting post ${post._id}:`, error);
                        errors.push(`Failed to delete post "${post.title}" (ID: ${post._id}): ${error.message}`);
                    }
                }

                if (errors.length > 0) {
                    console.warn("Some posts failed to delete:", errors);
                    return `Successfully deleted ${deletedCount} posts. ${errors.length} posts failed to delete.`;
                }

                return `Successfully deleted all ${deletedCount} posts and their related data.`;
            } catch (error) {
                console.error("Error deleting all posts:", error);
                throw new Error("Failed to delete all posts");
            }
        },
        clearEntireDatabase: async (parent, args, context) => {
            
            try {
                // Clear all collections
                const results = await Promise.allSettled([
                    User.deleteMany({}),
                    Timer.deleteMany({}),
                    StudySession.deleteMany({}),
                    Break.deleteMany({}),
                    BasePost.deleteMany({}),
                    Comment.deleteMany({})
                ]);
                
                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;
                
                return `Database cleared: ${successful} collections cleared successfully, ${failed} failed.`;
            } catch (error) {
                console.error("Error clearing database:", error);
                throw new Error("Failed to clear database");
            }
        },



        //these are for password reset functionality
        requestPasswordReset: async (parent, args) => {
            const { email } = args;
            
            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                // Don't reveal if email exists or not for security
                return "If an account with that email exists, we've sent a password reset link.";
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            
            // Save token to user (expires in 1 hour)
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; 
            await user.save();

            // Send email
            const emailSent = await sendPasswordResetEmail(user.email, resetToken);
            
            if (!emailSent) {
                throw new Error('Failed to send reset email. Please try again.');
            }

            return "If an account with that email exists, we've sent a password reset link.";
        },

        resetPassword: async (parent, args) => {
            const { token, newPassword } = args;
            
            // Find user with valid reset token
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw new Error('Password reset token is invalid or has expired.');
            }

            // Validate new password
            if (newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Hash new password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(newPassword, saltRounds);

            // Update user password and clear reset token
            user.password = passwordHash;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return "Password has been successfully reset. You can now log in with your new password.";
        }

    }
}

export default resolvers;