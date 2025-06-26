import { CREATE_STUDY_SESSION, GET_ALL_USER_STUDY_SESSIONS } from "../../data/queries"
import { useMutation } from "@apollo/client"
import { TextInput, Textarea, Stack, Button, Text } from '@mantine/core'
import { useNavigate } from "react-router-dom"
import { useModal } from "../../context/ModalContext"
import { useState } from "react"

//creates a study session and redirects to the study session page, on creation mutation loads page, and loads page
//again with study session obj that been saved to cache along with timer obj 
export default function CreateStudySessionForm() {
    const navigate = useNavigate()
    const {closeModal} = useModal()

    const [duration, setDuration] = useState("");
    
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
        
        // Convert the duration from HH:MM:SS format to total seconds
        const durationInSeconds = convertToSeconds(duration);
        
        // Validate minimum duration
        if (durationInSeconds === 0) {
            alert("Please enter a valid duration greater than 0");
            return;
        }
        
        createStudySession({
            variables: {
                title: formData.get("title"),
                description: formData.get("description"),
                duration: durationInSeconds, 
                startTimeIsoString: new Date().toISOString()
            }
        })
        e.target.reset()
        setDuration('')
    }

    const convertToSeconds = (timeString) => {
        if (!timeString) return 0;
        
        const paddedDigits = timeString.padStart(6, '0');
        let hours = parseInt(paddedDigits.slice(0, 2)) || 0;
        let minutes = parseInt(paddedDigits.slice(2, 4)) || 0;
        let seconds = parseInt(paddedDigits.slice(4, 6)) || 0;

        if (minutes > 59){
            minutes = 59
        }
        if (seconds > 59){
            seconds = 59
        }
        
        return hours * 3600 + minutes * 60 + seconds;
    }

    const handleDurationChange = (value) => {

        // Remove semicolons and any non-digit characters, then remove leading zeros
        const cleanedValue = value.replace(/[;\D]/g, '').replace(/^0+/, '') || '0';

        if (cleanedValue.length > 6) {
            return;
        }
        setDuration(cleanedValue);
    }

    function insertChar(str, char, index) {
        return str.slice(0, index) + char + str.slice(index);
    }

    //to create a dynamic input for duration similar to the generic google timer, i deconstruct and 
    //reconstruct the string state value on every change 
    const durationCombined = (val) =>{
        let paddedVal = val.padStart(6, '0')

        paddedVal = insertChar(paddedVal, ":", 2);
        paddedVal = insertChar(paddedVal, ":", 5);
        return paddedVal;
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
                    maxLength = {120}
                />
                
                <Textarea
                    label="Description"
                    name="description"
                    placeholder="Add some details about your study session..."
                    autosize
                    minRows={2}
                    maxLength = {400}
                />
                
                <TextInput 
                    label="Duration (seconds)"
                    name="duration"
                    description="How long do you want to study?"
                    value = {durationCombined(duration)}
                    onChange={(e)=> handleDurationChange(e.target.value)}
                />

                {duration && convertToSeconds(duration) > 0 && (
                    <Text size="xs" c="dimmed" mt="xs">
                        Duration: {Math.floor(convertToSeconds(duration) / 3600)}h {Math.floor((convertToSeconds(duration) % 3600) / 60)}m {convertToSeconds(duration) % 60}s 
                    </Text>
                )}
                
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