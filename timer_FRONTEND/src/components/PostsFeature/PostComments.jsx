import { Box, Text, Paper, Stack, ScrollArea, Title, Grid, TextInput, Button, Divider } from '@mantine/core';
import { GET_COMMENTS_FOR_POST, CREATE_COMMENT_FOR_POST } from '../../data/queries';
import { useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
import { IconSend } from '@tabler/icons-react';

//displays the commetns for the post in a modal, grabs the commetns form the network and updates the post in the cache (1), 
//we also use mutation to create a comment and refetch to display (2)
export default function PostComments({ postId, postData }) {
  
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

  if (loadingPostComments) return <Text>Loading comments...</Text>;
  if (errorPostComments) return <Text c="red">Error loading comments</Text>;

  return (
    <Grid gutter="md" style={{ height: '76vh' }}>
      {/* Left 2/3 - Post Content */}
      <Grid.Col span={8}>
        <Paper p="xl" withBorder style={{ height: '70vh' }}>
          <Stack spacing="md">
            <Title order={2}>{postData.title}</Title>
            <Divider />
            <Text size="lg">{postData.description}</Text>
            
            {/* Additional post details can go here */}
            <Text size="sm" c="dimmed">
              Posted by {postData.user.name} on {new Date(Number(postData.createdAt)).toLocaleDateString()}
            </Text>
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
                    {/* FIX THIS ICON NOT APPEARING */}
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