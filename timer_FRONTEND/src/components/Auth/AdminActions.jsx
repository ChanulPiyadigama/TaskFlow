import { CREATE_USER, LOGIN, CREATE_STUDY_SESSION, CREATE_USER_STUDY_SESSION_POST, CREATE_GENERAL_POST, COMPLETE_STUDY_SESSION, LIKE_POST, CREATE_COMMENT_FOR_POST, HANDLE_FRIEND_REQUEST  } from "../../data/queries"
import { useMutation } from "@apollo/client"
import { studySessionData, generalPostData, commentData } from "../../data/TestingData"
import { useApolloClient } from "@apollo/client"

export default function AdminPage() {
    
    const users = [
        { username: "olivia_chen", password: "OliviaSecure2024!", name: "Olivia Chen", email: "olivia.chen@gmail.com" },
        { username: "noah_williams", password: "NoahPass789$", name: "Noah Williams", email: "noah.williams@gmail.com" },
        { username: "emma_rodriguez", password: "Emma@Strong123", name: "Emma Rodriguez", email: "emma.rodriguez@gmail.com" },
        { username: "oliver_thompson", password: "OliverKey456#", name: "Oliver Thompson", email: "oliver.thompson@gmail.com" },
        { username: "ava_martinez", password: "AvaSecure999&", name: "Ava Martinez", email: "ava.martinez@gmail.com" },
        { username: "elijah_garcia", password: "Elijah2024Safe!", name: "Elijah Garcia", email: "elijah.garcia@gmail.com" },
        { username: "sophia_lee", password: "SophiaLock777@", name: "Sophia Lee", email: "sophia.lee@gmail.com" },
        { username: "james_anderson", password: "JamesPass321$", name: "James Anderson", email: "james.anderson@gmail.com" },
        { username: "isabella_smith", password: "Bella@Secure456", name: "Isabella Smith", email: "isabella.smith@gmail.com" },
        { username: "liam_johnson", password: "LiamStrong888#", name: "Liam Johnson", email: "liam.johnson@gmail.com" },
        { username: "mia_brown", password: "MiaPass2024!", name: "Mia Brown", email: "mia.brown@gmail.com" },
        { username: "lucas_davis", password: "Lucas@Key567", name: "Lucas Davis", email: "lucas.davis@gmail.com" }
    ]
    const [createUser] = useMutation(CREATE_USER)
    const [login] = useMutation(LOGIN)
    const [createStudySession] = useMutation(CREATE_STUDY_SESSION)
    const [createUserStudySessionPost] = useMutation(CREATE_USER_STUDY_SESSION_POST)
    const [createUserGeneralPost] = useMutation(CREATE_GENERAL_POST)
    const [completeStudySession] = useMutation(COMPLETE_STUDY_SESSION)
    const [likePost] = useMutation(LIKE_POST)
    const [createComment] = useMutation(CREATE_COMMENT_FOR_POST)
    const [handlefriendRequest] = useMutation(HANDLE_FRIEND_REQUEST)
      
    const handleCreateUsers = async () => {
        try {
            for (const user of users) {
                await createUser({
                    variables: user
                });
                console.log(`Created user: ${user.username}`);
            }
            console.log("All users created successfully!");
            
        } catch (error) {
            console.error("Error creating users:", error);
        }
    }

    const handleCompleteUserSetup = async () => {
        const allPostIds = [];
        try {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                console.log(`Processing user ${i + 1}/${users.length}: ${user.username}`);
                
                try {
                    // 1. Login as this user
                    const { data: loginData } = await login({
                        variables: {
                            username: user.username,
                            password: user.password
                        }
                    });
                    
                    localStorage.setItem("user-token", loginData.login);
                    
                    // 2. Get this user's 4 study sessions (indices 4*i to 4*i+3)
                    const startIdx = i * 4;
                    const userSessions = studySessionData.slice(startIdx, startIdx + 4);
                    
                    // 3. Create each study session for this user
                    const createdSessions = [];
                    for (const session of userSessions) {
                        const { data: sessionData } = await createStudySession({
                            variables: {
                                startTimeIsoString: session.startTimeIsoString,
                                title: session.title,
                                description: session.description,
                                duration: session.duration
                            }
                        });
                        createdSessions.push(sessionData.createStudySession);
                    }
                    
                    console.log(` Created 4 study sessions for ${user.username}`);
                    
                    // 4. Post each study session (need to complete them first)
                    for (const session of createdSessions) {
                        // Complete the study session first
                        await completeStudySession({
                            variables: {
                                studySessionId: session.id,
                                studiedTime: session.timer.totalTime 
                            }
                        });
                        
                        // Now create the post and store its ID
                        const { data: postData } = await createUserStudySessionPost({
                            variables: {
                                title: session.title,
                                description: session.description,
                                exclusions: {
                                    excludeTime: false
                                },
                                studySessionId: session.id
                            }
                        });
                        
                        allPostIds.push(postData.createStudySessionPost.post.id);
                    }
                    
                    console.log(` Posted 4 study session posts for ${user.username}`);
                    
                    // 5. Create 4 general posts using generalPostData
                    const userGeneralPosts = generalPostData.slice(startIdx, startIdx + 4);
                        
                    for (const post of userGeneralPosts) {
                        const { data: postData } = await createUserGeneralPost({
                            variables: {
                                title: post.title,
                                description: post.description,
                                category: post.category
                            }
                        });
                        
                        allPostIds.push(postData.createGeneralPost.id);
                    }
                    
                    console.log(` Created 4 general posts for ${user.username}`);
                    
                } catch (userError) {
                    console.error(` Error processing user ${user.username}:`, userError);
                }
            }
            await addInteractionsToPosts(allPostIds);

            // Clean up
            localStorage.removeItem("user-token");
            alert(" Complete user setup finished! All users now have study sessions, study session posts, and general posts!");
            
        } catch (error) {
            console.error(" Error in complete user setup:", error);
            localStorage.removeItem("user-token");
        }
    };
    
    // Helper function to add likes and comments
    const addInteractionsToPosts = async (allPostIds) => {
        console.log("🔄 Phase 2: Adding likes and comments...");
        
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            console.log(`Adding interactions for ${user.username}`);
            
            try {
                // Login as this user
                const { data: loginData } = await login({
                    variables: {
                        username: user.username,
                        password: user.password
                    }
                });
                
                localStorage.setItem("user-token", loginData.login);
                
                // Each user likes 8-15 random posts (not their own)
                const otherUserPosts = allPostIds.filter((_, index) => {
                    const postOwnerIndex = Math.floor(index / 8); // 8 posts per user
                    return postOwnerIndex !== i; // Exclude own posts
                });
                
                const likesToAdd = Math.floor(Math.random() * 8) + 8; // 8-15 likes
                const shuffledPosts = [...otherUserPosts].sort(() => 0.5 - Math.random());
                const postsToLike = shuffledPosts.slice(0, likesToAdd);
                
                // Add likes
                for (const postId of postsToLike) {
                    try {
                        await likePost({
                            variables: { postID: postId }
                        });
                    } catch (error) {
                        console.log(`Already liked post ${postId} or error occurred`);
                    }
                }
                
                // Each user comments on 3-6 random posts
                const commentsToAdd = Math.floor(Math.random() * 4) + 3; // 3-6 comments
                const postsToComment = shuffledPosts.slice(0, commentsToAdd);
                
                for (const postId of postsToComment) {
                    const randomComment = commentData[Math.floor(Math.random() * commentData.length)];
                    try {
                        await createComment({
                            variables: {
                                postId: postId,
                                content: randomComment
                            }
                        });
                    } catch (error) {
                        console.log(`Error commenting on post ${postId}:`, error.message);
                    }
                }
                
                console.log(` Added ${likesToAdd} likes and ${commentsToAdd} comments for ${user.username}`);
                
            } catch (userError) {
                console.error(` Error adding interactions for ${user.username}:`, userError);
            }
        }
    
        console.log("Phase 2 complete! All interactions added.");
    };

    const handleAddFriendsToUsers = async () => {
        try {
            // First 6 users will receive friend requests from the last 6 users
            for (let i = 0; i < users.length - 6; i++) {
                const user = users[i];
                console.log(`Processing user ${i + 1}/${users.length - 6}: ${user.username}`);
                
                try {
                    // 1. Login as this user (receiver)
                    const { data: loginData } = await login({
                        variables: {
                            username: user.username,
                            password: user.password
                        }
                    });
                    
                    localStorage.setItem("user-token", loginData.login);
                    
                    // 2. Accept the friend request with the provided ID
                    await handlefriendRequest({
                        variables: {
                            senderId: "685bf424481e38e5155c706f",
                            action: true  // true = accept, false = reject
                        }
                    });
                    
                    console.log(`✓ ${user.username} accepted friend request`);
                    
                } catch (userError) {
                    console.error(`❌ Error processing user ${user.username}:`, userError);
                }
            }
            
            // Clean up
            localStorage.removeItem("user-token");
            console.log("🎉 All friend requests processed!");
            alert("Friend requests have been accepted by the first 6 users!");
            
        } catch (error) {
            console.error("❌ Error in handleAddFriendsToUsers:", error);
            localStorage.removeItem("user-token");
        }
    };

    return (
        <div>
            <h1>Admin Page</h1>
            <button onClick={handleCreateUsers}>Create Users</button>
            <button onClick={handleCompleteUserSetup}>Complete User Setup</button>
            <button onClick={handleAddFriendsToUsers}>Add Friends to Users</button>

        </div>
    )
}