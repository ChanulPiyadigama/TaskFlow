import { TextInput, Textarea } from '@mantine/core';

export default function PostInputs({ 
  title, 
  setTitle, 
  description, 
  setDescription,
  titleMaxLength = 100,
  descriptionMaxLength = 2000 
}) {
  return (
    <>
      <TextInput
        label="Title"
        placeholder="Enter your post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        withAsterisk
        maxLength={titleMaxLength}
        description={`${title.length}/${titleMaxLength} characters`}
      />

      <Textarea
        label="Description"
        placeholder="What's on your mind?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        minRows={4}
        maxLength={descriptionMaxLength}
        description={`${description.length}/${descriptionMaxLength} characters`}
      />
    </>
  );
}