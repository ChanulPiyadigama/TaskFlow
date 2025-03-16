import User from "./models/User.js";
import Timer from "./models/Timer.js";
import Break from "./models/Break.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET } from "./util/config.js";

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
        }
    },

    Mutation: {
        //creates user/timer/break, saves to db, and returns obj from db
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
                return { id: user._id.toString(), username: user.username, name: user.name }
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
              return timer;
            } catch (error) {
              console.error("Error creating timer:", error);
              throw new Error("Failed to create timer");
            }
        },
        createBreak: async (parent, args) => {
            const break_ = new Break(args);
            return await break_.save();
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
      
            const token = jwt.sign(
              { id: user._id, username: user.username },
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
                })
                //save break and set it as current break for timer, then return timer
                await newBreak.save();
                timer.currentBreak = newBreak._id;
                timer.isPaused = true;
                //return timer with populated current break, not log since we already have that, that changes once break ends
                await timer.save();
                return await timer.populate('currentBreak')

            } else{
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
                //set resumed time, flip isPaused and elapsed time for break, add its id to timer's log, and set current break to null, break over
                currentBreak.resumedTime = args.timeOfChange;
                currentBreak.elapsedTime = args.timeResumed - currentBreak.pausedTime;
                await currentBreak.save();
                timer.log.push(currentBreak._id);
                timer.currentBreak = null;
                timer.isPaused = false;
                //frontend needs break objs from log to display them, so populate log with break objs
                await timer.save();
                return await timer.populate('log');
            }
        }
    },
}

export default resolvers;