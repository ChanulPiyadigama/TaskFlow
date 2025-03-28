import { Fragment, useEffect, useState } from "react";
import { HANDLE_BREAK, RESET_TIMER } from "../queries";
import { useApolloClient, useFragment, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

//the usequery gets the timers from the cache, since it looks there first, then using the timer id we find
//the timer, and use it as our state by using its attributes
//every time the cache timer object is updated, the timer obj will rerender since usequery is a subsriber
//and then we get the newest timer obj and its updated values are displayed on the screen
export default function Timer({timerID}) {
    //all breaks, resets and edits are saved to db upon happening, execpt timeleft which is saved ot localstorage
    //since saving to db every second is inefficent, it will be saved to db at certain times. 
    const client = useApolloClient()

    //on first rerender we get loading and data(timer) is undef, so we return loading
    //(Which is located at the bottom so the same hooks are called between each render)
    //on second rerender we get data and can then use timer logic
    //also on page refresh, this query will be sent to network not cache, so there will be loading, since
    //both timerlist and timer send the same query and timer page/route if refreshed, will be first.
    console.log(timerID)
    const GET_TIMER_BYID = gql`
    fragment TimerFields on Timer{
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
    }`
    const { data: timerData, loading: timersLoading, error: errorGettingTimers } = useFragment({
        fragment: GET_TIMER_BYID,
        from:{
            __typename: "Timer",
            id: timerID
        }
    })
    const [handleBreak, { loading: breakLoading }] = useMutation(HANDLE_BREAK);
    const [resetTimer, { loading: resetLoading }] = useMutation(RESET_TIMER);

    const timer = timerData


    console.log(timer)
    

    
    //we store the timeleft to local storage to grab when app refreshes, we grab it and set it to the 
    //cache timeleft value to use.
    //if it doesnt exist it means its the first time the timer is running
    //this use effect runs once on page refresh, its also dependent on timer because on second render we get data
    //and timer is not longer an empty array and we can get timeleft from localstorage
    useEffect(() => {
        //when loading no timer, dont run logic
        if (!timer) return;
        const storedTimeLeft = localStorage.getItem(`timer-${timer.id}-timeLeft`);
        if (storedTimeLeft !== null) {
            // If timeLeft exists in localStorage, update the cache with this value
            client.cache.modify({
                id: client.cache.identify({ __typename: "Timer", id: timer.id }),
                fields: {
                    timeLeft() {
                        return parseInt(storedTimeLeft, 10); // Set timeLeft from localStorage
                    },
                },
            });
        }
    }, [timer]);
    //sends mutation response, display loading on first render, gets data updates cache timer object, rerenders
    //and shows new timer values, we also remove the breaks from the cache 
    //also timer is paused upon reset done in backend resolver
    const handleReset = () => {
        resetTimer({
            variables:{
                timerId: timer.id,
                startTime: new Date().toISOString()
            },
            onCompleted: () => {
                timer.log.forEach(breakId => {
                    client.cache.evict({ id: client.cache.identify({ __typename: "Break", id: breakId.id }) });
                });

                localStorage.setItem(`timer-${timer.id}-timeLeft`, timer.timeLeft)
            },
            onError: (error) => {
                console.error("Reset Timer failed", error);
            }
        })
        
    };
    

    //sends a mutation that creates/ends a break, saves in db, returns new currentbreak, log and ispaused values,
    //and thus saves to cache causing rerender. This causes a slight delay, so we optimisicatlly pause/resume the timer
    //right away with a cache modification 
    const handlePause = () => {
        client.cache.modify({
            id: client.cache.identify({ __typename: "Timer", id: timer.id }),
            fields: {
                isPaused(existingValue) {
                    return !existingValue; 
                },
            },
        });

        handleBreak({
            variables: {
                timerId: timer.id,
                timeOfChange: new Date().toISOString(),
                isPaused: !timer.isPaused
            }
        });
    };
    

    //useeffect will rerun on pause/resume, clearing the interval and starting/stopping the new interval
    useEffect(() => {
        //when loading no timer, dont run logic
        if (timer.isPaused || !timer) return;

        //setInterval is a js function immune to react rerenders, so it runs in the background until it is cleared and is not affected by the rerender.
        //cache updates happen immedietly unlike state updates that provide the updated value in the next render, this means
        //that even though setInterval is happening in the background away from react, it will still use the newest timer
        //cache values since it isnt relient on rerenders, and can be accessed anywhere.
        const intervalId = setInterval(() => {
            if (timer.timeLeft > 0){
                //the modification will rerender timer (usequuery subscriotion), provide us with new timer obj (timeleft) to display on screen
                client.cache.modify({
                    id: client.cache.identify({ __typename: "Timer", id: timer.id }),
                    fields: {
                        //the timeleft  is saved to localstorage
                        //to grab upon page page refresh
                      timeLeft(existingValue) {
                        localStorage.setItem(`timer-${timer.id}-timeLeft`, existingValue-1)
                        return existingValue-1; 
                      },
                    },
                });
            }else{
                clearInterval(intervalId)
                client.cache.modify({
                    id: client.cache.identify({ __typename: "Timer", id: timer.id }), 
                    fields: {
                      timeLeft(existingValue) {
                        localStorage.setItem(`timer-${timer.id}-timeLeft`, 0)
                        return 0; 
                      },
                    },
                });
            }

        }, 1000);

        return () => clearInterval(intervalId); 
    }, [timer.isPaused]);


    //cover time to HH::MM::SS
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }
    

    if (timersLoading) return <p>Loading timers...</p>;
    if (errorGettingTimers) return <p>Error fetching timers: {error.message}</p>;
    if (resetLoading) return <p>Reseting Timer... </p>
    
    return (
        <div>
            <p>{formatTime(timer.timeLeft)}</p>
            <button onClick={handlePause}>
                {timer.isPaused ? "Resume" : "Pause"}
            </button>
            <button onClick={handleReset}>Reset</button>
            <button>Edit</button>
            <div>
                <div>
                    {/*Convert iso strings to date time objects*/}
                    <p>Current Break:</p>
                    {timer.currentBreak ? (
                        <p>{new Date(Number(timer.currentBreak.pausedTime)).toLocaleTimeString()}</p>
                    ) : (
                        <p>No current break</p>
                    )}
                </div>
                <div>
                    <p>Break Log:</p>
                    {timer.log.length > 0 ? timer.log.map(breakObj => (

                        <p key={breakObj.id}>{new Date(Number(breakObj.pausedTime)).toLocaleTimeString()} {new Date(Number(breakObj.resumedTime)).toLocaleTimeString()}:  {formatTime(breakObj.elapsedTime)}</p>
                    )) : (
                        <p>No breaks yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}