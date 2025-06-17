import { GET_ALL_USER_STUDY_SESSIONS } from "../../data/queries";
import { useQuery } from "@apollo/client";
import { List, Loader, Text, Title, Paper, Stack, Group, Button } from "@mantine/core";
import { IconClock, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PreviousStudySessionsList() {
    const { loading: loadingStudySessions, data: dataStudySessions, error: errorStudySessions } = useQuery(GET_ALL_USER_STUDY_SESSIONS);
    const navigate = useNavigate();
    const { user } = useAuth(); 
    //mantine loader, deafult to small spinner
    if (loadingStudySessions) return <Loader />;
    if (errorStudySessions) return <Text c="red">Error loading study sessions</Text>;

    //safety check for dataStudySessions, if null or undefined, return empty array, so map wont break
    //sort then extract, also use a new array to avoid mutating the original array
    const userStudySessions = dataStudySessions?.getUserStudySessions || [];

    // Split sessions into active and completed
    const activeSessions = userStudySessions
        .filter(session => !session.studiedTime || session.studiedTime <= 0)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)))
        .slice(0, 5);

    const completedSessions = userStudySessions
        .filter(session => session.studiedTime > 0)
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
                                onClick={isCompleted ? undefined : () => navigate(`/StudySession/${session.id}`)}
                            >
                                <Group position="apart" mb="xs">
                                    <Text size="sm" fw={500}>{session.title}</Text>
                                    <Group spacing="xs">
                                        <IconClock size={16} />
                                        <Text size="sm" c="dimmed">
                                            {session.studiedTime > 0 
                                                ? `${Math.floor(session.studiedTime / 60)}m ${session.studiedTime % 60}s`
                                                : `${session.timer.timeLeft}s left`
                                            }
                                        </Text>
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
            <SessionList sessions={completedSessions} title="Completed Study Sessions" />
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