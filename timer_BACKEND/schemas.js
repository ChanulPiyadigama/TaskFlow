
//used to identify and understand the query from client to run right resolvers and return correct data
const typeDefs = `
    type User{
        id: ID!
        username: String!
        password: String!
        name: String!
        timers: [Timer]
    }
    
    type Timer{
        id: ID!
        totalTime: Int!
        timeLeft: Int!
        startTime: String!
        log: [Break]
        user: User!
        isPaused: Boolean!
        currentBreak: Break
    }   

    type Break{
        id: ID!
        pausedTime: String!
        resumedTime: String
        elapsedTime: Int
        timer: Timer!
    }

    type Query{
        allTimers: [Timer]
        allUsers: [User]
        allBreaks: [Break]
        findUser(id: ID!): User
        findTimer(id: ID!): Timer
        findBreak(id: ID!): Break
    }
    
    type Mutation{
        createUser(username: String!, password: String!, name: String!): User
        createTimer(totalTime: Int!): Timer
        createBreak(timePaused: Int!, timeResumed: Int!, elapsedTime: Int!, timeLeft: Int!): Break
        login(username: String!, password: String!): String!
        handleBreak(timerID: String, timeOfChange: String!, isPaused: Boolean!): Timer!
    }

`;

export default typeDefs;