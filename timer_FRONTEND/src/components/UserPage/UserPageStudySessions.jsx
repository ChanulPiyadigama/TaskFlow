import { useQuery} from '@apollo/client';
import { GET_ALL_USER_STUDY_SESSIONS, DELETE_STUDY_SESSION_BY_ID } from '../../data/queries';
import { 
    Loader, 
    Text, 
    Stack, 
    Group, 
    Button, 
    Title,
    Collapse,
    Paper,
    Menu,
    ActionIcon,
    Grid,
    Center
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconChevronDown, IconChevronUp, IconClock, IconDots, IconTrash, IconShare } from '@tabler/icons-react';
import { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import StudySessionPostForm from '../CreatingUserPost/StudySessionPostFrom';
import { useDeleteStudySession } from '../HelperFunctions/deleteStudySessionById';
import { useDeletePostById } from '../HelperFunctions/deletePostById';


//shows all the study sessions split into active, unposted, and posted, use state to toggle visibility of each section

export default function UserPageStudySessions() {
    const navigate = useNavigate();
    const { openModal } = useModal();
    const [activeListVisible, setActiveListVisible] = useState(false);
    const [completedListVisible, setCompletedListVisible] = useState(false);
    const [postedListVisible, setPostedListVisible] = useState(false);
    const { handleDeletePost, loadingDeletingPost, deletePostError } = useDeletePostById();

    const { loading, error, data } = useQuery(GET_ALL_USER_STUDY_SESSIONS);
    const { handleDeleteSession, deleteLoading } = useDeleteStudySession();

    const handlePostSession = (sessionId) => {
        openModal(<StudySessionPostForm preSelectedSessionId={sessionId}/>);
    };

    if (loading) return <Loader />;
    if (error) return <Text c="red">Error loading study sessions</Text>;

    const studySessions = data?.getUserStudySessions || [];

    // Split and sort sessions
    const activeSessions = studySessions
        .filter(session => session.studiedTime < 0)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)));

    const unpostedSessions = studySessions
        .filter(session => session.studiedTime >= 0 && !session.postedID)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)));

    const postedSessions = studySessions
        .filter(session => session.studiedTime >= 0 && session.postedID)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)));


    const handleOnClickSession = (session) =>{
        if (session.studiedTime >= 0 && !session.postedID) {
            handlePostSession(session.id);
        } else if (session.studiedTime < 0) {
            navigate(`/StudySession/${session.id}`);
        } else{
            null
        }
    }
    const SessionCard = ({ session, isCompleted }) => (
        <Paper
            shadow="xs"
            p="md"
            radius="md"
            withBorder
            mb="lg"
            sx={{
                cursor: isCompleted ? "pointer" : "pointer",
                transition: "transform 0.1s ease-in-out",
                "&:hover": { transform: "scale(1.02)" }, 
                opacity: isCompleted ? 0.7 : 1, 
            }}
            onClick={() => handleOnClickSession(session)}
        >
            <Group position="apart" mb="xs">
                <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1, marginRight: '8px' }}>
                    {session.title}
                </Text>
                <Group spacing="xs" style={{ flexShrink: 0 }}>
                    <IconClock size={16} />
                    <Text size="sm" c="dimmed">
                        {session.studiedTime > 0 
                            ? `${Math.floor(session.studiedTime / 60)}m ${session.studiedTime % 60}s`
                            : `${session.timer.timeLeft}s left`
                        }
                    </Text>
                    <Menu shadow="md" width={120}>
                        <Menu.Target>
                            <ActionIcon 
                                variant="subtle" 
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <IconDots size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {(!session.postedID) && <Menu.Item 
                                leftSection={<IconTrash size={14} />} 
                                color="red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(session.id);
                                }}
                            >
                                Delete
                            </Menu.Item>}
                            {(session.studiedTime >= 0 && session.postedID) && <Menu.Item 
                                leftSection={<IconTrash size={14} />} 
                                color="red"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(session.postedID.id);
                                }}
                            >
                                Delete Post
                            </Menu.Item>}
                            {(session.studiedTime >= 0 && !session.postedID) && <Menu.Item 
                                leftSection={<IconShare size={14} />} 
                                color="violet"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePostSession(session.id);
                                }}
                            >
                                Post
                            </Menu.Item>}

                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
            {session.description && (
                <Text size="xs" c="dimmed" lineClamp={2}>
                    {session.description}
                </Text>
            )}
        </Paper>
    );

    const ListSection = ({ title, sessions, isVisible, setIsVisible, isCompleted }) => (
        <Paper withBorder p="md" radius="md" mb="md">
            <Group position="apart" mb="md">
                <Title order={3}>{title}</Title>
                <Button 
                    variant="subtle" 
                    onClick={() => setIsVisible(!isVisible)}
                    rightSection={isVisible ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                >
                    {isVisible ? 'Hide' : 'Show'}
                </Button>
            </Group>
            
            <Collapse in={isVisible}>
                {sessions.length > 0 ? (
                    <Grid gutter="md">
                        {sessions.map(session => (
                            <Grid.Col key={session.id} span={6}>
                                <SessionCard 
                                    session={session} 
                                    isCompleted={isCompleted}
                                />
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : (
                    <Text c="dimmed" ta="center">No {title.toLowerCase()} found</Text>
                )}
            </Collapse>
        </Paper>
    );

    if (loading || deleteLoading) {
        return (
            <Center h={300}>
                <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text size="sm" c="dimmed">Loading study sessions...</Text>
                </Stack>
            </Center>
        );
    }

    if (error) {
        return (
            <Center h={200}>
                <Stack align="center" gap="md">
                    <Text c="red" size="sm">
                        Error loading study sessions: {error.message}
                    </Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Stack>
            <ListSection 
                title="Active Study Sessions"
                sessions={activeSessions}
                isVisible={activeListVisible}
                setIsVisible={setActiveListVisible}
                isCompleted={false}
            />
            <ListSection 
                title="Completed Study Sessions"
                sessions={unpostedSessions}
                isVisible={completedListVisible}
                setIsVisible={setCompletedListVisible}
                isCompleted={true}
            />
            <ListSection 
                title="Posted Study Sessions"
                sessions={postedSessions}
                isVisible={postedListVisible}
                setIsVisible={setPostedListVisible}
                isCompleted={true}
            />
        </Stack>
    );
}