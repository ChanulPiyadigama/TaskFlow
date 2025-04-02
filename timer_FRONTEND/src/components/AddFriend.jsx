import { useState, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USERS} from "../queries";
import { debounce } from "lodash";
import { 
    TextInput, 
    Title, 
    Paper, 
    Stack,
    Group, 
    Button, 
    Text,
    Loader,
    Card
  } from "@mantine/core";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function AddFriend() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUsers, { data, loading, error }] = useLazyQuery(SEARCH_USERS);
  const navigate = useNavigate();

  //the debounce function returns a timer that once up will run a function in this case the
  //search query
  //
  //its held in a usecallback so that when the componenet rerenders due to searchterm state, it will be
  //remembered and so the timer will be running in this new reneder and if the user doesnt type
  //within the given time, the search will be sent (700ms works best)
  const handleSearchChange = useCallback(
    debounce((term) => {
      searchUsers({ variables: { query: term } });
    }, 700),
    []
  );

  //when user types in search we set in state and begin the debounce which is a timer that once up
  //will send the search query, this prevents a query being sent with every type
  const onInputChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearchChange(e.target.value);
  };

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
        {data?.searchUsers?.map((user) => (
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
              <Button 
                variant="light"
                leftSection={<IconUserPlus size={16} />}
                onClick={() => sendFriendRequest(user.id)}
              >
                Add Friend
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
