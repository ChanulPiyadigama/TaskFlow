import { useAuth } from "../context/AuthContext";
import CreateTimerForm from "./CreateTimerForm";
import TimerList from "./TimerList";
import Friends from "./Friends";
import { AppShell, Button, Text, Group } from '@mantine/core';
import { IconHome, IconClock, IconUsers } from "@tabler/icons-react";
import { useState } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const [opened, setOpened] = useState(true);

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Text size="xl" fw={700}>TaskFlow</Text>
          <Group>
            <Button leftSection={<IconClock />} variant="subtle">
              Timers
            </Button>
            <Button leftSection={<IconUsers />} variant="subtle">
              Friends
            </Button>
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Main>
        <h1>Hey {user.user}</h1>
        <CreateTimerForm />
        <TimerList />
        <Friends />
      </AppShell.Main>
    </AppShell>
  );
}