import { CREATE_GENERAL_POST, GET_FRIENDS_POSTS } from "../../data/queries";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { Textarea, Button, TextInput, Select, Stack, Text } from '@mantine/core';
import { useModal } from "../../context/ModalContext";
import PostInputs from "./PostInputs";

export default function GeneralPostForm() {
    const { closeModal } = useModal();
    const [createPost, { loading: loadingCreatePost, error: errorCreatePost }] = useMutation(CREATE_GENERAL_POST, {
        refetchQueries: [
            { query: GET_FRIENDS_POSTS, variables: { limit: 10 } }
        ],
        onCompleted: (data) => {
            closeModal();
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

                <PostInputs 
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
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