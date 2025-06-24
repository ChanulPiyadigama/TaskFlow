import { useMutation } from '@apollo/client';
import { DELETE_STUDY_SESSION_BY_ID } from '../../data/queries';

export const useDeleteStudySession = () => {
    const [deleteStudySession, { data: deleteData, loading: deleteLoading, error: deleteError }] = useMutation(DELETE_STUDY_SESSION_BY_ID, {
        update(cache, { data }) {
            if (data?.deleteStudySessionById) {
                const deletedStudySession = data.deleteStudySessionById;

                //manually evict the break objected related to the studysessions timer
                if (deletedStudySession.timer?.log) {
                    deletedStudySession.timer.log.forEach(breakObj => {
                        cache.evict({
                            id: cache.identify({
                                __typename: 'Break',
                                id: breakObj.id
                            })
                        });
                    });
                }
                
                if (deletedStudySession.timer?.currentBreak) {
                    cache.evict({
                        id: cache.identify({
                            __typename: 'Break',
                            id: deletedStudySession.timer.currentBreak.id
                        })
                    });
                }

                 // Evict the timer
                if (deletedStudySession.timer) {
                    cache.evict({
                        id: cache.identify({
                            __typename: 'Timer',
                            id: deletedStudySession.timer.id
                        })
                    });
                }

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