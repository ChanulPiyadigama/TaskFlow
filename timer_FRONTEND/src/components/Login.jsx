import { LOGIN } from "../queries";
import { useMutation } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { TextInput, PasswordInput, Button, Card, Title, Text, Loader, Stack } from "@mantine/core";

export default function Login() {
  const { setToken, setUser } = useAuth();
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
      setUser(decodedToken);
    }
  }, [data, setToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    login({ variables: { username, password } });
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
        </Stack>
      </form>
    </Card>
  );
}
