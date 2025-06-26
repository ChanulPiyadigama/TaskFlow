import { Stack, Text, Title } from "@mantine/core";
import { useAuth } from "../../context/AuthContext";

export default function UserPageAbout(displayedUser) {
    const { user} = useAuth();
    const dislpayedUserData = displayedUser.displayedUser
    return (
        <Stack spacing="md">
            <div>
                <Text size="sm" c="dimmed">Name</Text>
                <Title order={3}>{dislpayedUserData.name}</Title>
            </div>
            <div>
                <Text size="sm" c="dimmed">Username</Text>
                <Title order={3}>@{dislpayedUserData.username}</Title>
            </div>
            {user.id == dislpayedUserData.id && <div>
                <Text size="sm" c="dimmed">Email</Text>
                <Title order={3}>@{user.email}</Title>
            </div>}
        </Stack>
    );
}