import { CREATE_GENERAL_POST } from "../../data/queries";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Textarea, Button, TextInput, Select, Stack, Text } from '@mantine/core';

export default function GeneralPostForm() {
    const [createPost, { loading: loadingCreatePost, error: errorCreatePost }] = useMutation(CREATE_GENERAL_POST, {
        onCompleted: (data) => {
            console.log("Post created:", data.createGeneralPost);
            // Clear form after successful creation
            setTitle("");
            setDescription("");
            setCategory("");
        },
        onError: (error) => {
            console.error("Error creating post:", error);
        }
    });

    const Category = {
        ANNOUNCEMENT: "announcement",
        QUESTION: "question", 
        DISCUSSION: "discussion",
        MISC: "misc"
    };

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!category || !title || !description) {
            return; // Form validation
        }

        createPost({
            variables: {
                title,
                description,
                category
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing="md">
                <Select
                    label="Category"
                    placeholder="Select a category"
                    value={category}
                    onChange={setCategory}
                    data={[
                        { value: Category.ANNOUNCEMENT, label: "Announcement" },
                        { value: Category.QUESTION, label: "Question" },
                        { value: Category.DISCUSSION, label: "Discussion" },
                        { value: Category.MISC, label: "Miscellaneous" }
                    ]}
                    required
                    withAsterisk
                />

                <TextInput
                    label="Title"
                    placeholder="Enter your post title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    withAsterisk
                />

                <Textarea
                    label="Description"
                    placeholder="What's on your mind?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    minRows={4}
                />

                {errorCreatePost && (
                    <Text c="red" size="sm">
                        Error creating post: {errorCreatePost.message}
                    </Text>
                )}

                <Button 
                    type="submit" 
                    fullWidth 
                    loading={loadingCreatePost}
                    disabled={!category || !title || !description}
                >
                    Create Post
                </Button>
            </Stack>
        </form>
    );
}