import { Button, Group, Stack, Text, Title, Paper, Loader, Alert } from '@mantine/core';
import { IconTrophy, IconShare, IconAlertCircle } from '@tabler/icons-react';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import StudySessionPostForm from '../CreatingUserPost/StudySessionPostFrom';
import { useGetStudySessionById } from '../HelperFunctions/getStudySessionByID';

export default function PostCompletedStudySessionModalConfirmation({studySessionId }) {
    const { closeModal, openModal } = useModal();
    const navigate = useNavigate();

    const { studySession, loading: loadingStudySession, error: errorStudySession } = useGetStudySessionById(studySessionId);

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
        openModal(<StudySessionPostForm  preSelectedSessionId={studySessionId}/>); 
    };

    const handleSkip = () => {
        closeModal();
        navigate('/'); 
    };

    if (loadingStudySession) {
        return (
            <Stack align="center" spacing="lg" p="md">
                <Loader size="lg" />
                <Text>Loading session details...</Text>
            </Stack>
        );
    }


    if (errorStudySession) {
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

            {studySession.title && (
                <Text size="md" fw={500} ta="center">
                    "{studySession.title}"
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
                        {formatTime(studySession.studiedTime)}
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
                    disabled= {loadingStudySession}
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