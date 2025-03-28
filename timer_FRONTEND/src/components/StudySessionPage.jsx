import { useParams } from "react-router-dom";
import Timer from "./Timer";
import { GET_STUDY_SESSION_BYID } from "../queries";
import { useQuery } from "@apollo/client";

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

    if(loadingStudySession) return <p>Loading...</p>
    
    const studySession = dataStudySession.getSpecificStudySession;

    //pass the timer id to the timer component so it can get the timer from the cache
    return (
        <div>
            <h1>{studySession.title}</h1>
            <Timer timerID = {studySession.timer.id}/>
        </div>
      );
}