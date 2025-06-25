import { LOGIN } from "../../data/queries";
import { useMutation } from "@apollo/client";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { TextInput, PasswordInput, Button, Card, Title, Text, Loader, Stack, Divider, Anchor } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import AdminPage from "./AdminActions";

export default function Login() {
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [login, { loading, data, error }] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (data) {
      const token = data.login;
      setToken(token);
      localStorage.setItem("user-token", token);
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken);
      setUser(decodedToken);
    }
  }, [data, setToken, setUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    login({ variables: { username, password } });
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  //card is a container that you can style, A title is a H1-H6 tag with 2 here
  //autofoucs puts the curoser on the input on mounting
  //when loading, a loader is shown wich is samll spinning icon
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 400, margin: "auto", marginTop: 50 }}>
      <Title order={2} mb="md">Login</Title>
      {error && <Text c="red">{error.message}</Text>}
      <form onSubmit={handleLogin}>
        <Stack>
          <TextInput label="Username" name="username" required autoFocus />
          <PasswordInput label="Password" name="password" required />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? <Loader size="sm" /> : "Login"}
          </Button>
          <AdminPage/>
        </Stack>
      </form>
      <Text size="sm" ta="right">
        <Anchor 
            component="button" 
            type="button"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
        >
            Forgot password?
        </Anchor>
    </Text>
      
      <Divider my="md" label="or" labelPosition="center" />
      
      <Stack gap="sm">
        <Text size="sm" ta="center" c="dimmed">
          Don't have an account?
        </Text>
        <Button 
          variant="outline" 
          fullWidth 
          onClick={handleRegisterClick}
          disabled={loading}
        >
          Create Account
        </Button>
      </Stack>
    </Card>
  );
}