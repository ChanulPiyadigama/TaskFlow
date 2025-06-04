import { gql } from "@apollo/client";

export const LOGIN = gql`
    mutation login($username: String!, $password: String!){
        login(username: $username, password: $password)
    }
`;

export const GET_USER_TIMERS = gql`
    query GetUserTimers {
        getUserTimers {
            timeLeft
            totalTime
            startTime
            id
            isPaused
            currentBreak {
                pausedTime
                resumedTime
                id
                elapsedTime
            }
            log {
                elapsedTime
                id
                pausedTime
                resumedTime
            }
        }
    }
`;

export const HANDLE_BREAK = gql`
    mutation HandleBreak($timerId: String, $timeOfChange: String!, $isPaused: Boolean!) {
        handleBreak(timerID: $timerId, timeOfChange: $timeOfChange, isPaused: $isPaused) {
            id
            isPaused
            currentBreak {
                pausedTime
                resumedTime
                id
                elapsedTime
            }
            log {
                elapsedTime
                id
                pausedTime
                resumedTime
            }
        }
    }
`
export const RESET_TIMER = gql`
    mutation SetPause($timerId: String!, $startTime: String!) {
    resetTimer(timerID: $timerId, startTime: $startTime) {
          id 
          timeLeft
          totalTime
          startTime
          isPaused
          currentBreak {
              id
              pausedTime
              resumedTime
              elapsedTime
          }
          log {
              id
              pausedTime
              resumedTime
              elapsedTime
          }
    }
    }

`

export const CREATE_TIMER = gql`
mutation Mutation($totalTime: Int!, $startTime: String!) {
  createTimer(totalTime: $totalTime, startTime: $startTime) {
    timeLeft
    totalTime
    startTime
    id
    isPaused
    currentBreak {
        pausedTime
        resumedTime
        id
        elapsedTime
    }
    log {
        elapsedTime
        id
        pausedTime
        resumedTime
    }
  }
}
`

export const GET_USER_FRIENDS = gql`
query Query {
  getUserFriends {
    id
    username
    name
  }
}
`

export const GET_USER_INCOMING_FRIEND_REQUESTS = gql`
query GetUserIncomingFriendRequests {
  getUserIncomingFriendRequests {
    id
    name
    username
  }
}
`

export const GET_USER_OUTGOING_FRIEND_REQUESTS = gql`
query GetUserOutgoingFriendRequests {
  getUserOutgoingFriendRequests {
    id
    name
    username
  }
}
`

export const CREATE_USER = gql`
mutation CreateUser($username: String!, $password: String!, $name: String!) {
  createUser(username: $username, password: $password, name: $name)
}
`

export const CREATE_STUDY_SESSION =gql`
mutation CreateStudySession($startTimeIsoString: String!, $title: String, $description: String, $duration: Int) {
  createStudySession(startTimeIsoString: $startTimeIsoString, title: $title, description: $description, duration: $duration) {
    title
    id
    description
    createdAt
    lastInteraction
    timer {
      id
      parentId
      currentBreak {
        elapsedTime
        id
        pausedTime
        resumedTime
        timer {
          id
        }
      }
      isPaused
      log {
        elapsedTime
        id
        pausedTime
        resumedTime
        timer {
          id
        }
      }
      startTime
      timeLeft
      totalTime
    }
  }
}
`
export const GET_STUDY_SESSION_BYID = gql`
query GetSpecificStudySession($studySessionId: ID!) {
  getSpecificStudySession(studySessionID: $studySessionId) {
    createdAt
    lastInteraction
    description
    id
    title
    timer {
      currentBreak {
        elapsedTime
        id
        resumedTime
        pausedTime
      }
      id
      isPaused
      log {
        elapsedTime
        id
        pausedTime
        resumedTime
      }
      parentId
      parentType
      startTime
      timeLeft
      totalTime
    }
  }
}
`

export const GET_ALL_USER_STUDY_SESSIONS = gql`
query GetUserStudySessions {
  getUserStudySessions {
    title
    lastInteraction
    timer {
      currentBreak {
        elapsedTime
        id
        pausedTime
        resumedTime
      }
      id
      isPaused
      log {
        elapsedTime
        id
        pausedTime
        resumedTime
      }
      parentId
      startTime
      timeLeft
      totalTime
    }
    createdAt
    description
    id
  }
}
`

export const UPDATE_STUDY_SESSION_INTERACTION_TIME = gql`
mutation UpdateStudySessionInteractionDate($studySessionId: ID!, $newTime: String!) {
  updateStudySessionInteractionDate(studySessionID: $studySessionId, newTime: $newTime) {
    id
    lastInteraction
  }
}
`

export const CREATE_USER_STUDY_SESSION_POST = gql`
mutation CreateStudySessionPost($title: String!, $studySessionId: ID!, $exclusions: StudySessionPostExclusions, $description: String) {
  createStudySessionPost(title: $title, studySessionId: $studySessionId, exclusions: $exclusions, description: $description) {
    id
    createdAt
    description
    exclusions {
      excludeTime
    }
    lastInteraction
    postType
    title
  }
}`

export const SEND_FRIEND_REQUEST = gql`
mutation SendFriendRequest($receiverId: ID!) {
  sendFriendRequest(receiverID: $receiverId)
}
`

export const SEARCH_USERS = gql`
query SearchUsers($query: String!) {
  searchUsers(query: $query) {
    name 
    username
    id
  }
}
`
//currently curated for userPage
export const GET_USERINFO_BYID = gql`
query GetUserInfoById($userId: ID!) {
  getUserInfoById(userID: $userId) {
    id
    name
    username
    allPosts {
      id
      description
      likes
      title
    }
    friends {
      id
      name
      username
    }
  }
}
`

export const HANDLE_FRIEND_REQUEST = gql`
mutation Mutation($senderId: ID!, $action: Boolean!) {
  handleFriendRequest(senderID: $senderId, action: $action)
}
`

export const GET_FRIENDS_POSTS = gql`
query GetUserFriendsPosts($cursor: String, $limit: Int!) {
  getUserFriendsPosts(cursor: $cursor, limit: $limit) {
    description
    id
    createdAt
    title
    lastInteraction
    comments {
      id
    }
    user {
      name
      id
      username
    }
  }
}
`

export const CREATE_COMMENT_FOR_POST =  gql`
mutation CreateCommentForPost($content: String!, $postId: ID!) {
  createCommentForPost(content: $content, postID: $postId) {
    content
    createdAt
    id
    lastInteraction

  }
}
`

export const GET_COMMENTS_FOR_POST = gql`
query Query($postId: ID!) {
  getPostCommentsById(postID: $postId) {
    comments {
      id
      createdAt
      content
      lastInteraction
    }
    id
  }
}
`