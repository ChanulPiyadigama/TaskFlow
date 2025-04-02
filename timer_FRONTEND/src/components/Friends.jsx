import { data } from "react-router-dom"
import { GET_USER_FRIENDS } from "../queries"
import { useQuery } from "@apollo/client"
import { IncomingFriendRequests } from "./IncomingFriendRequests"
import { OutgoingFriendRequests } from "./OutgoingFriendRequests"
import AddFriend from "./AddFriend"
import { useState } from "react"
export default function Friends(){
    //query to get the user's friends rerendering page to show the user's friends, when one of the buttons are clicked
    //page rerenders and the right content is shown based on the swtichcase determined by activeSection state. 
    const [activeSection, setActiveSection] = useState("friends")
    const {loading: loadingUserFriends, data: dataUserFriends, error: errorUserFriends} = useQuery(GET_USER_FRIENDS)
    
    //switch statement to render the correct content based on the active section
    const renderContent = () => {
        switch (activeSection) {
            case "friends":
                return (
                    <div>
                        <h3>Current Friends</h3>
                        <ul>
                            {dataUserFriends.getUserFriends.map((friend) => (
                                <li key={friend.id}>
                                    Name: {friend.name} | Username: {friend.username}
                                </li>
                            ))}
                        </ul>                    
                    </div>

                );
            case "incoming":
                return <IncomingFriendRequests />;
            case "outgoing":
                return <OutgoingFriendRequests />;
            case "addFriend":
                return <AddFriend />;
            default:
                return null;
        }
    };
    if(loadingUserFriends) return <p>Loading...</p>

    if(errorUserFriends) return <p>Error...</p>

    //each button sets the active content, which switch case chooses 
    return(
        <div>
            <h1>Friends</h1>
            <div>
                <button onClick={() => setActiveSection("friends")}>Friends</button>
                <button onClick={() => setActiveSection("incoming")}>Incoming Requests</button>
                <button onClick={() => setActiveSection("outgoing")}>Outgoing Requests</button>
                <button onClick={() => setActiveSection("addFriend")}>Add Friend</button>
            </div>
            {renderContent()}

        </div>
    )
}