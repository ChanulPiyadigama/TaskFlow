import { GET_FRIENDS_POSTS, CREATE_COMMENT_FOR_POST, LIKE_POST } from "../../data/queries";
import { useQuery } from "@apollo/client";
import { useState, useEffect, useRef } from "react";
import { 
    Loader, 
    Text, 
    Card, 
    Title, 
    Group, 
    Stack, 
    Container, 
    Avatar, 
    Badge, 
    Button,
    Paper,
    Box 
} from "@mantine/core";
import { IconCalendar, IconMessage, IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useModal } from "../../context/ModalContext";
import PostComments from "./PostComments";
import { useAuth } from "../../context/AuthContext";
import { useMutation } from "@apollo/client";


/*

This component displays posts with an infinte scroll

the usequery grabs the first 10 posts, and on its second render (where loading is false), the 
intersection observer will be set up by the useeffect again since loading is false now. Since now 
the invisible div will be available to be set as ref.(1)

It will be observed by the intersection observer, and when it is in view, the entries callback function
we passed to the observer runs which will grab the target (invisible div), check if its in view,
and then load more posts. (2)

Loadmoreposts uses fetchmore which is a dedicated function for pagination that comes with apollo queries. 
It takes in the variables needed to recall the query and a callback function that uses the 
new data to update the cache. So we get the new posts and update the cache (3). We also use the 
last post's time as the new cursor so the next posts we get are after that time. (4)
If there are no more posts when we fetch, then set hasmore to false which will stop the observer,
thus stopping the infinite scroll.

*/
export default function PostsScroll(){
    const { user } = useAuth();
    const cursorRef = useRef(null);
    const loaderRef = useRef(null);
    const [hasMore, setHasMore] = useState(true);
    const {openModal} = useModal()
    const [expandedPosts, setExpandedPosts] = useState(new Set());


    const {loading: loadingPosts, data: dataPosts, error: errorPosts, fetchMore} = useQuery(GET_FRIENDS_POSTS, {
        variables: { limit: 10 },
        //(1)
        onCompleted: (data) => {
            if (data?.getUserFriendsPosts?.length > 0) {
                const lastPost = data.getUserFriendsPosts[data.getUserFriendsPosts.length - 1];
                cursorRef.current = btoa(lastPost.createdAt); 
              }    
        },
    })  

    const [likePost] = useMutation(LIKE_POST, {
    });

    const handleLike = (postId) => {
        likePost({
            variables: { postID : postId }
        });
    }

    //(2)
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
    }, [loadingPosts, hasMore]);
    

    //(3)
    const loadMorePosts = () => {
        fetchMore({
            variables: { cursor: cursorRef.current, limit: 10 },
            updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult || fetchMoreResult.getUserFriendsPosts.length === 0) {
                setHasMore(false);
                return prev;
            }
            
            const newPosts = fetchMoreResult.getUserFriendsPosts;
            const lastPost = newPosts[newPosts.length - 1];
            //(4) encodes to base 64 to use as cursor in backend 
            cursorRef.current = btoa(lastPost.createdAt);             
            return {
                getUserFriendsPosts: [...prev.getUserFriendsPosts, ...newPosts]
            };
            }
        });
    };

    //function to get category color based on post category
    const getCategoryColor = (category) => {
      const categoryColors = {
        'announcement': 'blue',
        'question': 'orange', 
        'discussion': 'green',
        'misc': 'gray'
      };
      return categoryColors[category] || 'grape'; // fallback color
    };

    const toggleExpanded = (postId) => {
      setExpandedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
    };

    const getDescriptionDisplay = (description, postId) => {
      const isExpanded = expandedPosts.has(postId);
      
      if (description.length <= 100) {
        return description;
      }
      
      if (isExpanded) {
        return description;
      }
      
      return description.slice(0, 100) + '...';
    };


    if (loadingPosts && !dataPosts) return (
        <Container p="md">
          <Stack>
            {[1, 2, 3].map(i => (
              <Card key={i} withBorder shadow="sm" p="lg" radius="md">
                <Loader size="sm" />
              </Card>
            ))}
          </Stack>
        </Container>
      );
    
      if (errorPosts) return (
        <Container p="md">
          <Paper p="md" withBorder color="red">
            <Title order={4} color="red">Error</Title>
            <Text>{errorPosts.message}</Text>
          </Paper>
        </Container>
      );
      return (
        <Box p="md" w="90%" mx="auto">
          <Stack spacing="lg">
            {dataPosts?.getUserFriendsPosts?.map((post, index) => (
            
              <Card 
                key={post.id || index} 
                withBorder 
                shadow="sm" 
                p="lg" 
                radius="md"
                style={{ 
                  borderColor: post.user.id === user?.id ? '#9370DB' : undefined,
                  borderWidth: post.user.id === user?.id ? '2px' : '1px',
                  marginTop: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <Stack spacing="lg">
                  {/* User info and date at the top */}
                  <Group position="apart" mb="xs">
                    <Group>
                      <Avatar radius="xl" size = 'lg' color="blue">
                        {post.user.name.charAt(0)}
                      </Avatar>
                      <Text fw={500} size= 'lg'>{post.user.name}</Text>
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
                    {/* Show studied time first */}
                    {!post.exclusions?.excludeTime && (
                        <Stack spacing={8} align="flex-start" mt="xl" mb="xl">
                          <Text size="lg" c="dimmed">
                            Studied for:
                          </Text>
                          <Text size="4.5rem" fw={700} c='#9370DB'>
                            {Math.floor(post.studiedTime / 3600)}h {Math.floor((post.studiedTime % 3600) / 60)}m {post.studiedTime % 60}s
                          </Text>
                        </Stack>
                    )}
                  </>
                  )}

                  <Text size="s" c="dimmed" mb="xl">
                      {getDescriptionDisplay(post.description, post.id)}
                      {console.log(post.description.length)}
                      {post.description.length > 100 && (
                        <Button
                          variant="subtle"
                          size="sm"
                          p={0}
                          style={{ 
                            textDecoration: 'underline',
                            fontWeight: 'normal',
                            fontSize: 'inherit',
                            color: 'inherit',
                            height: 'auto',
                            minHeight: 'auto'
                          }}
                          onClick={() => toggleExpanded(post.id)}
                        >
                          {expandedPosts.has(post.id) ? ' show less' : ' read more'}
                        </Button>
                      )}
                    </Text>
                  <Group spacing="lg" mt="xl"> 
                    <Button 
                      variant="subtle"
                      size="lg"  
                      onClick={() => openModal(<PostComments postId={post.id} postData={post}/>)}
                      leftSection={<IconMessage size={20} />}  
                    >
                      <Text size="lg">{post.comments?.length || 0}</Text> 
                    </Button>
                    <Button
                      variant="subtle"
                      size="lg"  
                      color={post.likes.some(like => like.id === user?.id) ? "red" : "gray"}
                      leftSection={
                        post.likes.some(like => like.id === user?.id)
                          ? <IconHeartFilled size={20} /> 
                          : <IconHeart size={20} />
                      }
                      onClick={() => handleLike(post.id)}
                    >
                      <Text size="lg">{post.likes.length || 0}</Text>  
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))}
            
            {hasMore && (
              <Box ref={loaderRef} py="md" style={{ textAlign: 'center' }}>
                {loadingPosts ? (
                  <Loader size="sm" />
                ) : (
                  <Text size="sm" c="dimmed">Scroll for more</Text>
                )}
              </Box>
            )}
          </Stack>
        </Box>
      );
}