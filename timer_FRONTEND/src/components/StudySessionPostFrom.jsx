import { Textarea, TextInput, Button, Stack, Title, Paper, Checkbox, Group, Text } from "@mantine/core"
import { useQuery } from "@apollo/client"
import { GET_ALL_USER_STUDY_SESSIONS } from "../queries"
import { useState } from "react"

export default function StudySessionPostForm() {
    const { loading: loadingStudySessions, data: dataStudySessions, error: errorStudySessions } = useQuery(GET_ALL_USER_STUDY_SESSIONS)
    const [postingSession, setPostingSession] = useState(null)
    const [excludeTime, setExcludeTime] = useState(false)
    const [title, setTitle] = useState(postingSession?.title ||"")
    const [description, setDescription] = useState(postingSession?.description ||"")


    if (loadingStudySessions) return <p>Loading...</p>

    const handleStudySessionSelected = (session) => {
        setTitle(session.title)
        if (session.description) {
            setDescription(session.description)
        }
        setPostingSession(session)
    }
    
    const userStudySessions = dataStudySessions.getUserStudySessions.map((session) => (
        <Button 
            key={session.id}
            variant="light"
            onClick={() => handleStudySessionSelected(session)}
            fullWidth
        >
            {session.title}
        </Button>
    ))

    return (
        <Stack gap="md">
            {!postingSession ? (
                <Paper p="md">
                    <Stack gap="md">
                        <Title order={3}>Choose a study session</Title>
                        {userStudySessions}
                    </Stack>
                </Paper>
            ) : (
                <Stack gap="md">
                    <Group justify="space-between" align="center">
                        <Title order={3}>Posting {postingSession.title}</Title>
                        <Button variant="subtle" onClick={() => setPostingSession(null)}>
                            Back
                        </Button>
                    </Group>

                    <Group align="flex-start">
                        <TextInput
                            placeholder="Enter post title"
                            label="Title"
                            required
                            style={{ flex: 1 }}
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                        />

                    </Group>

                    <Group align="flex-start">
                        <Textarea 
                            placeholder="Description" 
                            label="Description" 
                            minRows={3}
                            style={{ flex: 1 }}
                            value={description}
                            onChange={(e) => setDescription(e.currentTarget.value)}
                            
                        />

                    </Group>

                    <Paper p="md" withBorder>
                        <Stack gap="sm">
                            <Title order={4}>Session Stats</Title>
                            <Group>
                                <Text>{postingSession.timer.totalTime}</Text>
                                <Checkbox 
                                label="Exclude Time" 
                                checked={excludeTime}
                                onChange={(e) => setExcludeTime(e.currentTarget.checked)}
                            />
                            </Group>

                        </Stack>
                    </Paper>

                    <Button type="submit" fullWidth>
                        Create Post
                    </Button>
                </Stack>
            )}
        </Stack>
    )
}