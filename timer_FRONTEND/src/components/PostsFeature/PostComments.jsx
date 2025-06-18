import { Box, Text, Paper, Stack, ScrollArea, Title, Grid, TextInput, Button, Divider, Group, Badge, Avatar } from '@mantine/core';
import { GET_COMMENTS_FOR_POST, CREATE_COMMENT_FOR_POST, GET_POST_BY_ID } from '../../data/queries';
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { IconSend, IconCalendar, IconMessage, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { getCategoryColor } from '../HelperFunctions/mainFeatureFunctions';
import LikeButton from './LikeButton';

//displays the commetns for the post in a modal, grabs the commetns form the network and updates the post in the cache (1), 
//we also use mutation to create a comment and refetch to display (2)
export default function PostComments({ postId }) {
  
  const { loading: loadingpost, data: PostData, error: errorpost } = useQuery(GET_POST_BY_ID,{
    variables: { postId: postId },
    onError: (error) => {
      console.error('Error fetching post data:', error.message);
    }
  })
  
  //(2)
  const [commentText, setCommentText] = useState('');


  //(1)
  const { loading: loadingPostComments, data: dataPostComments, error: errorPostComments } = useQuery(GET_COMMENTS_FOR_POST, {
    variables: { postId: postId }
  });
  
  //(2)
  const [createComment] = useMutation(CREATE_COMMENT_FOR_POST, {
    refetchQueries: [
      { query: GET_COMMENTS_FOR_POST, variables: { postId } }
    ]
  });

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    createComment({
      variables: { 
        postId, 
        content: commentText 
      }
    });
    setCommentText('');
  };

  if (loadingPostComments || loadingpost) return <Text>Loading comments...</Text>;
  if (errorPostComments) return <Text c="red">Error loading comments</Text>;

  const post = PostData.getPostById;
  console.log(post)

  return (
    <Grid gutter="md" style={{ height: '76vh' }}>
      {/* Left 2/3 - Post Content */}
      <Grid.Col span={8}>
        <Paper p="xl" withBorder style={{ minHeight: '70vh', height: 'auto' }}>
          <Stack spacing="lg">
            {/* User info and date at the top */}
            <Group position="apart" mb="xs">
              <Group>
                <Avatar radius="xl" size='lg' color="blue">
                  {post.user.name.charAt(0)}
                </Avatar>
                <Text fw={500} size='lg'>{post.user.name}</Text>
              </Group>
              
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
                {post.user.name} has completed a study session!
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

            <Title order={1} size="3rem" mb="lg">{post.title}</Title>

            {post.postType === 'StudySessionPost' && (
              <>
                {!post.exclusions?.excludeTime && (
                  <Stack spacing={8} align="flex-start" mb="xl">
                    <Text size="s" c="dimmed">
                      Studied for:
                    </Text>
                    <Text size="4.5rem" fw={700} c='#9370DB'>
                      {Math.floor(post.studiedTime / 3600)}h {Math.floor((post.studiedTime % 3600) / 60)}m {post.studiedTime % 60}s
                    </Text>
                  </Stack>
                )}
              </>
            )}

            <Text size="s" c="dimmed" mb="lg">
              {post.description}
            </Text>
            <Group>
              <LikeButton post ={post}/>
            </Group>
            
          </Stack>
        </Paper>
      </Grid.Col>
      
      {/* Right 1/3 - Comments Section */}
      <Grid.Col span={4}>
        <Paper withBorder style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
          <Box p="md">
            <Title order={4} mb="md">Comments</Title>
          </Box>
          
          {/* Scrollable Comments Area */}
          <ScrollArea h="350px" px="md" pb="md" style={{ flex: 1 }}>
            <Stack spacing="sm">
              {dataPostComments?.getPostCommentsById?.comments?.length === 0 ? (
                <Text c="dimmed" align="center" py="xl">No comments yet</Text>
              ) : (
                dataPostComments?.getPostCommentsById?.comments?.map(comment => (
                  <Paper key={comment.id} p="md" withBorder>
                    <Text size="sm">{comment.content}</Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      {new Date(Number(comment.createdAt)).toLocaleTimeString()}
                    </Text>
                  </Paper>
                ))
              )}
            </Stack>
          </ScrollArea>
          
          {/* Comment Form */}
          <Box p="md" style={{ borderTop: '1px solid #3a3a3a' }}>
            <Stack spacing="xs">
              <TextInput
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rightSection={
                  <Button 
                    size='xs' 
                    variant="subtle" 
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim()}
                  >
                    <IconSend size={16} />
                  </Button>
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    handleSubmitComment();
                  }
                }}
              />
            </Stack>
          </Box>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}