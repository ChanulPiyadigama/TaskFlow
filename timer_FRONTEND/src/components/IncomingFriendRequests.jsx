import { GET_USER_INCOMING_FRIEND_REQUESTS } from "../queries"
import { useQuery } from "@apollo/client"

export const IncomingFriendRequests = () => {
    const {loading: loadingIncomingFriendRequests, data: dataIncomingFriendRequests, error: errorIncomingFriendRequests} = useQuery(GET_USER_INCOMING_FRIEND_REQUESTS)

    if(loadingIncomingFriendRequests) return <p>Loading...</p>
    if(errorIncomingFriendRequests) return <p>Error...</p>
    return (
        <div>
            <h4>incoming</h4>
            <ul>
                {dataIncomingFriendRequests.getUserIncomingFriendRequests.map((friendReq) => (
                    <li key={friendReq.id}>
                        From: {friendReq.name}
                        Username: {friendReq.username}
                    </li>
                ))}
            </ul>
        </div>
        
    )
}