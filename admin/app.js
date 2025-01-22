document.getElementById('make-post-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    fetch('http://127.0.0.1:5000/make-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer website135'
        },
        body: JSON.stringify({ title, content_body: content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Post created successfully.") {
            document.getElementById('message').textContent = "Post created successfully!";
        } else {
            document.getElementById('message').textContent = "Error creating post.";
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('edit-post-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const postId = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;

    fetch('http://127.0.0.1:5000/edit-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer website135'
        },
        body: JSON.stringify({ id: postId, title, content_body: content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('message').textContent = data.message;
        } else {
            document.getElementById('message').textContent = data.error || "Error editing post.";
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('delete-post-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const postId = document.getElementById('delete-id').value;

    fetch(`http://127.0.0.1:5000/delete/${postId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer website135'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('message').textContent = data.message;
        } else {
            document.getElementById('message').textContent = data.error || "Error deleting post.";
        }
    })
    .catch(error => console.error('Error:', error));
});
