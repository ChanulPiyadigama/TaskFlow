import { useMutation } from '@apollo/client';
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { COMPLETE_STUDY_SESSION } from '../../data/queries';
import PostCompletedStudySessionModalConfirmation from '../Timer/PostCompletedStudySessionModalConfirmation';

export const useEndStudySession = () => {
    const { closeModal, openModal } = useModal();
    const navigate = useNavigate();

    const [completeSession, { 
        loading: loadingStudySessionCompletion, 
        data: dataStudySessionCompletion, 
        error: errorStudySessionCompletion 
    }] = useMutation(COMPLETE_STUDY_SESSION, {
        onCompleted: (data) => {
            closeModal();
            navigate("/");
        },
        onError: (error) => {
            console.error("Error completing study session:", error);
        }
    });

    const endStudySession = ({ studySessionId, studiedTime, timerID, showConfirmationModal = true }) => {
        // Remove timer from localStorage
        if (timerID) {
            localStorage.removeItem(`timer-${timerID}-timeLeft`);
        }

        // Complete the session
        completeSession({
            variables: {
                studySessionId,
                studiedTime
            }
        }).then(() => {
            // Show confirmation modal after successful completion
            if (showConfirmationModal) {
                openModal(
                    <PostCompletedStudySessionModalConfirmation 
                        studySessionId={studySessionId}
                    />
                );
            }
        });
    };

    return {
        endStudySession,
        loadingStudySessionCompletion,
        dataStudySessionCompletion,
        errorStudySessionCompletion,
    };
};