import { Fragment, useEffect, useState } from "react";
import { HANDLE_BREAK, RESET_TIMER, GET_ALL_USER_STUDY_SESSIONS } from "../../data/queries";
import { useApolloClient, useFragment, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { Button, Card, Group, List, Stack, Text, Title, Collapse } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useModal } from "../../context/ModalContext";
import ResetTimerModal from "./ResetTimerConfirmModal";
import EndStudySessionModal from "./EndStudySession";
import { useQuery } from "@apollo/client";



//the usefragment gets the timer obj from the cache using id
//every time the cache timer object is updated, the timer obj will rerender since usefragment is a subsriber
//and then we get the newest timer obj and its updated values are displayed on the screen
export default function Timer({timerID}) {
    const { openModal, closeModal } = useModal()
    const handleResetConfirm = () => {
        handleReset();
        closeModal();
    };
    const [breakLogVisible, setBreakLogVisible] = useState(false);
    const [studySessionId, setStudySessionId] = useState(null);
    
    //get studysession id from cache 


    //all breaks, resets and edits are saved to db upon happening, execpt timeleft which is saved ot localstorage
    //since saving to db every second is inefficent, it will be saved to db at certain times. 
    const client = useApolloClient()

    //on first rerender we get loading and data(timer) is undef, so we return loading
    //(Which is located at the bottom so the same hooks are called between each render)
    //on second rerender we get data and can then use timer logic

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
    //since timer obj is a componenet on studypage, studysession usequery will fill cache with timer obj on refresh
    //so everytime we just grab the timer obj from cache with this usefragment
    const { data: timerData, loading: timersLoading, error: errorGettingTimers } = useFragment({
        fragment: GET_TIMER_BYID,
        from:{
            __typename: "Timer",
            id: timerID
        }
    })
    const [handleBreak, { loading: breakLoading }] = useMutation(HANDLE_BREAK);

    //reseting timer replaces old one in cache
    const [resetTimer, { loading: resetLoading, data: resetData }] = useMutation(RESET_TIMER, {
        onCompleted: (data) => {
            console.log(data)
            if (data && data.resetTimer) {
                localStorage.setItem(`timer-${timerID}-timeLeft`, data.resetTimer.timeLeft);
            }
        }
    });

    const { data: studySessionsData } = useQuery(GET_ALL_USER_STUDY_SESSIONS, {
        onCompleted: (data) => {
            const studySessionId = data.getUserStudySessions.find(
                session => session.timer.id === timerID
            );
            setStudySessionId(studySessionId ? studySessionId.id : null);
        }
    });


    const timer = timerData


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

    const handleReset = () => {
        resetTimer({
            variables:{
                timerId: timer.id,
                startTime: new Date().toISOString()
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
        if (timer.isPaused || !timer || timer.timeLeft <= 0) return; 

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
                        const newValue = Math.max(0, existingValue - 1); 
                        localStorage.setItem(`timer-${timer.id}-timeLeft`, newValue);
                        return newValue;
                      },
                    },
                });
            }else{
                clearInterval(intervalId)
                client.cache.modify({
                    id: client.cache.identify({ __typename: "Timer", id: timer.id }), 
                    fields: {
                        timeLeft() {
                            localStorage.setItem(`timer-${timer.id}-timeLeft`, 0);
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
    
    function formatTimeWithUnits(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      const parts = [];
      if (hrs > 0) parts.push(`${hrs} hrs`);
      if (mins > 0) parts.push(`${mins} mins`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs} secs`);
      
      return parts.join(', ');
    }

    if (timersLoading) return <p>Loading timers...</p>;
    if (errorGettingTimers) return <p>Error fetching timers: {error.message}</p>;
    if (resetLoading) return <p>Reseting Timer... </p>

    
    return (
    <Card shadow="sm" padding="xl" radius="md" withBorder style={{ maxWidth: '80%', margin: '0 auto' }}>
        <Stack align="center" spacing="xl">
            {/* Main Timer Display */}
            <Text 
                size="8rem" 
                fw={700} 
                align="center" 
                style={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                }}
            >
                {formatTime(timer.timeLeft)}
            </Text>

            {/* Main Control Buttons */}
            <Button 
                size="xl" 
                radius="md" 
                fullWidth
                variant="filled" 
                color="blue" 
                onClick={handlePause}
                mb="md"
                style={{ maxWidth: '300px' }}
            >
                {timer.isPaused ? "Resume" : "Pause"}
            </Button>

            {/* Secondary Buttons */}
            <Group justify="center" grow style={{ maxWidth: '300px', width: '100%' }}>
                <Button 
                    variant="light" 
                    color="red" 
                    onClick={() => 
                        openModal(
                            <ResetTimerModal 
                                onConfirm={handleResetConfirm}
                            />
                        )
                    }
                >
                    Reset Timer
                </Button>
                <Button 
                    variant="light" 
                    color="red" 
                    onClick={() => {
                        if (studySessionId) {
                            openModal(<EndStudySessionModal studySessionId={studySessionId} studiedTime = {timerData.totalTime - timerData.timeLeft}/>);
                        } else {
                            console.error("Could not find associated study session");
                        }
                    }}
                >
                    End Session
                </Button>
            </Group>

            {/* Break Information */}
            <Card withBorder shadow="sm" p="md" radius="md" style={{ width: '100%', marginTop: '2rem' }}>
                <Stack align="center" spacing="md">
                    <Title order={4}>Current Break Started</Title>
                    <Text size="lg" c={timer.currentBreak ? "blue" : "dimmed"}>
                        {timer.currentBreak
                            ? new Date(Number(timer.currentBreak.pausedTime)).toLocaleTimeString()
                            : "No current break"}
                    </Text>
                </Stack>
            </Card>

            {/* Break Log */}
            <Card withBorder shadow="sm" p="md" radius="md" style={{ width: '100%' }}>
                    <Group position="apart" mb="xs">
                        <Title order={4}>Break Log</Title>
                        <Button 
                            variant="subtle" 
                            compact
                            rightIcon={breakLogVisible ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                            onClick={() => setBreakLogVisible(!breakLogVisible)}
                        >
                            {breakLogVisible ? "Hide" : "Show"}
                        </Button>
                    </Group>
                    
                    <Collapse in={breakLogVisible}>
                        {timer.log.length > 0 ? (
                            <List spacing="md" center style={{ width: '100%' }}>
                                {timer.log.map(breakObj => (
                                    <List.Item 
                                        key={breakObj.id}
                                        style={{ 
                                            textAlign: 'center',
                                            fontSize: '1rem',
                                            padding: '8px',
                                            borderBottom: '1px solid #eee'
                                        }}
                                    >
                                        <Text>
                                            {new Date(Number(breakObj.pausedTime)).toLocaleTimeString()}
                                            {" → "}
                                            {new Date(Number(breakObj.resumedTime)).toLocaleTimeString()}
                                        </Text>
                                        <Text size="sm" c="dimmed" mt={4}>
                                            Duration: {formatTimeWithUnits(breakObj.elapsedTime)}
                                        </Text>
                                    </List.Item>
                                ))}
                            </List>
                        ) : (
                            <Text c="dimmed">No breaks yet</Text>
                        )}
                    </Collapse>
                </Card>
        </Stack>
    </Card>
    )
}