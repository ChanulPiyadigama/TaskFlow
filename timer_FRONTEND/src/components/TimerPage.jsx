import { useParams } from "react-router-dom";
import Timer from "./Timer";
export default function TimerPage() {
    const { id } = useParams();
    //check cache for results from get timers query, finds all timers we got, then search for the one with the 
    //matching id, which is the one that should be displayed on this particular route


    return (
        <div>
            <Timer timerID ={id}/>
        </div>
      );
}