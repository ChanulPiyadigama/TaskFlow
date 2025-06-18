
//used to identify and understand the query from client to run right resolvers and return correct data
const typeDefs = `
    type User{
        id: ID!
        username: String!
        name: String!
        friends: [User]
        incomingFriendRequests: [User]
        outgoingFriendRequests: [User]
        studySessions: [StudySession]
        allPosts: [BasePost]
        comments: [Comment]
        likedPosts: [BasePost]
    }

    type StudySession{
        id: ID!
        title: String
        description: String
        user: User!
        timer: Timer!
        createdAt: String!
        lastInteraction: String!
        studiedTime: Int
        postedID: BasePost
    }

    interface BasePost {
        id: ID!
        title: String!
        description: String
        user: User!
        createdAt: String!
        lastInteraction: String!
        postType: String!
        comments: [Comment]
        likes: [User]
    }

    type StudySessionPost implements BasePost {
        id: ID!
        title: String!
        description: String
        user: User!
        createdAt: String!
        lastInteraction: String!
        postType: String!
        studySession: StudySession!
        studiedTime: Int!
        exclusions: exclusionDict
        comments: [Comment]
        likes: [User]
    }

    type GeneralPost implements BasePost {
        id: ID!
        title: String!
        description: String
        user: User!
        createdAt: String!
        lastInteraction: String!
        postType: String!
        comments: [Comment]
        likes: [User]
        category: String
    }

    type exclusionDict {
        excludeTime: Boolean!
    }

    input StudySessionPostExclusions {
        excludeTime: Boolean!
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
        finished: Boolean!
    }   

    type Break{
        id: ID!
        pausedTime: String!
        resumedTime: String
        elapsedTime: Int
        timer: Timer!
    }

    type Comment{
        id: ID!
        user: User!
        post: BasePost!
        content: String!
        createdAt: String!
        lastInteraction: String!
    }

    type LikeResponse {
        post: BasePost!
        user: User!
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
        getUserFriendsPosts(cursor:String, limit: Int!):[BasePost]
        searchUsers(query: String!): [User]
        getUserInfoById(userID: ID!): User
        getPostCommentsById(postID: ID!): BasePost
        getUserPosts: [BasePost]
        getPostById(postID: ID!): BasePost
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
        createStudySessionPost(title: String!, description: String, exclusions: StudySessionPostExclusions, studySessionId: ID! ): StudySessionPost!
        clearUserOutgoingFriendRequests: String!
        clearUserIncomingFriendRequests: String!
        createCommentForPost(postID: ID!, content: String!): Comment!
        completeStudySessionForUser(studySessionID: ID!, studiedTime: Int!): StudySession!
        userLikesPost(postID: ID!): LikeResponse!
        updatestudiedTimeforStudySessionPost: String!
        resetAllLikesOnPosts: String!
        createGeneralPost(title: String!, description: String, category: String!): GeneralPost!
        deletePostById(postID: ID!): String!
    }

`;

export default typeDefs;