import { GET_USER_INCOMING_FRIEND_REQUESTS, HANDLE_FRIEND_REQUEST, GET_USER_FRIENDS } from "../queries"
import { useQuery, useMutation } from "@apollo/client"


/*

This componenet displays all incoming friends reqs and allows the user to accept or decline them.

The displayed requests are refetched when action is taken so the update is immediate. Friends are also
refetched so when user goes to friend component they can see the new friend, since the query in that 
componenet will read of the cache unless it is refetched. (1)

*/
export const IncomingFriendRequests = () => {
    const {loading: loadingIncomingFriendRequests, data: dataIncomingFriendRequests, error: errorIncomingFriendRequests} = useQuery(GET_USER_INCOMING_FRIEND_REQUESTS)
    const [handleFriendRequest] = useMutation(HANDLE_FRIEND_REQUEST, {
        onError: (error) => {
            console.error("Error accepting friend request:", error)
        },
        refetchQueries: [
            //(1)
            { query: GET_USER_INCOMING_FRIEND_REQUESTS },
            { query: GET_USER_FRIENDS }
        ]
    })

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
                        <button onClick={() => handleFriendRequest({variables: {senderId: friendReq.id, action: true}})}>Accept</button>
                        <button onClick={() => handleFriendRequest({variables: {senderId: friendReq.id, action: false}})}>Decline</button>
                    </li>
                    
                ))}
            </ul>
        </div>
        
    )
}