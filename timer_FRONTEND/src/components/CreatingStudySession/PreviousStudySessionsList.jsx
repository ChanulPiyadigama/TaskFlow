import { GET_ALL_USER_STUDY_SESSIONS } from "../../data/queries";
import { useQuery } from "@apollo/client";
import { List, Loader, Text, Title, Paper, Stack, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconClock } from '@tabler/icons-react';

export default function PreviousStudySessionsList() {
    const { loading: loadingStudySessions, data: dataStudySessions, error: errorStudySessions } = useQuery(GET_ALL_USER_STUDY_SESSIONS);
    const navigate = useNavigate();

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
        <Stack mb="xl">
            <Title order={2} mb="md">
                {title}
            </Title>
            <List spacing="sm" styles={{ itemWrapper: { listStyleType: "none" } }}>
                {sessions.length > 0 ? (
                    sessions.map((session) => (
                        <Paper
                            key={session.id}
                            shadow="xs"
                            p="md"
                            radius="md"
                            withBorder
                            mb="lg"
                            sx={{
                                cursor: "pointer",
                                transition: "transform 0.1s ease-in-out",
                                "&:hover": { transform: "scale(1.02)" },
                            }}
                            onClick={() => navigate(`/StudySession/${session.id}`)}
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
                    ))
                ) : (
                    <Text c="dimmed" size="sm">No {title.toLowerCase()} found</Text>
                )}
            </List>
        </Stack>
    );

    return (
        <div>
            <SessionList sessions={activeSessions} title="Active Study Sessions" />
            <SessionList sessions={completedSessions} title="Completed Study Sessions" />
        </div>
    );
}