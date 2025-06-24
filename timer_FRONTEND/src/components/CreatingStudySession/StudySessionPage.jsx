import { useParams } from "react-router-dom";
import Timer from "../Timer/Timer";
import { useGetStudySessionById } from "../HelperFunctions/getStudySessionByID";
import { useMutation } from "@apollo/client";
import { useEffect } from "react";
import { UPDATE_STUDY_SESSION_INTERACTION_TIME } from "../../data/queries";
import { Loader, Stack, Title } from "@mantine/core";
export default function StudySessionPage() {

    //usequery to get a specific study session by id from route params, this is because if the user was to refresh,
    //or to go directly to this route, we would need to get the study session from the network since this componenet will be the first to mount 
    const {id} = useParams();

    const { studySession, loading: loadingStudySession, error: errorStudySession } = useGetStudySessionById(id);


    const [updateInteraction] = useMutation(UPDATE_STUDY_SESSION_INTERACTION_TIME, {
        onError: (error) => {
            console.error("Error updating interaction time:", error);
        }
    });

    //when page loads, add an event listenr to update latest iteraction time to the db when the user
    //leaves the page thruogh either leaving app, or going to another route
    useEffect(() => {
        const updateInteractionTime = () => {
            updateInteraction({
                variables: {
                    studySessionId: id,
                    newTime: new Date().toISOString()
                }
            });
        };
        
        window.addEventListener("beforeunload", updateInteractionTime);
        
        // Cleanup: remove listener, and update interaction time when the component unmounts
        //so when user goes back to the previous/other page, the interaction time is updated
        return () => {
            updateInteractionTime();
            window.removeEventListener("beforeunload", updateInteractionTime);
        };
    }, [id, updateInteraction]);

    if(loadingStudySession) return <Loader />;
    if(errorStudySession) return <p>Error...</p>
    
    //pass the timer id to the timer component so it can get the timer from the cache
    return (
        <Stack align="center" spacing="xl" style={{ width: '100%' }}>
            <Title 
                order={1} 
                ta="center"
                style={{ 
                    maxWidth: '80%',
                    wordWrap: 'break-word'
                }}
            >
                {studySession.title}
            </Title>
            <Timer timerID={studySession.timer.id}/>
        </Stack>
    );
}