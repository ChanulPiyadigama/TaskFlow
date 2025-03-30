import { Button, Stack, Textarea, TextInput, Text, Paper } from "@mantine/core";
import { useState } from "react";
import StudySessionPostForm from "./StudySessionPostFrom";

export default function CreateUserPost() {
    const [postChoice, setPostChoice] = useState("");
    
    const renderPostForm = () => {
        if (!postChoice) return null;

        return (
            <Stack gap="md">
                {postChoice === "Study Session" && (
                    <StudySessionPostForm />
                )}
                {postChoice === "General Post" && (
                    <Textarea 
                        label="Content" 
                        placeholder="What's on your mind?" 
                        minRows={3}
                        required 
                    />
                )}
                <Button type="submit" fullWidth>
                    Create {postChoice}
                </Button>
            </Stack>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add form submission logic here
    };

    return (
        <Paper p="md" shadow="sm">
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <Stack gap="sm">
                        <Text fw={500} size="lg">What type of post?</Text>
                        <Button 
                            onClick={() => setPostChoice("Study Session")}
                            fullWidth
                            variant={postChoice === "Study Session" ? "filled" : "light"}
                            color={postChoice === "Study Session" ? "blue" : "gray"}
                        >
                            Study Session
                        </Button>
                        <Button 
                            onClick={() => setPostChoice("General Post")}
                            fullWidth
                            variant={postChoice === "General Post" ? "filled" : "light"}
                            color={postChoice === "General Post" ? "blue" : "gray"}
                        >
                            General Post
                        </Button>
                    </Stack>
                    {postChoice && renderPostForm()}
                </Stack>
            </form>
        </Paper>
    );
}