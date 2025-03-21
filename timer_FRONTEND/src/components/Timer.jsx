import { useEffect, useState } from "react";
import BreakLog from "./BreakLog";
import { HANDLE_BREAK, RESET_TIMER } from "../queries";
import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "@mantine/core";


export default function Timer({timer}) {
    
    //whenever the timer cache is changed, components subscribed to the timer obj through a query etc, will rerender, so
    //timerlist will rerender, and provide this timer componenet with the newest timer obj from the cache 

    //client to access the cache

    //all breaks, resets and edits are saved to db upon happening, execpt timeleft which is saved ot localstorage
    //since saving to db every second is inefficent, it will be saved to db at certain times. 
    const client = useApolloClient()
    const [handleBreak, {loading, data, error}] = useMutation(HANDLE_BREAK);
    const [resetTimer, {resetTimerLoading}] = useMutation(RESET_TIMER)
    
    //we store the timeleft to local storage to grab when app refreshes, we grab it and set it to the 
    //cache timeleft value to use.
    //if it doesnt exist it means its the first time the timer is running
    //this use effect runs once on page refresh 
    useEffect(() => {
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
    }, []);
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
    if (resetTimerLoading) return <p>Reseting Timer... </p>

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
        if (timer.isPaused) return;

        //setInterval is a js function immune to react rerenders, so it runs in the background until it is cleared and is not affected by the rerender.
        //cache updates happen immedietly unlike state updates that provide the updated value in the next render, this means
        //that even though setInterval is happening in the background away from react, it will still use the newest timer
        //cache values since it isnt relient on rerenders, and can be accessed anywhere.
        const intervalId = setInterval(() => {
            if (timer.timeLeft > 0){
                //the modification will rerender timerlist, provide us with new timer obj (timeleft)
                client.cache.modify({
                    id: client.cache.identify({ __typename: "Timer", id: timer.id }),
                    fields: {
                        //the timeleft is a state value through cache, and is saved to localstorage
                        //to grab upon page refresh
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
    
    return (
        <div>
            <p>{formatTime(timer.timeLeft)}</p>
            <button onClick={handlePause}>
                {timer.isPaused ? "Resume" : "Pause"}
            </button>
            <Button color="blue" size="lg">Reset</Button>
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