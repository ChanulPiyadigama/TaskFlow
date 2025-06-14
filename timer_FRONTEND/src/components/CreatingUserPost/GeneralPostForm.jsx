

export default function GeneralPostForm(){
    const [content, setContent] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the content to your backend
        console.log("Post content submitted:", content);
        setContent(""); // Clear the input after submission
    };

    return (
        <form onSubmit={handleSubmit}>
            <Textarea 
                placeholder="Whats on your mind?" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                required
            />
            <Button type="submit" fullWidth mt="md">Post</Button>
        </form>
    );
}