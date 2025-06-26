import { Button, Group, Stack, Text, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useModal } from '../../context/ModalContext';
import { useEndStudySession } from '../HelperFunctions/endStudySession.jsx';

//this modal checks if the user is sure they want to end the study session, if so we send a mutation to the server
//and update both the timer and study session data first in the server, then the client's cache
export default function EndStudySessionModal({studySessionId, studiedTime, timerID}) {
    const { closeModal } = useModal();
    const{endStudySession, loadingStudySessionCompletion, errorStudySessionCompletion} = useEndStudySession();


    const handleEndSession = () => {
        endStudySession({
            studySessionId,
            studiedTime,
            timerID,
            showConfirmationModal: true
        });
    }

    if (loadingStudySessionCompletion) {
        return (
            <Stack align="center" spacing="lg">
                <Loader size="md" />
                <Text size="sm" c="dimmed">Completing study session...</Text>
            </Stack>
        );
    }
    
    return (
        <Stack align="center" spacing="lg">
            {errorStudySessionCompletion && (
                <Alert 
                    icon={<IconAlertCircle size={16} />} 
                    title="Error" 
                    color="red" 
                    variant="filled"
                    mb="md"
                >
                    Failed to end study session. Please try again.
                </Alert>
            )}

            <Text size="lg" fw={500}>
                Are you sure you want to end this study session?
            </Text>
            <Text size="sm" c="dimmed">
                Your study session will be archived and marked as completed.
            </Text>
            <Group mt="md">
                <Button 
                    variant="light" 
                    color="gray" 
                    onClick={closeModal}
                    disabled={loadingStudySessionCompletion}
                >
                    Cancel
                </Button>
                <Button 
                    color="red" 
                    onClick={handleEndSession}
                    loading={loadingStudySessionCompletion}
                >
                    End Session
                </Button>
            </Group>
        </Stack>
    );
}