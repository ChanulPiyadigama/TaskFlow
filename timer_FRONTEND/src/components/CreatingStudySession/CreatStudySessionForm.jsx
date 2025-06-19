import { CREATE_STUDY_SESSION, GET_ALL_USER_STUDY_SESSIONS } from "../../data/queries"
import { useMutation } from "@apollo/client"
import { TextInput, Textarea, Stack, Button, Text } from '@mantine/core'
import { useNavigate } from "react-router-dom"
import { useModal } from "../../context/ModalContext"
import { useState } from 'react'

export default function CreateStudySessionForm() {
    const navigate = useNavigate()
    const {closeModal} = useModal()
    const [timeValue, setTimeValue] = useState('')
    const [durationSeconds, setDurationSeconds] = useState(0)
    
    const [createStudySession, {loading: loadingCreateStudySession, data: dataCreateStudySession, error: errorCreateStudySession}] = useMutation(CREATE_STUDY_SESSION, {
        update: (cache, { data: { createStudySession } }) => {
            const existingData = cache.readQuery({ 
                query: GET_ALL_USER_STUDY_SESSIONS 
            });
    
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
            closeModal()
            navigate(`/StudySession/${dataCreateStudySession.createStudySession.id}`)
        },
        onError: (errorCreateStudySession) => {
            console.error("Error creating study session:", errorCreateStudySession)
        }
    })

const formatTimeInput = (value) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 6 digits max
    const limited = digits.slice(0, 6);
    
    // If empty, return empty string (don't format)
    if (limited.length === 0) {
        setDurationSeconds(0);
        return '';
    }
    
    let formatted = '';
    let hours = 0, minutes = 0, seconds = 0;
    
    if (limited.length <= 2) {
        // 1-2 digits: just show the digits, don't format yet
        seconds = parseInt(limited) || 0;
        formatted = limited; // Show raw digits
    } else if (limited.length <= 4) {
        // 3-4 digits: treat as minutes:seconds (500 -> 05:00, 1230 -> 12:30)
        minutes = parseInt(limited.slice(0, -2)) || 0;
        seconds = parseInt(limited.slice(-2)) || 0;
        formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        // 5-6 digits: treat as hours:minutes:seconds (12345 -> 1:23:45, 123456 -> 12:34:56)
        hours = parseInt(limited.slice(0, -4)) || 0;
        minutes = parseInt(limited.slice(-4, -2)) || 0;
        seconds = parseInt(limited.slice(-2)) || 0;
        formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Validate time values for longer inputs
    if (limited.length > 2 && (minutes > 59 || seconds > 59)) {
        return timeValue; // Return previous value if invalid
    }
    
    // Calculate total seconds
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setDurationSeconds(totalSeconds);
    
    return formatted;
};

    const handleTimeChange = (event) => {
        const newValue = formatTimeInput(event.target.value);
        setTimeValue(newValue);
    };

    const handleSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        createStudySession({
            variables: {
                title: formData.get("title"),
                description: formData.get("description"),
                duration: durationSeconds, // Use calculated seconds
                startTimeIsoString: new Date().toISOString()
            }
        })
        e.target.reset()
        setTimeValue('')
        setDurationSeconds(0)
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
                    maxLength={120}
                />
                
                <Textarea
                    label="Description"
                    name="description"
                    placeholder="Add some details about your study session..."
                    autosize
                    minRows={2}
                    maxLength={400}
                />
                
                <TextInput
                    label="Duration (HH:MM:SS)"
                    name="duration"
                    description="Enter digits for time: 5 = 5 seconds, 500 = 5 minutes, 12345 = 1h 23m 45s"
                    placeholder="Type: 5, 0, 0 for 5 minutes"
                    value={timeValue}
                    onChange={handleTimeChange}
                    required
                    error={durationSeconds === 0 && timeValue ? "Duration must be greater than 0" : null}
                />
                
                {durationSeconds > 0 && (
                    <Text size="sm" c="dimmed">
                        Total: {Math.floor(durationSeconds / 3600)}h {Math.floor((durationSeconds % 3600) / 60)}m {durationSeconds % 60}s
                        ({durationSeconds} seconds)
                    </Text>
                )}
                
                <Button 
                    type="submit" 
                    loading={loadingCreateStudySession}
                    fullWidth
                    disabled={durationSeconds === 0}
                >
                    Start Session
                </Button>
            </Stack>
        </form>
    )
}