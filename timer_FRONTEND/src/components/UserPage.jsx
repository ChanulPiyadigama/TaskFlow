import { useAuth } from "../context/AuthContext";
import { Container, Title, Paper, Text, Group, Button, Tabs, Loader, Alert } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { IconPencil, IconUser, IconClock, IconNote } from "@tabler/icons-react";
import { useState } from "react";
import UserPageAbout from "./UserPageAbout";
import UserPagePosts from "./UserPagePosts";
import UserPageStudySessions from "./UserPageStudySessions";
import { GET_USERINFO_BYID } from "../queries";
import { useQuery } from "@apollo/client";

export default function UserPage() {
    const { user: currentUser } = useAuth();
    const {userId} = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about');

    //we use usequery since user might come to this route directly, even through if its through search 
    //some user data would already be in cache 
    const { data: userData, loading: loadingUserData, error: errorUserData} = useQuery(GET_USERINFO_BYID,{
        variables: {
            userId: userId
        },
        skip: userId === currentUser.id, // Skip if the user is the current user
        onError: (error) => {
            console.error('Error fetching user data:', error.message);
        }
        }
    )

    if (loadingUserData) return <Loader/>;
    if (errorUserData) {
        return (
            <Container size="lg" py="xl">
                <Alert 
                    title="Error" 
                    color="red" 
                    variant="filled"
                    icon={<IconExclamationCircle />}
                >
                    {'Failed to load user profile'}
                </Alert>
            </Container>
        );
    }

    
    const user = userId === currentUser.id ? currentUser : userData?.getUserInfoById;
    console.log(user)

    return (
        <Container size="lg" py="xl">
            {/* Profile Header Section */}
            <Paper shadow="sm" p="xl" radius="md" mb="lg">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>{user.name}</Title>
                        <Text size="lg" c="dimmed">@{user.username}</Text>
                    </div>
                    <Button 
                        leftSection={<IconPencil size={14} />}
                        variant="light"
                    >
                        Edit Profile
                    </Button>
                </Group>
            </Paper>

            {/* Tabs Section */}
            <Paper shadow="sm" radius="md">
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab 
                            value="about" 
                            leftSection={<IconUser size={14} />}
                        >
                            About
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="sessions" 
                            leftSection={<IconClock size={14} />}
                        >
                            Study Sessions
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="posts" 
                            leftSection={<IconNote size={14} />}
                        >
                            Posts
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="about" p="md">
                        <UserPageAbout user ={user}/>
                    </Tabs.Panel>

                    <Tabs.Panel value="sessions" p="md">
                        <UserPageStudySessions user ={user}/>
                    </Tabs.Panel>

                    <Tabs.Panel value="posts" p="md">
                        <UserPagePosts user ={user}/>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Container>
    );
}