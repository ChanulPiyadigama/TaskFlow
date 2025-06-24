import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { 
    TextInput, 
    Button, 
    Stack, 
    Title, 
    Alert,
    Divider,
    Group,
    Container,       
    Center,
    Text           
} from '@mantine/core';
import { IconCheck, IconX, IconKey } from '@tabler/icons-react';
import { jwtDecode } from 'jwt-decode';
import { UPDATE_USER_DETAILS } from '../../data/queries';
import { useNavigate } from 'react-router-dom';

export const EditUserDetails = () => {
    const { user, setUser, setToken } = useAuth();
    const { closeModal } = useModal();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || ''
    });
    

    const [updateProfile, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_USER_DETAILS, {
        onCompleted: (data) => {
            // Update user state with new token containing updated info
            const newToken = data.updateUserDetails;
            setToken(newToken);
            localStorage.setItem("user-token", newToken);
            const decodedToken = jwtDecode(newToken);
            console.log(decodedToken)
            setUser(decodedToken);
            closeModal();
        },
        onError: (error) => {
            console.error('Error updating profile:', error);
        }
    });

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
            return;
        }

        updateProfile({
            variables: {
                name: formData.name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim().toLowerCase()
            }
        });
    };

    const handlePasswordReset = () => {
        navigate('/forgot-password')
        closeModal();
    };

    const hasChanges = () => {
        return (
            formData.name !== user?.name ||
            formData.username !== user?.username ||
            formData.email !== user?.email
        );
    };

    return (
        <Container size="xs" p="md"> 
            <Center>
                <Stack gap="lg" w="100%">
                    <Title order={2} ta="center">Edit Profile</Title>
                    
                    {updateError && (
                        <Alert 
                            icon={<IconX size={16} />} 
                            title="Update Failed" 
                            color="red"
                            variant="light"
                        >
                            {updateError.message}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                required
                                disabled={updateLoading}
                            />

                            <TextInput
                                label="Username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleInputChange('username')}
                                required
                                disabled={updateLoading}
                                description="3-20 characters, letters, numbers, and underscores only"
                            />

                            <TextInput
                                label="Email"
                                placeholder="Enter your email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                required
                                disabled={updateLoading}
                            />

                            <Group justify="space-between" mt="md">
                                <Button
                                    type="submit"
                                    disabled={!hasChanges() || updateLoading}
                                    loading={updateLoading}
                                >
                                    Save Changes
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    onClick={closeModal}
                                    disabled={updateLoading}
                                >
                                    Cancel
                                </Button>
                            </Group>
                        </Stack>
                    </form>

                    <Divider />

                    <Stack gap="sm">
                        <Button
                            leftSection={<IconKey size={14} />}
                            variant="light"
                            color="orange"
                            onClick={handlePasswordReset}
                            fullWidth
                        >
                            Reset Password
                        </Button>
                        <Text size="xs" ta="center" c="dimmed">
                            This will log you out
                        </Text>
                    </Stack>
                </Stack>
            </Center>
        </Container>
    );
};