import { useMutation } from "@apollo/client";
import { CREATE_TIMER } from "../queries";
import { useNavigate } from "react-router-dom";
import { GET_USER_TIMERS } from "../queries";
import { useApolloClient } from "@apollo/client";
//sends mutation to create timer when form is submitted, loading rerenders then when data arrives page will rerender again
export default function CreateTimerForm() {
    const navigate = useNavigate()
    const client = useApolloClient()
    const [createTimer, { loading, error }] = useMutation(CREATE_TIMER, {
      //since navigate could happen before cache is updated, we use update to make sure cache is updated first
      update: (cache, { data }) => {
          if (!data) return;
          const newTimer = data.createTimer;

          const existingTimers = cache.readQuery({ query: GET_USER_TIMERS });

          // Update the cache with the new timer
          cache.writeQuery({
              query: GET_USER_TIMERS,
              data: {
                  getUserTimers: existingTimers
                      ? [...existingTimers.getUserTimers, newTimer]
                      : [newTimer],
              },
          });

          // Navigate AFTER the cache has been updated
          navigate(`/timer/${newTimer.id}`);
      },
      onError: (error) => {
          console.error("Error creating timer:", error);
      },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const startTime = new Date().toISOString();
    const totalTime = e.target.totalTime.value.trim()
    createTimer({
      variables: {
        totalTime: parseInt(totalTime, 10),
        startTime,
      },
    });
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Start Study Session!</h2>
      <label htmlFor="totalTime">Total Time (seconds):</label>
      <input
        type="number"
        id="totalTime"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Timer"}
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
}