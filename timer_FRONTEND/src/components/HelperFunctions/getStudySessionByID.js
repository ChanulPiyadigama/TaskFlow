import { GET_STUDY_SESSION_BYID } from "../../data/queries";
import { useQuery } from "@apollo/client";

export const useGetStudySessionById = (studySessionId) => {
    const { data, loading, error, refetch } = useQuery(GET_STUDY_SESSION_BYID, {
        variables: { studySessionId },
        skip: !studySessionId,
        errorPolicy: 'all',
        onError: (error) => {
            console.error('Error fetching study session data:', error.message);
        }
    });

    return {
        studySession: data?.getSpecificStudySession || null,
        loading,
        error,
        refetch,
    };
};