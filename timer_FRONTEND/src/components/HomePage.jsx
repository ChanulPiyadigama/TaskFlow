import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Friends from "./Friends";
import { AppShell, Button, Text, Group, Grid, Card, Stack, Modal } from '@mantine/core';
import { IconClock, IconUsers, IconPlus, IconBook, IconUserPlus } from "@tabler/icons-react";
import CreateStudySessionForm from "./CreatStudySessionForm";
import PreviousStudySessionsList from "./PreviousStudySessionsList";
import CreateUserPost from "./CreateUserPost";
import PostsScroll from "./PostsScroll";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import AddFriend from "./AddFriend";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate()
  const { openModal } = useModal()

  return (
    <div>
      {/*we use a grid, it has fixed 12 columns so the middle takes 6 of them since it will be largest
      each column had a card which is basically a container that you can style and within each container
      is a stack which automatically stacks the componenets with flex vertical, giving even spacing */}

        <Grid gutter="md">
          {/* LEFT SIDEBAR (User Info & Actions) */}
          <Grid.Col span={3}>
            <Card shadow="sm" p="md">
              <Text fw={700} size="lg">👋 Hey {user.name}</Text>
              <Stack mt="md">
                <Button onClick={() => openModal(<Friends/>)} leftSection={<IconUserPlus />} fullWidth>Friends</Button>
                <Button onClick={() => openModal(<AddFriend/>)} leftSection={<IconUserPlus />} fullWidth>Add Friend</Button>
                <Button onClick={() => openModal(<CreateUserPost/>)} leftSection={<IconPlus />} fullWidth>Create Post</Button>
                <Button onClick={() => openModal(<CreateStudySessionForm/>)} leftSection={<IconBook />} fullWidth>Start Study Session</Button>
                <PreviousStudySessionsList />
              </Stack>
            </Card>
          </Grid.Col>

          {/* MIDDLE SECTION (Main Feed - Posts) */}
          <Grid.Col span={6}>
            <Card shadow="sm" p="md">
              <Text fw={700} size="lg">📢 Study Feed</Text>
              <PostsScroll/>
            </Card>
          </Grid.Col>

          {/* RIGHT SIDEBAR (Future Features) */}
          <Grid.Col span={3}>
            <Card shadow="sm" p="md">
              <Text fw={700} size="lg">🚀 Coming Soon</Text>
              <Text size="sm">Suggested friends, challenges, and study clubs.</Text>
            </Card>
          </Grid.Col>
        </Grid>
      </div>
  );
}
