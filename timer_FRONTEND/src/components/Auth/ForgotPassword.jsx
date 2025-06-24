import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET } from '../../data/queries';
import { TextInput, Button, Card, Title, Text, Alert, Stack } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [requestReset, { loading, error }] = useMutation(REQUEST_PASSWORD_RESET, {
        onCompleted: () => {
            setSuccess(true);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        requestReset({ variables: { email } });
    };

    if (success) {
        return (
            <Card shadow="sm" p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: '0 auto' }}>
                <Alert icon={<IconCheck size={16} />} title="Email Sent!" color="green" mb="md">
                    If an account with that email exists, we've sent a password reset link.
                </Alert>
                <Button fullWidth onClick={() => navigate('/login')}>
                    Back to Login
                </Button>
            </Card>
        );
    }

    return (
        <Card shadow="sm" p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: '0 auto' }}>
            <Title order={2} ta="center" mb="md">Reset Password</Title>
            <Text size="sm" ta="center" mb="xl" c="dimmed">
                Enter your email address and we'll send you a link to reset your password.
            </Text>

            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {error && (
                        <Alert icon={<IconX size={16} />} title="Error" color="red">
                            {error.message}
                        </Alert>
                    )}

                    <TextInput
                        label="Email Address"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />

                    <Button type="submit" fullWidth loading={loading}>
                        Send Reset Link
                    </Button>

                    <Button variant="subtle" fullWidth onClick={() => navigate('/login')}>
                        Back to Login
                    </Button>
                </Stack>
            </form>
        </Card>
    );
}