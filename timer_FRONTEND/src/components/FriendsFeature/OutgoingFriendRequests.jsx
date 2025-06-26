import { useQuery } from "@apollo/client";
import { GET_USER_OUTGOING_FRIEND_REQUESTS } from "../../data/queries";
import { 
  Text, 
  Stack, 
  Card, 
  Group, 
  Avatar, 
  Badge, 
  Title,
  Loader,
  Paper
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useNavigateToUser } from "../HelperFunctions/mainFeatureFunctions";

export const OutgoingFriendRequests = () => {
  const { loading, data, error } = useQuery(GET_USER_OUTGOING_FRIEND_REQUESTS);
  const navigateToUser = useNavigateToUser();
  if (loading) return <Loader size="md" />;
  if (error) return <Text c="red">Error loading friend requests</Text>;

  const requests = data.getUserOutgoingFriendRequests;

  return (
    <Paper p="md" withBorder>
      <Group mb="md">
        <IconSend size={20} />
        <Title order={4}>Outgoing Friend Requests</Title>
      </Group>

      {requests.length === 0 ? (
        <Text c="dimmed" size="sm">No outgoing friend requests</Text>
      ) : (
        <Stack spacing="xs">
          {requests.map((friendReq) => (
            <Card key={friendReq.id} withBorder shadow="sm" p="sm" onClick={() => navigateToUser(friendReq.id)}>
              <Group position="apart">
                <Group>
                  <Avatar 
                    src={null} 
                    color="blue" 
                    radius="xl"
                  >
                    {friendReq.name.charAt(0)}
                  </Avatar>
                  <div>
                    <Text fw={500}>{friendReq.name}</Text>
                    <Text size="xs" c="dimmed">@{friendReq.username}</Text>
                  </div>
                </Group>
                <Badge color="blue" variant="light">Pending</Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Paper>
  );
};