import { Stack, Card, Text, Group, Badge, Loader, Grid, Button, Box, Title } from '@mantine/core';
import { GET_ALL_USER_POSTS } from '../../data/queries';
import { useQuery } from '@apollo/client';
import {IconMessage, IconCalendar } from '@tabler/icons-react';
import { useModal } from '../../context/ModalContext';
import PostComments from '../PostsFeature/PostComments';
import LikeButton from '../PostsFeature/LikeButton';
import { getCategoryColor } from '../HelperFunctions/mainFeatureFunctions';
import { useState, useEffect, useRef } from 'react';

//displays the posts in a 3column grid, the posts are simplifed but when clicked opens the same post comment view, for full details. 
//used same inifinte scroll logic as in the main posts feature
export default function UserPagePosts() {
    const cursorRef = useRef(null);
    const loaderRef = useRef(null);
    const [hasMore, setHasMore] = useState(true);
    
    const { data: userPostsData, loading: loadingUserPosts, error: errorUserPosts, fetchMore } = useQuery(GET_ALL_USER_POSTS, {
        variables: { limit: 12 }, // 12 posts for 3-column grid (4 rows)
        onCompleted: (data) => {
            if (data?.getUserPosts?.length > 0) {
                const lastPost = data.getUserPosts[data.getUserPosts.length - 1];
                cursorRef.current = btoa(lastPost.createdAt);
            }
        },
    });
    
    const { openModal } = useModal();

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver(
            entries => {
                const target = entries[0];
                if (target.isIntersecting) {
                    loadMorePosts();
                }
            },
            { threshold: 1.0 }
        );
        
        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }
        
        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [loadingUserPosts, hasMore]);

    const loadMorePosts = () => {
        fetchMore({
            variables: { cursor: cursorRef.current, limit: 12 },
            updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult || fetchMoreResult.getUserPosts.length === 0) {
                    setHasMore(false);
                    return prev;
                }
                
                const newPosts = fetchMoreResult.getUserPosts;
                const lastPost = newPosts[newPosts.length - 1];
                cursorRef.current = btoa(lastPost.createdAt);
                
                return {
                    getUserPosts: [...prev.getUserPosts, ...newPosts]
                };
            }
        });
    };

    if (loadingUserPosts && !userPostsData) {
        return (
            <Box p="md">
                <Grid gutter="lg">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Grid.Col key={i} span={4}>
                            <Card withBorder shadow="sm" p="lg" radius="md" style={{ height: '300px' }}>
                                <Loader size="sm" />
                            </Card>
                        </Grid.Col>
                    ))}
                </Grid>
            </Box>
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
    console.log(userPostsData)
    return (
        <Box p="md">
            <Grid gutter="lg">
                {userPostsData?.getUserPosts?.map((post) => (
                    <Grid.Col key={post.id} span={4}>
                        <Card 
                            withBorder 
                            shadow="sm" 
                            p="lg" 
                            radius="md"
                            style={{ 
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer'
                            }}
                            onClick={() => openModal(<PostComments postId={post.id} />)}
                        >
                            <Stack spacing="lg" style={{ flex: 1 }}>
                                {/* Date badge */}
                                <Group position="apart" mb="xs">
                                    <Badge 
                                        color="blue" 
                                        variant="light"
                                        size="lg"
                                        leftSection={<IconCalendar size={18} />}
                                    >
                                        {new Date(Number(post.createdAt)).toLocaleDateString()}
                                    </Badge>
                                </Group>

                                {post.postType === 'StudySessionPost' && 
                                    <Text size="lg" c="dimmed" fs="italic" mb="lg">
                                        Completed a study session!
                                    </Text>
                                }

                                {post.postType === 'GeneralPost' && (
                                    <Badge 
                                        size="lg" 
                                        variant="filled" 
                                        color={getCategoryColor(post.category)} 
                                        mb="lg"
                                        style={{ textTransform: 'capitalize', fontSize: '16px' }} 
                                    >
                                        {post.category}
                                    </Badge>
                                )}

                                <Title order={3} size="1.5rem" mb="lg">{post.title}</Title>

                                {post.postType === 'StudySessionPost' && (
                                    <>
                                        {!post.exclusions?.excludeTime && (
                                            <Stack spacing={8} align="flex-start" mb="xl">
                                                <Text size="s" c="dimmed">
                                                    Studied for:
                                                </Text>
                                                <Text size="2rem" fw={700} c='#9370DB'>
                                                    {Math.floor(post.studiedTime / 3600)}h {Math.floor((post.studiedTime % 3600) / 60)}m {post.studiedTime % 60}s
                                                </Text>
                                            </Stack>
                                        )}
                                    </>
                                )}

                                <Group spacing="lg" mt="auto"> 
                                    <Button 
                                        variant="subtle"
                                        size="lg"  
                                        leftSection={<IconMessage size={20} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openModal(<PostComments postId={post.id} />);
                                        }}
                                    >
                                        <Text size="lg">{post.comments?.length || 0}</Text> 
                                    </Button>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <LikeButton post={post} />
                                    </div>
                                </Group>
                            </Stack>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>
            
            {/* Infinite scroll loader */}
            {hasMore && (
                <Box ref={loaderRef} py="md" style={{ textAlign: 'center' }}>
                    {loadingUserPosts ? (
                        <Loader size="sm" />
                    ) : (
                        <Text size="sm" c="dimmed">Scroll for more</Text>
                    )}
                </Box>
            )}
            
            {userPostsData?.getUserPosts?.length === 0 && (
                <Text c="dimmed" ta="center" py="xl">
                    No posts yet
                </Text>
            )}
        </Box>
    );
}