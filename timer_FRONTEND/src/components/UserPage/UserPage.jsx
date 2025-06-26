import { useAuth } from "../../context/AuthContext";
import { Container, Title, Paper, Text, Group, Button, Tabs, Loader, Alert } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { IconPencil, IconUser, IconClock, IconNote, IconLogout, IconExclamationCircle } from "@tabler/icons-react";
import { useState } from "react";
import UserPageAbout from "./UserPageAbout";
import UserPagePosts from "./UserPagePosts";
import UserPageStudySessions from "./UserPageStudySessions";
import { GET_USERINFO_BYID } from "../../data/queries";
import { useQuery, useApolloClient } from "@apollo/client";
import { useModal } from "../../context/ModalContext";
import { EditUserDetails } from "../Auth/EditUserDetails";

export default function UserPage() {
    const { user: currentUser, setToken, setUser } = useAuth();
    const {userId} = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about');
    const {openModal} = useModal();
    const client = useApolloClient();

    // Add handleLogout function
    const handleLogout = async () => {
        try{
            await client.clearStore()
            setToken(null);
            setUser(null);
            localStorage.removeItem('user-token');
            navigate('/login');
        }catch (error) {
            console.error('Error during logout:', error);
            setToken(null);
            setUser(null);
            localStorage.removeItem('user-token');
            navigate('/login');
        }
    };

    //we use usequery since user might come to this route directly, even through if its through search 
    //some user data would already be in cache 
    const { data: userData, loading: loadingUserData, error: errorUserData} = useQuery(GET_USERINFO_BYID,{
        variables: {
            userId: userId
        },
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

    
    const user = userData?.getUserInfoById;

    return (
        <Container size="lg" py="xl">
            {/* Profile Header Section */}
            <Paper shadow="sm" p="xl" radius="md" mb="lg">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>{user.name}</Title>
                        <Text size="lg" c="dimmed">@{user.username}</Text>
                    </div>
                    
                    {/* Show buttons only for current user */}
                    {userId === currentUser.id && (
                        <Group spacing="sm">
                            <Button 
                                leftSection={<IconPencil size={14} />}
                                variant="light"
                                onClick={() => openModal(<EditUserDetails/>)}
                            >
                                Edit Profile
                            </Button>
                            <Button 
                                leftSection={<IconLogout size={14} />}
                                variant="light"
                                color="red"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </Group>
                    )}
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
                        {userId === currentUser.id && (
                            <Tabs.Tab 
                                value="sessions" 
                                leftSection={<IconClock size={14} />}
                            >
                                Study Sessions
                            </Tabs.Tab>
                        )}
                        <Tabs.Tab 
                            value="posts" 
                            leftSection={<IconNote size={14} />}
                        >
                            Posts
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="about" p="md">
                        <UserPageAbout displayedUser ={user}/>
                    </Tabs.Panel>

                    {userId === currentUser.id && (
                        <Tabs.Panel value="sessions" p="md">
                            <UserPageStudySessions/>
                        </Tabs.Panel>
                    )}

                    <Tabs.Panel value="posts" p="md">
                        <UserPagePosts displayedUserId = {user.id}/>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Container>
    );
}