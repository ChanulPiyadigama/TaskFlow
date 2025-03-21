
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
        getUserTimers:[Timer]
    }
    
    type Mutation{
        createUser(username: String!, password: String!, name: String!): String!
        createTimer(totalTime: Int!): Timer
        login(username: String!, password: String!): String!
        handleBreak(timerID: String, timeOfChange: String!, isPaused: Boolean!): Timer!
        clearBreaks: String!
        setPause(timerID:String!):String!
        resetTimer(timerID:String!, startTime: String!):Timer!
    }

`;

export default typeDefs;