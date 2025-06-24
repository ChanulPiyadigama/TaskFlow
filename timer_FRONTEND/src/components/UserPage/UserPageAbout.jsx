import { Stack, Text, Title } from "@mantine/core";
import { useAuth } from "../../context/AuthContext";

export default function UserPageAbout() {
    const { user} = useAuth();
    console.log(user)
    return (
        <Stack spacing="md">
            <div>
                <Text size="sm" c="dimmed">Name</Text>
                <Title order={3}>{user.name}</Title>
            </div>
            <div>
                <Text size="sm" c="dimmed">Username</Text>
                <Title order={3}>@{user.username}</Title>
            </div>
            <div>
                <Text size="sm" c="dimmed">Email</Text>
                <Title order={3}>@{user.email}</Title>
            </div>
        </Stack>
    );
}