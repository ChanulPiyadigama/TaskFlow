import { useQuery } from "@apollo/client"
import { GET_USER_FRIENDS } from "../queries"
import { IncomingFriendRequests } from "./IncomingFriendRequests"
import { OutgoingFriendRequests } from "./OutgoingFriendRequests"
import AddFriend from "./AddFriend"
import { Tabs, Text, Loader, Paper } from "@mantine/core"
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
                    {dataUserFriends?.getUserFriends.map((friend) => (
                        <Text key={friend.id}>
                            Name: {friend.name} | Username: {friend.username}
                        </Text>
                    ))}
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