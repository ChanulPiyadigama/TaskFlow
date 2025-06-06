import { useParams } from "react-router-dom";
import Timer from "../Timer/Timer";
import { GET_STUDY_SESSION_BYID } from "../../data/queries";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { UPDATE_STUDY_SESSION_INTERACTION_TIME } from "../../data/queries";
import { Loader } from "@mantine/core";

export default function StudySessionPage() {

    //usequery to get a specific study session by id from route params, this is because if the user was to refresh,
    //or to go directly to this route, we would need to get the study session from the network since this componenet will be the first to mount 
    const {id} = useParams();

    const { loading: loadingStudySession, data: dataStudySession, error: errorStudySession } = useQuery(GET_STUDY_SESSION_BYID, {
        variables: { studySessionId: id },
        onError: (errorStudySession) => {
            console.error("Error getting study session:", errorStudySession);
        }
    });

    const [updateInteraction] = useMutation(UPDATE_STUDY_SESSION_INTERACTION_TIME, {
        onCompleted: (data) => {
            console.log("Interaction time updated:", data.updateStudySessionInteractionDate
            );},

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
    
    const studySession = dataStudySession.getSpecificStudySession;

    //pass the timer id to the timer component so it can get the timer from the cache
    return (
        <div>
            <h1>{studySession.title}</h1>
            <Timer timerID = {studySession.timer.id}/>
        </div>
      );
}