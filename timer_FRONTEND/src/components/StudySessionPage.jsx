import { useParams } from "react-router-dom";
import Timer from "./Timer";
import { GET_STUDY_SESSION_BYID } from "../queries";
import { useQuery } from "@apollo/client";

export default function StudySessionPage() {

    //check cache for results from get timers query, finds all timers we got, then search for the one with the 
    //matching id, which is the one that should be displayed on this particular route
    const {id} = useParams();

    const { loading: loadingStudySession, data: dataStudySession, error: errorStudySession } = useQuery(GET_STUDY_SESSION_BYID, {
        variables: { studySessionId: id },
        onCompleted: (dataStudySession) => {
            console.log("Study session data:", dataStudySession.getSpecificStudySession);
        },
        onError: (errorStudySession) => {
            console.error("Error getting study session:", errorStudySession);
        }
    });

    if(loadingStudySession) return <p>Loading...</p>
    
    const studySession = dataStudySession.getSpecificStudySession;

    return (
        <div>
            <h1>{studySession.title}</h1>
            <Timer timerID = {studySession.timer.id}/>
        </div>
      );
}