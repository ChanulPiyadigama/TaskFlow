
//used to identify and understand the query from client to run right resolvers and return correct data
const typeDefs = `
    type User{
        id: ID!
        username: String!
        name: String!
        timers: [Timer]
        friends: [User]
        incomingFriendRequests: [User]
        outgoingFriendRequests: [User]
    }

    type StudySession{
        id: ID!
        title: String
        description: String
        user: User!
        timer: Timer!
        createdAt: String!
        lastInteraction: String!
    }

    type UserPost{
        id:ID!
        tite: String!
        description: String
        user: User!
        postingObjType: String!
        postingObjId: ID!
        createdAt: String!
        lastInteraction: String!
    }

    type Timer{
        id: ID!
        totalTime: Int!
        timeLeft: Int!
        startTime: String!
        log: [Break]
        isPaused: Boolean!
        currentBreak: Break
        parentType: String
        parentId: ID
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
        getUserFriends:[User]
        getUserIncomingFriendRequests:[User]
        getUserOutgoingFriendRequests:[User]
        getSpecificTimer(timerID: ID!): Timer!
        getSpecificStudySession(studySessionID: ID!): StudySession!
        getUserStudySessions:[StudySession]
    }
    
    type Mutation{
        createUser(username: String!, password: String!, name: String!): String!
        login(username: String!, password: String!): String!
        handleBreak(timerID: String, timeOfChange: String!, isPaused: Boolean!): Timer!
        clearBreaks: String!
        setPause(timerID:String!):String!
        resumeAllTimers:String!
        resetTimer(timerID:String!, startTime: String!):Timer!
        deleteAllTimers:String!
        sendFriendRequest(receiverID:ID!):String!
        handleFriendRequest(senderID:ID!, action: Boolean!):String!
        createStudySession(startTimeIsoString: String!, title: String, description: String, duration: Int): StudySession!
        updateStudySessionInteractionDate(studySessionID: ID!, newTime: String!): StudySession!
        deleteAllStudySessions: String!
        createUserPost(title: String!, description: String, postingObjType: String!, postingObjId: ID!): UserPost!
        
    }

`;

export default typeDefs;