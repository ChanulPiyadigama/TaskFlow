import { useMutation } from '@apollo/client';
import { DELETE_STUDY_SESSION_BY_ID } from '../../data/queries';

export const useDeleteStudySession = () => {
    const [deleteStudySession, { data: deleteData, loading: deleteLoading, error: deleteError }] = useMutation(DELETE_STUDY_SESSION_BY_ID, {
        update(cache, { data }) {
            if (data?.deleteStudySessionById) {
                cache.evict({ 
                    id: cache.identify(data.deleteStudySessionById) 
                });
                cache.gc();
            }
        },
        onError: (error) => {
            console.error('Error deleting study session:', error.message);
        }
    });

    const handleDeleteSession = (sessionId) => {
        deleteStudySession({
            variables: { studySessionId: sessionId }
        });
    };

    return {
        handleDeleteSession,
        deleteLoading,
        deleteError
    };
};