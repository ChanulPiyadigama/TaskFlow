import { useState, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USERS} from "../queries";
import { debounce } from "lodash";


export default function AddFriend() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUsers, { data, loading, error }] = useLazyQuery(SEARCH_USERS);

  //the debounce function returns a timer that once up will run a function in this case the
  //search query
  //
  //its held in a usecallback so that when the componenet rerenders due to searchterm state, it will be
  //remembered and so the timer will be running in this new reneder and if the user doesnt type
  //within the given time, the search will be sent (700ms works best)
  const handleSearchChange = useCallback(
    debounce((term) => {
      searchUsers({ variables: { query: term } });
    }, 700),
    []
  );

  //when user types in search we set in state and begin the debounce which is a timer that once up
  //will send the search query, this prevents a query being sent with every type
  const onInputChange = (e) => {
    setSearchTerm(e.target.value);
    handleSearchChange(e.target.value);
  };

  return (
    <div>
      <h2>Find Friends</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={onInputChange}
      />
      {loading && <p>Searching...</p>}
      {error && <p>Error: {error.message}</p>}
      {data?.searchUsers?.length
        ? data.searchUsers.map((user) => (
            <div key={user.id}>
              {user.username}
              <button onClick={() => sendFriendRequest(user.id)}>Add</button>
            </div>
          ))
        : null}
    </div>
  );
}
