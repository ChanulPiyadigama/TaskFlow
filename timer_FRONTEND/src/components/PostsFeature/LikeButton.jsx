import { Button, Text } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { LIKE_POST } from '../../data/queries';
import { useAuth } from '../../context/AuthContext';


export default function LikeButton({ post, size = "lg", variant = "subtle" }) {
    const { user } = useAuth();
    const [likePost, { loading }] = useMutation(LIKE_POST);

    const handleLike = async () => {
        try {
            await likePost({
                variables: { postID: post.id }
            });
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const isLiked = post.likes?.some(like => like.id === user?.id);

    return (
        <Button
            variant={variant}
            size={size}
            color={isLiked ? "red" : "gray"}
            leftSection={
                isLiked
                    ? <IconHeartFilled size={20} /> 
                    : <IconHeart size={20} />
            }
            onClick={handleLike}
            loading={loading}
            disabled={loading}
        >
            <Text size={size}>{post.likes?.length || 0}</Text>
        </Button>
    );
}