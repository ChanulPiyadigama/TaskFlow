import { Textarea, TextInput, Button, Stack, Title, Paper, Checkbox, Group, Text } from "@mantine/core"
import { useQuery } from "@apollo/client"
import { GET_ALL_USER_STUDY_SESSIONS } from "../../data/queries"
import { useState } from "react"
import { CREATE_USER_STUDY_SESSION_POST, GET_FRIENDS_POSTS } from "../../data/queries"
import { useMutation } from "@apollo/client"
import { useModal } from "../../context/ModalContext"
import { useEffect } from "react"

export default function StudySessionPostForm({preSelectedSession}) {
    const { closeModal } = useModal()

    const { loading: loadingStudySessions, data: dataStudySessions, error: errorStudySessions } = useQuery(GET_ALL_USER_STUDY_SESSIONS)
    const [createUserPost, { loading: loadingCreateUserPost, data: dataCreateUserPost, error: errorCreateUserPost }] = useMutation(CREATE_USER_STUDY_SESSION_POST, {
        update: (cache, { data: { createStudySessionPost } }) => {
            // Read existing posts
            const existingData = cache.readQuery({ 
                query: GET_FRIENDS_POSTS,
                variables: { limit: 10 }
            });

            if (existingData) {
                // Add new post at the beginning of the array
                cache.writeQuery({
                    query: GET_FRIENDS_POSTS,
                    variables: { limit: 10 },
                    data: {
                        getUserFriendsPosts: [
                            createStudySessionPost,
                            ...existingData.getUserFriendsPosts
                        ]
                    }
                });
            }
        },
        onCompleted: (data) => {
            closeModal()
            console.log("Post created:", data.createStudySessionPost)            
        },
        onError: (error) => {
            console.error("Error creating post:", error)
        }
    }
    )

    useEffect(() => {
        if (preSelectedSession) {
            console.log("Pre-selected session:", preSelectedSession);
            
            // Use the pre-selected session data
            setPostingSession(preSelectedSession);
            setTitle(preSelectedSession.title || "");
            setDescription(preSelectedSession.description || "");
        }
    }, [])

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

    const handleSubmit = (e) => {
        e.preventDefault()

        createUserPost({
            variables: {
                title: title,
                description: description,
                exclusions: {
                    excludeTime: excludeTime
                },
                studySessionId: postingSession.id
            }
        })
        e.target.reset()
    }

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
                <form onSubmit={handleSubmit}>
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
                </form>
            )}
        </Stack>
    )
}