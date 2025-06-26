import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { RESET_PASSWORD } from '../../data/queries';
import { PasswordInput, Button, Card, Title, Text, Alert, Stack } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const [resetPassword, { loading, error }] = useMutation(RESET_PASSWORD, {
        onCompleted: () => {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return;
        }

        resetPassword({ 
            variables: { 
                token, 
                newPassword: password 
            } 
        });
    };

    if (success) {
        return (
            <Card shadow="sm" p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: '0 auto' }}>
                <Alert icon={<IconCheck size={16} />} title="Password Reset!" color="green" mb="md">
                    Your password has been successfully reset. Redirecting to login...
                </Alert>
            </Card>
        );
    }

    return (
        <Card shadow="sm" p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: '0 auto' }}>
            <Title order={2} ta="center" mb="md">Set New Password</Title>

            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {error && (
                        <Alert icon={<IconX size={16} />} title="Error" color="red">
                            {error.message}
                        </Alert>
                    )}

                    <PasswordInput
                        label="New Password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        description="Minimum 6 characters"
                    />

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        error={password !== confirmPassword && confirmPassword ? "Passwords don't match" : null}
                    />

                    <Button 
                        type="submit" 
                        fullWidth 
                        loading={loading}
                        disabled={password !== confirmPassword || password.length < 6}
                    >
                        Reset Password
                    </Button>
                </Stack>
            </form>
        </Card>
    );
}