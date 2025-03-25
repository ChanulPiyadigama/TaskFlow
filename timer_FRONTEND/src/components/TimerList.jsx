import Timer from "./Timer"
import { useQuery } from "@apollo/client"
import { GET_USER_TIMERS } from "../queries"
import { useNavigate } from "react-router-dom"


//this componenet displays all the timers that the user has, and pressing contiune opens the studypage
//with that timer's ID 
//the usequery subscirbed the timerlist to the timers in the cache, but since the timer is on a different route
//this will be unmounted and so wont rerender on every second change for example. But it will grab the new cahnged
//timer from cache when we remount it. 
export default function TimerList() {
    const { data, loading, error } = useQuery(GET_USER_TIMERS)
    const navigate = useNavigate()
    //will run on first render 
    if (loading) return <p>Loading...</p>
    //will run on second render if there is an error (will be no data)
    if (error) return <p>Error: {error.message}</p>

    const timerList = data.getUserTimers.map((timer) => (
      //pass id of timer to the study page to get timer from cache
        <li key={timer.id}>
          <label>
            Time Left: {timer.timeLeft} seconds
          </label>
          <button onClick={() => navigate(`timer/${timer.id}`)}>Continue</button>
        </li>
    ));
    
    return (
        <div>
          <h1>Previous Study Sessions</h1>
          <ul>{timerList}</ul>
        </div>
    );
}
