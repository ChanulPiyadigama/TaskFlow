import { GET_ALL_USER_STUDY_SESSIONS, DELETE_STUDY_SESSION_BY_ID } from "../../data/queries";
import { useQuery, useMutation } from "@apollo/client";
import { List, Loader, Text, Title, Paper, Stack, Group, Button, Menu, ActionIcon } from "@mantine/core";
import { IconClock, IconArrowRight, IconDots, IconTrash, IconShare } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";
import StudySessionPostForm from "../CreatingUserPost/StudySessionPostFrom";
import { useDeleteStudySession } from "../HelperFunctions/deleteStudySessionById";


export default function PreviousStudySessionsList() {
    const { loading: loadingStudySessions, data: dataStudySessions, error: errorStudySessions } = useQuery(GET_ALL_USER_STUDY_SESSIONS);

    
    const { openModal } = useModal();
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const { handleDeleteSession, deleteLoading } = useDeleteStudySession();


    const handlePostSession = (sessionId) => {
        openModal(<StudySessionPostForm preSelectedSessionId={sessionId}/>)
    }


    //mantine loader, deafult to small spinner
    if (loadingStudySessions) return <Loader />;
    if (errorStudySessions) return <Text c="red">Error loading study sessions</Text>;

    //safety check for dataStudySessions, if null or undefined, return empty array, so map wont break
    //sort then extract, also use a new array to avoid mutating the original array
    const userStudySessions = dataStudySessions?.getUserStudySessions || [];

    // Split sessions into active and completed
    const activeSessions = userStudySessions
        .filter(session =>  session.studiedTime < 0)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)))
        .slice(0, 5);

    const unpostedSessions = userStudySessions
        .filter(session => session.studiedTime >= 0 && !session.postedID)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)))
        .slice(0, 5);

    const SessionList = ({ sessions, title }) => (
        <Stack mb="sm">
            <Title order={2} mb="md">
                {title}
            </Title>
            <List spacing="sm" styles={{ itemWrapper: { listStyleType: "none" } }}>
                {sessions.length > 0 ? (
                    sessions.slice(0, 5).map((session) => {
                        const isCompleted = session.studiedTime > 0;
                        
                        return (
                            <Paper
                                key={session.id}
                                shadow="xs"
                                p="md"
                                radius="md"
                                withBorder
                                mb="lg"
                                sx={{
                                    cursor: isCompleted ? "default" : "pointer",
                                    transition: isCompleted ? "none" : "transform 0.1s ease-in-out",
                                    "&:hover": isCompleted ? {} : { transform: "scale(1.02)" }, 
                                    opacity: isCompleted ? 0.7 : 1, 
                                }}
                                onClick={isCompleted 
                                    ? () => handlePostSession(session.id)
                                    : () => navigate(`/StudySession/${session.id}`)
                                }
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
                                                    //stops the click event from propagating to the Paper onClick
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <IconDots size={16} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item 
                                                    leftSection={<IconTrash size={14} />} 
                                                    color="red"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSession(session.id);
                                                    }}
                                                >
                                                    Delete
                                                </Menu.Item>
                                                <Menu.Item 
                                                    leftSection={<IconShare size={14} />} 
                                                    color="violet"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePostSession(session.id);
                                                    }}
                                                >
                                                    Post
                                                </Menu.Item>
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
                    })
                ) : (
                    <Text c="dimmed" size="sm">No {title.toLowerCase()} found</Text>
                )}
            </List>
        </Stack>
    );

    return (
        <Stack>
            <SessionList sessions={activeSessions} title="Active Study Sessions" />
            <SessionList sessions={unpostedSessions} title="Unposted Study Sessions" />
            <Button
                variant="subtle"
                rightSection={<IconArrowRight size={16} />}
                onClick={() => navigate(`/UserPage/${user.id}`)}
                sx={(theme) => ({
                    marginTop: theme.spacing.md,
                    alignSelf: 'center'
                })}
            >
                View All Study Sessions
            </Button>
        </Stack>
    );
}