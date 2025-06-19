import { Button, Group, Stack, Text, Title, Paper, Loader, Alert } from '@mantine/core';
import { IconTrophy, IconShare, IconAlertCircle } from '@tabler/icons-react';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import StudySessionPostForm from '../CreatingUserPost/StudySessionPostFrom';
import { GET_STUDY_SESSION_BYID } from '../../data/queries';
import { useQuery } from '@apollo/client';

export default function PostCompletedStudySessionModalConfirmation({ studiedTime, studySessionId }) {
    const { closeModal, openModal } = useModal();
    const navigate = useNavigate();

    const { data: studySessionData, loading, error } = useQuery(GET_STUDY_SESSION_BYID, {
        variables: { studySessionId : studySessionId },
        fetchPolicy: 'cache-first',
        onError: (error) => {
            console.error('Error fetching study session data:', error.message);
        }
    });

    // Format the studied time for display
    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const handlePostSession = () => {
        closeModal(); 
        openModal(<StudySessionPostForm  preSelectedSession={studySessionId}/>); 
    };

    const handleSkip = () => {
        closeModal();
        navigate('/'); 
    };
    console.log("Study session data:", studySessionData);

    if (loading) {
        return (
            <Stack align="center" spacing="lg" p="md">
                <Loader size="lg" />
                <Text>Loading session details...</Text>
            </Stack>
        );
    }


    if (error) {
        return (
            <Stack align="center" spacing="lg" p="md">
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                    Error loading session details
                </Alert>
                <Button onClick={handleSkip}>Go to Homepage</Button>
            </Stack>
        );
    }

    return (
        <Stack align="center" spacing="xl" p="md">
            <IconTrophy size={64} color="#9370DB" />
            
            <Title order={2} ta="center" c="#9370DB">
                Congratulations!
            </Title>
            
            <Text size="lg" ta="center" c="dimmed">
                You've successfully completed your study session
            </Text>

            {studySessionData.title && (
                <Text size="md" fw={500} ta="center">
                    "{studySessionData.title}"
                </Text>
            )}

            <Paper 
                p="lg" 
                withBorder 
                style={{ 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#9370DB',
                    borderWidth: '2px'
                }}
            >
                <Stack align="center" spacing="xs">
                    <Text size="sm" c="dimmed" ta="center">
                        Total Study Time:
                    </Text>
                    <Text size="2rem" fw={700} c="#9370DB" ta="center">
                        {formatTime(studiedTime)}
                    </Text>
                </Stack>
            </Paper>

            <Text size="md" ta="center" c="dimmed" maw={400}>
                Would you like to share your achievement with your friends by creating a post?
            </Text>

            <Group spacing="md" mt="md">
                <Button 
                    variant="light" 
                    color="gray" 
                    onClick={handleSkip}
                    size="lg"
                >
                    Skip
                </Button>
                <Button 
                    color="violet" 
                    onClick={handlePostSession}
                    leftSection={<IconShare size={20} />}
                    size="lg"
                    disabled= {loading}
                >
                    Share My Progress
                </Button>
            </Group>

            <Text size="xs" c="dimmed" ta="center" mt="md">
                You can always create a post later from your completed sessions
            </Text>
        </Stack>
    );
}