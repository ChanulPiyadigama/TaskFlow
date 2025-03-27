import { useQuery } from "@apollo/client"
import { GET_USER_OUTGOING_FRIEND_REQUESTS } from "../queries"

export const OutgoingFriendRequests = () => {
    const {loading: loadingOutgoingFriendRequests, data: dataOutgoingFriendRequests, error: errorOutgoingFriendRequests} = useQuery(GET_USER_OUTGOING_FRIEND_REQUESTS)

    if(loadingOutgoingFriendRequests) return <p>Loading...</p>
    if(errorOutgoingFriendRequests) return <p>Error...</p>
    return(
        <div>
            <h4>Outgoing</h4>
            <ul>
                {dataOutgoingFriendRequests.getUserOutgoingFriendRequests.map((friendReq) => (
                    <li key={friendReq.id}>
                        To: {friendReq.name}
                        Username: {friendReq.username}
                    </li>
                ))}
            </ul>
        </div>
        
    )
}