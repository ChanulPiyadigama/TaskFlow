import { useQuery } from '@apollo/client';
import { GET_ALL_USER_STUDY_SESSIONS } from '../../data/queries';
import { 
    Loader, 
    Text, 
    Stack, 
    Card, 
    Group, 
    Button, 
    Title,
    Collapse,
    Paper
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconChevronDown, IconChevronUp, IconClock } from '@tabler/icons-react';
import { useState } from 'react';

export default function UserPageStudySessions() {
    const navigate = useNavigate();
    const [activeListVisible, setActiveListVisible] = useState(false);
    const [completedListVisible, setCompletedListVisible] = useState(false);

    const { loading, error, data } = useQuery(GET_ALL_USER_STUDY_SESSIONS);

    if (loading) return <Loader />;
    if (error) return <Text c="red">Error loading study sessions</Text>;

    const studySessions = data?.getUserStudySessions || [];

    // Split and sort sessions
    const activeSessions = studySessions
        .filter(session => !session.studiedTime || session.studiedTime <= 0)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)));

    const completedSessions = studySessions
        .filter(session => session.studiedTime > 0)
        .sort((a, b) => new Date(parseInt(b.lastInteraction)) - new Date(parseInt(a.lastInteraction)));

    const SessionCard = ({ session, isCompleted }) => (
        <Card 
            withBorder
            shadow="sm"
            radius="md"
            mb="sm"
            onClick={() => navigate(`/StudySession/${session.id}`)}
            style={{ cursor: 'pointer' }}
            sx={{
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateX(8px)'
                }
            }}
        >
            <Group position="apart" align="center">
                <Stack spacing={4}>
                    <Text fw={500}>{session.title}</Text>
                    {session.description && (
                        <Text size="sm" c="dimmed" lineClamp={1}>
                            {session.description}
                        </Text>
                    )}
                </Stack>
                <Group spacing="xs">
                    <IconClock size={16} />
                    <Text size="sm" c="dimmed">
                        {isCompleted 
                            ? `${Math.floor(session.studiedTime / 60)}m ${session.studiedTime % 60}s`
                            : `${Math.floor(session.timer.timeLeft / 60)}m ${session.timer.timeLeft % 60}s left`
                        }
                    </Text>
                </Group>
            </Group>
        </Card>
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
                    sessions.map(session => (
                        <SessionCard 
                            key={session.id} 
                            session={session} 
                            isCompleted={isCompleted}
                        />
                    ))
                ) : (
                    <Text c="dimmed" ta="center">No {title.toLowerCase()} found</Text>
                )}
            </Collapse>
        </Paper>
    );

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
                sessions={completedSessions}
                isVisible={completedListVisible}
                setIsVisible={setCompletedListVisible}
                isCompleted={true}
            />
        </Stack>
    );
}