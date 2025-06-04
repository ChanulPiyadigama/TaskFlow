import { useQuery } from "@apollo/client"
import { GET_USER_FRIENDS } from "../../data/queries"
import { IncomingFriendRequests } from "./IncomingFriendRequests"
import { OutgoingFriendRequests } from "./OutgoingFriendRequests"
import AddFriend from "./AddFriend"
import { 
    Tabs, Text, Loader, Paper, Card, 
    Group, Avatar, Stack, Button 
} from "@mantine/core"
import { IconUsers, IconUserPlus, IconUserCheck, IconUserExclamation } from "@tabler/icons-react"

export default function Friends() {
    const {loading: loadingUserFriends, data: dataUserFriends, error: errorUserFriends} = useQuery(GET_USER_FRIENDS)

    if(loadingUserFriends) return <Loader />
    if(errorUserFriends) return <Text c="red">Error loading friends</Text>

    //tabs work like a switch statement, only one tab is shown at a time based on state, in this case
    //we set a defaultValue and tabs handles it own state inside, so we dont need to set it in state
    //when you click a tabs.tab (which are the labels) it will set the value to the value of the tab
    //causing a rerender and showing the correct tab
    return (
        <Paper shadow="sm" radius="md">
            <Tabs defaultValue="friends">
                <Tabs.List>
                    <Tabs.Tab
                        value="friends"
                        leftSection={<IconUsers size={14} />}
                    >
                        Friends
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="incoming"
                        leftSection={<IconUserCheck size={14} />}
                    >
                        Incoming Requests
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="outgoing"
                        leftSection={<IconUserExclamation size={14} />}
                    >
                        Outgoing Requests
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="addFriend"
                        leftSection={<IconUserPlus size={14} />}
                    >
                        Add Friend
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="friends" p="md">
                    {dataUserFriends?.getUserFriends.length > 0 ? (
                        <Stack spacing="xs">
                            {dataUserFriends.getUserFriends.map((friend) => (
                                <Card key={friend.id} withBorder shadow="sm" p="sm">
                                    <Group position="apart">
                                        <Group>
                                            <Avatar 
                                                src={null} 
                                                color="blue" 
                                                radius="xl"
                                            >
                                                {friend.name.charAt(0)}
                                            </Avatar>
                                            <div>
                                                <Text fw={500}>{friend.name}</Text>
                                                <Text size="xs" c="dimmed">@{friend.username}</Text>
                                            </div>
                                        </Group>
                                        <Button 
                                            variant="subtle" 
                                            color="blue" 
                                            size="xs"
                                        >
                                            View Profile
                                        </Button>
                                    </Group>
                                </Card>
                            ))}
                        </Stack>
                    ) : (
                        <Paper p="md" withBorder>
                            <Stack align="center" spacing="sm">
                                <IconUsers size={32} color="gray" />
                                <Text c="dimmed" size="sm">No friends yet</Text>
                                <Text size="xs" c="dimmed">Add friends to see them here</Text>
                            </Stack>
                        </Paper>
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="incoming" p="md">
                    <IncomingFriendRequests />
                </Tabs.Panel>

                <Tabs.Panel value="outgoing" p="md">
                    <OutgoingFriendRequests />
                </Tabs.Panel>

                <Tabs.Panel value="addFriend" p="md">
                    <AddFriend />
                </Tabs.Panel>
            </Tabs>
        </Paper>
    )
}