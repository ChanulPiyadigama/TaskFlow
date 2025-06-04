import { Stack, Card, Text, Group, Badge } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';

export default function UserPagePosts({ user }) {
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