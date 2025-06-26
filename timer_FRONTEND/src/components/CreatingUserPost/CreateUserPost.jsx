import { Button, Stack,Text, Paper } from "@mantine/core";
import { useState } from "react";
import StudySessionPostForm from "./StudySessionPostFrom";
import GeneralPostForm from "./GeneralPostForm";

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
                    <GeneralPostForm />
                )}
            </Stack>
        );
    };


    return (
        <Paper p="md" shadow="sm">
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
        </Paper>
    );
}