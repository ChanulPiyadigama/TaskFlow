import User from "./models/User.js";
import Timer from "./models/Timer.js";
import Break from "./models/Break.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET } from "./util/config.js";
import mongoose from "mongoose";

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
            try {
              const timer = new Timer({
                totalTime: args.totalTime,
                timeLeft: args.totalTime,
                startTime: new Date(),
                log: [],
                user: context.currentUser.id
              });
      
              await timer.save();
              return await timer.populate(['user', 'log', 'currentBreak']);
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
        }
        
    },
}

export default resolvers;