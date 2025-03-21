import Timer from "./Timer"
import { useQuery } from "@apollo/client"
import { GET_USER_TIMERS } from "../queries"

export default function TimerList() {
    //sends a query to get users timer objects which it will save to the cache
    const { data, loading, error } = useQuery(GET_USER_TIMERS)

    //will run on first render 
    if (loading) return <p>Loading...</p>
    //will run on second render if there is an error (will be no data)
    if (error) return <p>Error: {error.message}</p>

    //we get data, component rerenders and then we render timer componenets that recieve the timer object
    const timerList = data.getUserTimers.map(timer => (

        <Timer key={timer.id} timer={timer} />
    ))

    return (
        <div>
            <h1>TimerList</h1>
            {timerList}
        </div>
    )
}
