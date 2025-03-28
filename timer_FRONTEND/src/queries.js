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
        startTime
        timeLeft
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
  }
}
`