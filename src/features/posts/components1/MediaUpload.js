// Post media upload

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('post[content]', content);
  formData.append('post[category]', 'voice');
  formData.append('post[media]', fileInput.files[0]); // The actual file

  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // Do NOT set Content-Type header manually
    body: formData
  });
}