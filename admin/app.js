
// Make Post Form Submission
document.getElementById('make-post-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author').value;
    const footer = document.getElementById('footer').value;
    const image = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content_body', content);
    formData.append('author', author);
    formData.append('footer', footer);
    if (image) formData.append('image', image);
    fetch(`${baseUrl}/make-post`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Post created successfully.") {
            document.getElementById('message').textContent = "Post created successfully!";
            alert(data.message);
        } else {
            document.getElementById('message').textContent = "Error creating post.";
            alert("Error creating post.");
        }
    })
    .catch(error => console.error('Error:', error));
});


document.getElementById('fetch-post').addEventListener('click', function () {
    const postId = document.getElementById('edit-id').value;

    if (!postId) {
        alert("Please enter a Post ID.");
        return;
    }

    fetch(`${baseUrl}/get-post/${postId}`, {
        method: 'GET',
        credentials: 'include'

    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            document.getElementById('edit-title').value = data.title;
            document.getElementById('edit-content').value = data.content_body;
            document.getElementById('edit-author').value = data.author || '';
            document.getElementById('edit-footer').value = data.footer || '';

            if (data.image) {
                const postImagePreview = document.getElementById('edit-post-image-preview');
                postImagePreview.src = data.image;
                postImagePreview.style.display = 'block';
                
                let currentImageText = document.getElementById('edit-post-form');
                if (!currentImageText) {
                    currentImageText = document.createElement('p');
                    currentImageText.className = 'current-image-text';
                    currentImageText.textContent = 'Current Image:';
                    document.getElementById('edit-post-form').insertBefore(currentImageText, postImagePreview);
                }
            } else {
                const postImagePreview = document.getElementById('edit-post-image-preview');
                postImagePreview.style.display = 'none';
            }
        
            document.getElementById('edit-fields').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error fetching post:', error);
        alert("An error occurred while fetching the post.");
    });
});



// Edit Post Form Submission
document.getElementById('edit-post-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const postId = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const content = document.getElementById('edit-content').value;
    const author = document.getElementById('edit-author').value;
    const footer = document.getElementById('edit-footer').value;
    const image = document.getElementById('edit-image').files[0];

    const formData = new FormData();
    formData.append('id', postId);
    formData.append('title', title);
    formData.append('content_body', content);
    formData.append('author', author);
    formData.append('footer', footer);

    if (image) formData.append('image', image);

    fetch(`${baseUrl}/edit-post`, {
        method: 'POST',
        credentials: 'include',

        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('message').textContent = data.message;
            alert(data.message);
        } else {
            document.getElementById('message').textContent = data.error || "Error editing post.";
        }
    })
    .catch(error => {
        console.error('Error editing post:', error);
        alert("An error occurred while editing the post.");
    });
});

document.getElementById('delete-post-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const postId = document.getElementById('delete-id').value;

    fetch(`${baseUrl}/delete/${postId}`, {
        method: 'DELETE',
        credentials: 'include'

    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('message').textContent = data.message;
            alert(data.message);

        } else {
            document.getElementById('message').textContent = data.error || "Error deleting post.";
        }
    })
    .catch(error => console.error('Error:', error));
});

function fetchLogs() {
    fetch(`${baseUrl}/get-logs`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.logs) {
            document.getElementById('logs-container').textContent = data.logs.join('\n');
        } else {
            document.getElementById('logs-container').textContent = "Failed to load logs.";
        }
    })
    .catch(error => {
        console.error('Error fetching logs:', error);
        document.getElementById('logs-container').textContent = "Error fetching logs.";
    });
}

document.getElementById('fetch-logs').addEventListener('click', fetchLogs);

//fetchLogs();

document.getElementById('download-logs').addEventListener('click', function () {
    window.location.href = `${baseUrl}/download-logs`;
});

document.getElementById('reset-logs').addEventListener('click', function () {
    fetch(`${baseUrl}/reset-logs`, {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || data.error);
        fetchLogs(); // Refresh logs after resetting
    })
    .catch(error => {
        console.error('Error resetting logs:', error);
    });
});