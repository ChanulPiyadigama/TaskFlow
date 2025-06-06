import { Button, Group, Stack, Text } from '@mantine/core';
import { useModal } from '../../context/ModalContext';

export default function ResetTimerModal({ onConfirm}) {
    const { closeModal } = useModal();
    return (
    <Stack align="center" spacing="lg">
        <Text size="lg" fw={500}>
        Are you sure you want to reset the timer?
        </Text>
        <Text size="sm" c="dimmed">
        This will reset the timer to its original duration.
        </Text>
        <Group mt="md">
        <Button variant="light" color="gray" onClick={closeModal}>
            Cancel
        </Button>
        <Button color="red" onClick={onConfirm}>
            Reset Timer
        </Button>
        </Group>
    </Stack>
    );
}