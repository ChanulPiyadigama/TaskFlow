import { Button, Group, Stack, Text, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useModal } from '../../context/ModalContext';
import { COMPLETE_STUDY_SESSION } from '../../data/queries';
import { useMutation } from '@apollo/client';
import { data, useNavigate } from 'react-router-dom';
import PostCompletedStudySessionModalConfirmation from './PostCompletedStudySessionModalConfirmation';

//this modal checks if the user is sure they want to end the study session, if so we send a mutation to the server
//and update both the timer and study session data first in the server, then the client's cache
export default function EndStudySessionModal({studySessionId, studiedTime, timerID}) {
    const { closeModal } = useModal();
    const navigate = useNavigate();
    const { openModal } = useModal();

    const [completeSession, {loading: loadingStudySesssionCompletion, data: dataStudySessionCompletition, error: errorStudySessionCompleition}] = useMutation(COMPLETE_STUDY_SESSION, {
        onCompleted: (data) => {
            closeModal();
            navigate("/")
            openModal(
                <PostCompletedStudySessionModalConfirmation 
                    studiedTime={studiedTime}
                    studySessionId = {studySessionId}
                />
            );

        },
        onError: (error) => {
            console.error("Error completing study session:", error);
        }
    });
    const handleEndSession = () => {
        localStorage.removeItem(`timer-${timerID}-timeLeft`)
        completeSession({
            variables: {
                studySessionId: studySessionId,
                studiedTime: studiedTime
            }
        });
    }

    if (loadingStudySesssionCompletion) {
        return (
            <Stack align="center" spacing="lg">
                <Loader size="md" />
                <Text size="sm" c="dimmed">Completing study session...</Text>
            </Stack>
        );
    }
    
    return (
        <Stack align="center" spacing="lg">
            {errorStudySessionCompleition && (
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
                    disabled={loadingStudySesssionCompletion}
                >
                    Cancel
                </Button>
                <Button 
                    color="red" 
                    onClick={handleEndSession}
                    loading={loadingStudySesssionCompletion}
                >
                    End Session
                </Button>
            </Group>
        </Stack>
    );
}