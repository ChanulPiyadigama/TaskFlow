import User from "./models/User.js";
import Timer from "./models/Timer.js";
import Break from "./models/Break.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET } from "./util/config.js";
import mongoose from "mongoose";
import { get } from "http";

const resolvers = {
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
            
        }
    },

    Mutation: {
        //creates a user, saves to db where details are checked by mongoose schema, then returns a token containing user details
        //which can be decoded on client side to get user details
        createUser: async (parent, args) => {
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(args.password, saltRounds);

            const user = new User({
                username: args.username,
                password: passwordHash,
                name: args.name
            });
            try {
                await user.save()
                
                const token = jwt.sign(
                    { id: user._id, username: user.username, name: user.name },
                    SECRET,
                    { expiresIn: '1h' }
                  )
            
                return token

            } catch (error) {
            throw new Error('Error creating user')
        }
        },
        createTimer: async (parent, args, context) => {
            //check if user exists then create timer and upload it to db
            if(!context.currentUser){
                throw new Error('You must be logged in to create a timer');
            }
            //creates a timer for user (id is from token), startTime is date obj created with given iso string
            try {
              const timer = new Timer({
                totalTime: args.totalTime,
                timeLeft: args.totalTime,
                startTime: new Date(args.startTime),
                user: context.currentUser.id
              });
      
              await timer.save();
              return timer.populate(['log', 'currentBreak'])
            } catch (error) {
              console.error("Error creating timer:", error);
              throw new Error("Failed to create timer");
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
              { id: user._id, username: user.username, user: user.name },
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

            if (args.isPaused) {
                //check if timer being paused exists 
                const timer = await Timer.findById(args.timerID);
                if (!timer) {
                    throw new Error('No timer found');
                }
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
                    }, 'user','log'])


            } else {
                //check if timer being resumed exists
                const timer = await Timer.findById(args.timerID);
                if (!timer) {
                    throw new Error('No timer found');
                }
                //check if current break exists within that timer
                const currentBreak = await Break.findById(timer.currentBreak);
                if (!currentBreak) {
                    throw new Error('No break found');
                }
                //set resumed time and elapsed time for break, add its id to timer's log, and set current break to null, break over
                currentBreak.resumedTime = args.timeOfChange;
                currentBreak.elapsedTime = new Date(args.timeOfChange) - new Date(currentBreak.pausedTime);
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
                    }, 'user','log'])
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
        }

    }
}

export default resolvers;