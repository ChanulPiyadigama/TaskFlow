import { useState, useCallback } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { SEARCH_USERS, SEND_FRIEND_REQUEST, GET_USER_OUTGOING_FRIEND_REQUESTS, GET_USER_FRIENDS} from "../../data/queries";
import { debounce } from "lodash";
import { 
    TextInput, 
    Title, 
    Stack,
    Group, 
    Button, 
    Text,
    Loader,
    Card
  } from "@mantine/core";
import { IconSearch, IconUserPlus, IconCheck, IconUserCheck } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


/*
  This component is used to search for users through a search bar and add them, in the add friends section.
  
  First we use a uselazyquery which allows us to run the query when we want to, not when the component mounts. (1)

  When the user types in the search bar, it sets the search term in state and begins a debounce timer (2),
  which is in a usecallback so its remembered when the component rerenders. When the timer is up, it
  runs whatever is inside, in this case that lazy query to search for users. (3)
  
  If the user types before the timer a new timer will be created, and the process will repeat. 

  Now when a we click add friend we trigger the send friend mutation, and refetch the outgoing 
  requests so that the page will rerender and show we have sent a request. (4)

  Also we check the user's relation with each of the users we found, for example we search a found
  user through the users sent requests data, and if matches we display a differnt button. (5)

*/
export default function AddFriend() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  //(1)
  const {loading: loadingOutgoingFriendRequests, data: dataOutgoingFriendRequests, error: errorOutgoingFriendRequests} = useQuery(GET_USER_OUTGOING_FRIEND_REQUESTS)
  const {loading: loadingUserFriends, data: dataUserFriends, error: errorUserFriends} = useQuery(GET_USER_FRIENDS)
  const [searchUsers, { data, loading, error }] = useLazyQuery(SEARCH_USERS);


  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST,{
    //(4)
    refetchQueries: [
      { query: GET_USER_OUTGOING_FRIEND_REQUESTS }
    ]
  });
  const navigate = useNavigate();

  
  //(3)
  const handleSearchChange = useCallback(
    debounce((term) => {
      searchUsers({ variables: { query: term } });
    }, 700),
    []
  );

  //(2)
  const onInputChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearchChange(e.target.value);
  };

  //(5)
  const renderRelationshipButton = (user) => {
    const isFriend = dataUserFriends?.getUserFriends?.some(
      friend => friend.id === user.id
    );
    
    const isRequestSent = dataOutgoingFriendRequests?.getUserOutgoingFriendRequests?.some(
      requestUser => requestUser.id === user.id
    );
    
    if (isFriend) {
      return (
        <Button 
          variant="filled"
          color="green"
          leftSection={<IconUserCheck size={16} />}
          disabled
        >
          Friends
        </Button>
      );
    }
    
    if (isRequestSent) {
      return (
        <Button 
          variant="light"
          leftSection={<IconCheck size={16} />}
          disabled
        >
          Request Sent
        </Button>
      );
    }
    
    return (
      <Button 
        variant="light"
        leftSection={<IconUserPlus size={16} />}
        onClick={() => sendFriendRequest({ variables: { receiverId: user.id } })}
      >
        Add Friend
      </Button>
    );
  };

  if (loadingOutgoingFriendRequests || loadingUserFriends) return <Loader size="sm" />;
  if (errorOutgoingFriendRequests) return <Text c="red" size="sm">Error: {errorOutgoingFriendRequests.message}</Text>;
  const users = data?.searchUsers?.filter(foundUser => foundUser.username !== user.username) || [];
  return (
    <Stack spacing="md">
      <Title order={2}>Find Friends</Title>
      
      <TextInput
        placeholder="Search users..."
        value={searchTerm}
        onChange={onInputChange}
        leftSection={<IconSearch size={16} />}
        size="md"
      />

      {loading && (
        <Loader size="sm" />
      )}
      
      {error && (
        <Text c="red" size="sm">
          Error: {error.message}
        </Text>
      )}

      <Stack spacing="xs">
        {users.map((user) => (
          <Card key={user.id} withBorder shadow="sm">
            <Group justify="space-between" align="center">
              <div
              onClick={() =>  navigate(`UserPage/${user.id}`)}
              >
                <Text fw={500}>{user.username}</Text>
                <Text size="sm" c="dimmed">
                  {user.name}
                </Text>
              </div>
              {renderRelationshipButton(user)}

            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
