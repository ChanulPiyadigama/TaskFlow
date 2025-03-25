import { useAuth } from "../context/AuthContext"
import CreateTimerForm from "./CreateTimerFomr"
import Timer from "./Timer"
import TimerList from "./TimerList"

export default function HomePage(){
    //grabs the user from context store that was saved during login

    const {user} = useAuth()
    return (
        <div>
            <h1>Hey {user.user}</h1>
            <CreateTimerForm/>
            <TimerList/>
        </div>
        

        
    )


}