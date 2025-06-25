import { DELETE_POST_BY_ID } from "../../data/queries"
import { useMutation } from "@apollo/client"
export const useDeletePostById = () => {
    const [deletePost, {loading: loadingDeletingPost, error: deletePostError }] = useMutation(DELETE_POST_BY_ID, {
        update(cache, { data }) {
            const deletedPost = data?.deletePostById;
            console.log(deletedPost)
            if (deletedPost) {
                // Apollo can automatically figure out the cache ID
                cache.evict({ 
                    id: cache.identify(deletedPost) 
                });

                if (deletedPost.comments){
                    // Evict all comments related to the deleted post
                    deletedPost.comments.forEach(comment => {
                        cache.evict({
                            id: cache.identify({
                                __typename: 'Comment',
                                id: comment.id
                            })
                        });
                    });
                }
                console.log(deletedPost)
                if (deletedPost.postType === 'StudySessionPost') {
                    console.log("runs")
                    const deletedStudySession = deletedPost.studySession;
                    console.log(deletedStudySession)
                    if (deletedStudySession) {
                        console.log('Evicting study session:', deletedStudySession);
                        
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

                        if (deletedStudySession.timer) {
                            cache.evict({
                                id: cache.identify({
                                    __typename: 'Timer',
                                    id: deletedStudySession.timer.id
                                })
                            });
                            console.log('Evicted timer:', deletedStudySession.timer.id);
                        }

                        cache.evict({
                            id: cache.identify({
                                __typename: 'StudySession',
                                id: deletedStudySession.id
                            })
                        });
                        console.log('Evicted study session:', deletedStudySession.id);
                    } else {
                        console.log('No study session data to evict');
                    }
                }
                cache.gc();
            }
            
        },
        onError: (error) => {
            console.error('Error deleting post:', error);
        }
    });

    const handleDeletePost = async (postId) => {
        try {
            await deletePost({ variables: { postId } });
        } catch (error) {
            console.error("Error deleting post:", error);
            throw new Error("Failed to delete post");
        }
    };

    return { handleDeletePost, loadingDeletingPost, deletePostError };
}