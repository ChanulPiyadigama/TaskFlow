import { GET_ALL_USER_STUDY_SESSIONS } from "../queries";
import { useQuery } from "@apollo/client";
import { List, Loader, Text, Title, Paper } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function PreviousStudySessionsList() {
    const { loading: loadingStudySessions, data: dataStudySessions, error: errorStudySessions } = useQuery(GET_ALL_USER_STUDY_SESSIONS);
    const navigate = useNavigate();

    //mantine loader, deafult to small spinner
    if (loadingStudySessions) return <Loader />;
    if (errorStudySessions) return <Text c="red">Error loading study sessions</Text>;

    //safety check for dataStudySessions, if null or undefined, return empty array, so map wont break
    const userStudySessions = dataStudySessions?.getUserStudySessions || [];

    //sort then extract, also use a new array to avoid mutating the original array
    const latestUserStudySessions = [...userStudySessions].sort((a, b) => new Date(b.lastInteraction) - new Date(a.lastInteraction))
    .slice(0, 5);

    return (
        <div>
            <Title order={2} mb="md">
                Previous Study Sessions
            </Title>
            <List spacing="sm" styles={{ itemWrapper: { listStyleType: "none" } }}>
                {latestUserStudySessions.map((session) => (
                    <Paper
                        key={session.id}
                        shadow="xs"
                        p="md"
                        radius="md"
                        withBorder
                        sx={{
                            cursor: "pointer",
                            transition: "transform 0.1s ease-in-out",
                            "&:hover": { transform: "scale(1.02)" },
                        }}
                        onClick={() => navigate(`/StudySession/${session.id}`)}
                    >
                        <Text size="sm">{session.title}</Text>                       
                        <Text size="lg" weight={700}>
                            {session.timer.timeLeft}
                        </Text>
                    </Paper>
                ))}
            </List>
        </div>
    );
}
