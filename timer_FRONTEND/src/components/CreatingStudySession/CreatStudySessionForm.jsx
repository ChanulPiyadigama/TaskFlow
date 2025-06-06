import { CREATE_STUDY_SESSION, GET_ALL_USER_STUDY_SESSIONS } from "../../data/queries"
import { useMutation } from "@apollo/client"
import { TextInput, Textarea, NumberInput, Stack, Button, Text } from '@mantine/core'
import { useNavigate } from "react-router-dom"
import { useModal } from "../../context/ModalContext"

//creates a study session and redirects to the study session page, on creation mutation loads page, and loads page
//again with study session obj that been saved to cache along with timer obj 
export default function CreateStudySessionForm() {
    const navigate = useNavigate()
    const {closeModal} = useModal()
    
    const [createStudySession, {loading: loadingCreateStudySession, data: dataCreateStudySession, error: errorCreateStudySession}] = useMutation(CREATE_STUDY_SESSION, {
        //we have to manually update the cache with the new timer, specfically for the query that 
        //previousstudylist uses so that it will grab the new timer
        //also cache is autmoatically from the mutation which is apollo client thus no need for client
        update: (cache, { data: { createStudySession } }) => {
            // Read existing study sessions from cache
            const existingData = cache.readQuery({ 
                query: GET_ALL_USER_STUDY_SESSIONS 
            });
    
            // Write back to cache for specific query, so now when that query runs in cache, 
            // it will return this new array
            cache.writeQuery({
                query: GET_ALL_USER_STUDY_SESSIONS,
                data: {
                    getUserStudySessions: existingData ? 
                        [...existingData.getUserStudySessions, createStudySession]
                        : [createStudySession]
                }
            });
        },
        onCompleted: (dataCreateStudySession) => {
            closeModal() // close the modal after creating the study session
            navigate(`/StudySession/${dataCreateStudySession.createStudySession.id}`)
        },
        onError: (errorCreateStudySession) => {
            console.error("Error creating study session:", errorCreateStudySession)
        }
    })



    const handleSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        createStudySession({
            variables: {
                title: formData.get("title"),
                description: formData.get("description"),
                //converts string to int
                duration: parseInt(formData.get("duration"), 10),
                startTimeIsoString: new Date().toISOString()
            }
        })
        e.target.reset()
    }

    if (loadingCreateStudySession){
        return <p>Creating study session...</p>
    }

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing="md" mb="xl">
                {errorCreateStudySession && (
                    <Text c="red" size="sm">
                        {errorCreateStudySession.message}
                    </Text>
                )}
                
                <TextInput
                    label="Session Title"
                    name="title"
                    placeholder="What are you studying today?"
                    required
                />
                
                <Textarea
                    label="Description"
                    name="description"
                    placeholder="Add some details about your study session..."
                    autosize
                    minRows={2}
                />
                
                <NumberInput
                    label="Duration (seconds)"
                    name="duration"
                    description="How long do you want to study?"
                    placeholder="1800 = 30 minutes"
                    min={1}
                    max={7200}
                    required
                />
                
                <Button 
                    type="submit" 
                    loading={loadingCreateStudySession} // when clicked and operation sent, disable button to not send more
                    fullWidth
                >
                    Start Session
                </Button>
            </Stack>
        </form>
    )
}