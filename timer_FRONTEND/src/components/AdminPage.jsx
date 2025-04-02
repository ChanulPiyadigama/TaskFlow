import { useAuth } from "../context/AuthContext"
import { CREATE_USER, LOGIN, CREATE_STUDY_SESSION, CREATE_USER_STUDY_SESSION_POST, GET_ALL_USER_STUDY_SESSIONS, SEND_FRIEND_REQUEST  } from "../queries"
import { useMutation, useQuery } from "@apollo/client"
import { studySessionData } from "./TestingData"
import { useApolloClient } from "@apollo/client"

export default function AdminPage() {
      const { token, setToken } = useAuth()
    
      const users = [
        { username: "user2", password: "2", name: "Olivia" },
        { username: "user3", password: "3", name: "Noah" },
        { username: "user4", password: "4", name: "Emma" },
        { username: "user5", password: "5", name: "Oliver" },
        { username: "user6", password: "6", name: "Ava" },
        { username: "user7", password: "7", name: "Elijah" },
        { username: "user8", password: "8", name: "Sophia" },
        { username: "user9", password: "9", name: "James" },
        { username: "user10", password: "10", name: "Isabella" }
      ]
      const client = useApolloClient()
      const [createUser] = useMutation(CREATE_USER)
      const [login] = useMutation(LOGIN)
      const [createStudySession] = useMutation(CREATE_STUDY_SESSION)
      const [createUserStudySessionPost] = useMutation(CREATE_USER_STUDY_SESSION_POST)
      
      const getUserPosts =  () =>{
        return  useQuery(GET_ALL_USER_STUDY_SESSIONS)
      }
    
      const handleCreateUsers = async () => {
        for (const user of users) {
          await createUser({ variables: user })
        }
        alert("Users created successfully!")
      }

      // Function to fill users with study sessions, first log in each user then set token to context so we
      //can send the request, and for each user iterate through 4 of items in array containing studysesssion
      //varaibles 
      const handleFillUsersStudysessions = async () => {
        // iterate throughe each user, and use i to determine which 4 study sessions to use
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            try {
                // 1. Login as this user
                const { data } = await login({
                    variables: {
                        username: user.username,
                        password: user.password
                    }
                });
                
                localStorage.setItem("user-token", data.login); // Store the token in local storage
    
                // 2. Get this user's 4 study sessions (indices 4*i to 4*i+3)
                const startIdx = i * 4;
                const userSessions = studySessionData.slice(startIdx, startIdx + 4);
    
                // 3. Create each study session for this user
                for (const session of userSessions) {
                    await createStudySession({
                        variables: {
                            startTimeIsoString: session.startTimeIsoString,
                            title: session.title,
                            description: session.description,
                            duration: session.duration
                        }
                    });
                }
    
                console.log(`Created 4 study sessions for ${user.username}`);
            } catch (error) {
                console.error(`Error creating sessions for ${user.username}:`, error);
            }
        }
        localStorage.removeItem("user-token"); // Remove the token from local storage after use
        alert("All users have been filled with study sessions!");
    };

    const handlePostUserStudySessions = async () => {
      // Process users sequentially
      for (let i = 0; i < users.length; i++) {
          const user = users[i];
          try {
              // 1. Login as this user
              const { data: loginData } = await login({
                  variables: {
                      username: user.username,
                      password: user.password
                  }
              });
              
              // 2. Set token and wait for it to be available
              localStorage.setItem("user-token", loginData.login);
              
              // 3. Execute the query and wait for results
              const { data: studySessionData } = await client.query({
                  query: GET_ALL_USER_STUDY_SESSIONS,
                  fetchPolicy: 'network-only' // Force fetch from server
              });
  
              // 4. Create posts for each session
              if (studySessionData?.getUserStudySessions) {
                  for (const session of studySessionData.getUserStudySessions) {
                      await createUserStudySessionPost({
                          variables: {
                              title: session.title,
                              description: session.description,
                              exclusions: {
                                  excludeTime: false 
                              },
                              studySessionId: session.id
                          }
                      });
                  }
                  console.log(`Created posts for ${user.username}'s sessions`);
              }
  
          } catch (error) {
              console.error(`Error processing user ${user.username}:`, error);
          }
      }
      
      // Clean up
      localStorage.removeItem("user-token");
      alert("Finished creating posts for all users!");
  };

    const user1AddFriends = async () => {
      const { data } = await login({
          variables: {
              username: "user1",
              password: "1"
          }
      });
      localStorage.setItem("user-token", data.login); // Store the token in local storage
      
    }


    return (
        <div>
            <h1>Admin Page</h1>
            <button onClick={handleCreateUsers}>Create Users</button> {/* Button to trigger the creation of users */}
            <button onClick={handleFillUsersStudysessions}>Fill Users with Studysessions</button>
            <button onClick={handlePostUserStudySessions}>Post all user studysessions</button>

        </div>
    )
}