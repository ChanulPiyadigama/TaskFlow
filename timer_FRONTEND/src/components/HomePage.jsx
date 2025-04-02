import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Friends from "./Friends";
import { AppShell, Button, Text, Group, Grid, Card, Stack, Modal } from '@mantine/core';
import { IconClock, IconUsers, IconPlus, IconBook, IconUserPlus } from "@tabler/icons-react";
import CreateStudySessionForm from "./CreatStudySessionForm";
import PreviousStudySessionsList from "./PreviousStudySessionsList";
import CreateUserPost from "./CreateUserPost";

export default function HomePage() {
  const { user } = useAuth();
  const [modalOpened, setModalOpened] = useState(false)
  const [modelContent, setModelContent] = useState("")

  //enum for modal types
  const ModalType = {
    STUDY_SESSION: "Study Session",
    CREATE_POST: "Create Post",
    FRIENDS: "Friends",
    ADD_FRIEND: "Add Friend",
  };

  const openModal = (type) => {
    setModelContent(type);
    setModalOpened(true);
  };


  const closeModal = () => {
    setModelContent("")
    setModalOpened(false)
  }

  const displayModalContent = () => {
    switch (modelContent) {
      case "Study Session":
        return (
          <CreateStudySessionForm />
        )
      case "Create Post":
        return (
          <CreateUserPost />
        )
      case "Friends":
        return (
          <Friends />
        )
      case "Add Friend":
        return <Friends /> 
      default:
        return null
    } 
  }

  return (
    <AppShell padding="md" header={{ height: 60 }}>
      {/* HEADER */}
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Text size="xl" fw={700}>TaskFlow</Text>
          <Group>
            <Button leftSection={<IconClock />} variant="subtle">Timers</Button>
            <Button leftSection={<IconUsers />} variant="subtle">Friends</Button>
          </Group>
        </Group>
      </AppShell.Header>

      {/* MODAL FOR STARTING STUDY SESSION */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={modelContent}
        centered
        size="60%"
      >
        {displayModalContent()}
        <Button fullWidth onClick={closeModal}>Close</Button>
      </Modal>

      {/*we use a grid, it has fixed 12 columns so the middle takes 6 of them since it will be largest

      each column had a card which is basically a container that you can style and within each container
      
      is a stack which automatically stacks the componenets with flex vertical, giving even spacing */}
      <AppShell.Main>
        <Grid gutter="md">
          {/* LEFT SIDEBAR (User Info & Actions) */}
          <Grid.Col span={3}>
            <Card shadow="sm" p="md">
              <Text fw={700} size="lg">👋 Hey {user.user}</Text>
              <Stack mt="md">
                <Button onClick={() => openModal(ModalType.FRIENDS)} leftSection={<IconUserPlus />} fullWidth>Friends</Button>
                <Button onClick={() => openModal(ModalType.FRIENDS)} leftSection={<IconUserPlus />} fullWidth>Add Friend</Button>
                <Button onClick={() => openModal(ModalType.CREATE_POST)} leftSection={<IconPlus />} fullWidth>Create Post</Button>
                <Button onClick={() => openModal(ModalType.STUDY_SESSION)} leftSection={<IconBook />} fullWidth>Start Study Session</Button>
                <PreviousStudySessionsList />
              </Stack>
            </Card>
          </Grid.Col>

          {/* MIDDLE SECTION (Main Feed - Posts) */}
          <Grid.Col span={6}>
            <Card shadow="sm" p="md">
              <Text fw={700} size="lg">📢 Study Feed</Text>

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
      </AppShell.Main>
    </AppShell>
  );
}
