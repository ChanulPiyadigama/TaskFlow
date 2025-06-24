import { AppShell, Button, Text, Group } from '@mantine/core';
import { IconClock, IconUsers, IconUser } from "@tabler/icons-react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Friends from '../components/FriendsFeature/Friends';
import { useModal } from '../context/ModalContext';

//all pages that are children of this componenet will have this layout, the content of the children will placed 
//in the main through outlet, so they wont need to define the layout (appshell with header) again in their own page
export default function AppLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useModal();

  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Text size="xl" fw={700} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            TaskFlow
          </Text>
          <Group>
            <Button leftSection={<IconUsers />} variant="subtle" onClick={() => openModal(<Friends/>)}>Friends</Button>
            <Button 
              leftSection={<IconUser />}
              variant="subtle" 
              onClick={() => navigate(`UserPage/${user.id}`)}
            >
              {user.user}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}