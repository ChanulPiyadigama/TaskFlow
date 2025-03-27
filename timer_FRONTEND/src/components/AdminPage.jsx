import { useAuth } from "../context/AuthContext"
import { CREATE_USER } from "../queries"
import { useMutation } from "@apollo/client"

export default function AdminPage() {
      const { user } = useAuth()
    
      const users = [
        { username: "user2", password: "2", name: "Olivia" },
        { username: "user3", password: "3", name: "Noah" },
        { username: "user4", password: "4", name: "Emma" },
        { username: "user5", password: "5", name: "Oliver" },
        { username: "user6", password: "6", name: "Ava" },
        { username: "user7", password: "7", name: "Elijah" },
        { username: "user8", password: "8", name: "Sophia" },
        { username: "user9", password: "9", name: "James" },
        { username: "user10", password: "10", name: "Isabella" }
      ]
      
      const [createUser] = useMutation(CREATE_USER)
    
      const handleCreateUsers = async () => {
        for (const user of users) {
          await createUser({ variables: user })
        }
        alert("Users created successfully!")
      }
    return (
        <div>
            <h1>Admin Page</h1>
            <button onClick={handleCreateUsers}>Create Users</button> {/* Button to trigger the creation of users */}

        </div>
    )
}