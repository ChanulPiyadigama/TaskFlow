import { GET_USER_INCOMING_FRIEND_REQUESTS, HANDLE_FRIEND_REQUEST, GET_USER_FRIENDS } from "../queries"
import { useQuery, useMutation } from "@apollo/client"
import { 
  Text, 
  Stack, 
  Card, 
  Group, 
  Avatar, 
  Button, 
  Title,
  Loader,
  Paper
} from "@mantine/core";
import { IconUserCheck } from "@tabler/icons-react";


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
    const requests = dataIncomingFriendRequests.getUserIncomingFriendRequests;

    return (
        <Paper p="md" withBorder>
            <Group mb="md">
                <IconUserCheck size={20} />
                <Title order={4}>Incoming Friend Requests</Title>
            </Group>

            {requests.length === 0 ? (
                <Text c="dimmed" size="sm">No incoming friend requests</Text>
            ) : (
                <Stack spacing="xs">
                    {requests.map((friendReq) => (
                        <Card key={friendReq.id} withBorder shadow="sm" p="sm">
                            <Group position="apart">
                                <Group>
                                    <Avatar 
                                        src={null} 
                                        color="blue" 
                                        radius="xl"
                                    >
                                        {friendReq.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <Text fw={500}>{friendReq.name}</Text>
                                        <Text size="xs" c="dimmed">@{friendReq.username}</Text>
                                    </div>
                                </Group>
                                <Group spacing="xs">
                                    <Button 
                                        variant="filled" 
                                        color="green" 
                                        size="xs"
                                        onClick={() => handleFriendRequest({
                                            variables: {senderId: friendReq.id, action: true}
                                        })}
                                    >
                                        Accept
                                    </Button>
                                    <Button 
                                        variant="light" 
                                        color="red" 
                                        size="xs"
                                        onClick={() => handleFriendRequest({
                                            variables: {senderId: friendReq.id, action: false}
                                        })}
                                    >
                                        Decline
                                    </Button>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            )}
        </Paper>
    );
}