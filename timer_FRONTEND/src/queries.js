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