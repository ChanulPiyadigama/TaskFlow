import { CREATE_USER } from "../../data/queries";
import { useMutation } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { 
    TextInput, 
    PasswordInput, 
    Button, 
    Card, 
    Title, 
    Text, 
    Loader, 
    Stack,
    Alert
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function Register() {
    const { setToken, setUser } = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        name: "",
        email: ""
    });
    const [passwordMatch, setPasswordMatch] = useState(true);

    const [createUser, { loading, data, error }] = useMutation(CREATE_USER, {
        onError: (error) => {
            console.error("Registration error:", error);
        },
    });

    // Check if passwords match whenever they change
    useEffect(() => {
        if (formData.confirmPassword) {
            setPasswordMatch(formData.password === formData.confirmPassword);
        } else {
            setPasswordMatch(true); // Don't show error if confirm field is empty
        }
    }, [formData.password, formData.confirmPassword]);

    // Handle successful registration
    useEffect(() => {
        if (data) {
            const token = data.createUser;
            setToken(token);
            localStorage.setItem("user-token", token);
            const decodedToken = jwtDecode(token);
            setUser(decodedToken);
        }
    }, [data, setToken, setUser]);

    const handleInputChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.username || !formData.password || !formData.name || !formData.email) {
            return; // Form validation will show required field errors
        }

        if (formData.password !== formData.confirmPassword) {
            return; // Password mismatch error already shown
        }

        if (formData.password.length < 6) {
            return; // Let server validation handle this
        }

        createUser({ 
            variables: { 
                username: formData.username,
                password: formData.password,
                name: formData.name,
                email: formData.email
            } 
        });
    };

    return (
        <Card shadow="sm" p="xl" radius="md" withBorder style={{ maxWidth: 400, margin: '0 auto' }}>
            <Title order={2} ta="center" mb="md">
                Create Account
            </Title>
            
            <Text size="sm" ta="center" mb="xl" c="dimmed">
                Join our study community
            </Text>

            <form onSubmit={handleRegister}>
                <Stack gap="md">
                    {error && (
                        <Alert 
                            icon={<IconX size={16} />} 
                            title="Registration Failed" 
                            color="red"
                            variant="light"
                        >
                            {error.message}
                        </Alert>
                    )}

                    <TextInput
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        required
                        withAsterisk
                        disabled={loading}
                    />

                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        required
                        withAsterisk
                        disabled={loading}
                    />

                    <TextInput
                        label="Username"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        required
                        withAsterisk
                        disabled={loading}
                        description="3-20 characters, letters, numbers, and underscores only"
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Choose a password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        required
                        withAsterisk
                        disabled={loading}
                        description="Minimum 6 characters"
                    />

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        required
                        withAsterisk
                        disabled={loading}
                        error={!passwordMatch ? "Passwords do not match" : null}
                        rightSection={
                            formData.confirmPassword && passwordMatch ? (
                                <IconCheck size={16} color="green" />
                            ) : null
                        }
                    />

                    <Button 
                        type="submit" 
                        fullWidth 
                        size="md"
                        disabled={
                            loading || 
                            !passwordMatch || 
                            !formData.username || 
                            !formData.password || 
                            !formData.name || 
                            !formData.email
                        }
                    >
                        {loading ? <Loader size="sm" /> : "Create Account"}
                    </Button>
                </Stack>
            </form>
        </Card>
    );
}