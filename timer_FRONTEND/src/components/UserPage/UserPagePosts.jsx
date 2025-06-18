import { Stack, Card, Text, Group, Badge, Loader } from '@mantine/core';
import { GET_ALL_USER_POSTS } from '../../data/queries';
import { useQuery } from '@apollo/client';
import { IconHeart } from '@tabler/icons-react';

export default function UserPagePosts({ user }) {
    const { data: userPostsData, loading: loadingUserPosts, error: errorUserPosts } = useQuery(GET_ALL_USER_POSTS, {
        variables: { userId: user.id }
    });

    if (loadingUserPosts) {
        return (
            <Stack align="center" py="xl">
                <Loader size="md" />
                <Text size="sm" c="dimmed">Loading posts...</Text>
            </Stack>
        );
    }

    if (errorUserPosts) {
        return (
            <Stack align="center" py="xl">
                <Text c="red" size="sm">
                    Error loading posts: {errorUserPosts.message}
                </Text>
            </Stack>
        );
    }
    
    
    return (
        <Stack spacing="md">
            {user.allPosts?.map((post) => (
                <Card 
                    key={post.id} 
                    shadow="sm" 
                    padding="lg" 
                    radius="md" 
                    withBorder
                >
                    <Group position="apart" mb="xs">
                        <Text fw={500} size="lg">
                            {post.title}
                        </Text>
                        <Group spacing={4}>
                            <IconHeart size={16} style={{ color: 'gray' }} />
                            <Text size="sm" c="dimmed">
                                {post.likes}
                            </Text>
                        </Group>
                    </Group>

                    <Text size="sm" c="dimmed">
                        {post.description}
                    </Text>
                </Card>
            ))}
            
            {user.allPosts?.length === 0 && (
                <Text c="dimmed" ta="center">
                    No posts yet
                </Text>
            )}
        </Stack>
    );
}