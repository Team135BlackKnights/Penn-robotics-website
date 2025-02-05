// Make Post Form Submission
document.getElementById('make-post-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author').value; // Optional
    const footer = document.getElementById('footer').value; // Optional
    const image = document.getElementById('image').files[0]; // Image file

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content_body', content);
    formData.append('author', author);
    formData.append('footer', footer);
    if (image) formData.append('image', image);

    fetch('https://api.pennrobotics.org/make-post', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer website135'
        },
        body: formData
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


document.getElementById('fetch-post').addEventListener('click', function () {
    const postId = document.getElementById('edit-id').value;

    if (!postId) {
        alert("Please enter a Post ID.");
        return;
    }

    // Fetch the post data from the API
    fetch(`https://api.pennrobotics.org/get-post/${postId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer website135'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error); // Show error if post not found
        } else {
            // Pre-fill the form fields with the fetched data
            document.getElementById('edit-title').value = data.title;
            document.getElementById('edit-content').value = data.content_body;
            document.getElementById('edit-author').value = data.author || ''; // Optional
            document.getElementById('edit-footer').value = data.footer || ''; // Optional

            // Update the post image preview if an image URL is returned
            if (data.image) {
                const postImagePreview = document.getElementById('edit-post-image-preview');
                postImagePreview.src = data.image; // Set the src attribute of the existing img element
                postImagePreview.style.display = 'block'; // Ensure the image is visible
                
                let currentImageText = document.getElementById('edit-post-form');
                if (!currentImageText) {
                    currentImageText = document.createElement('p');
                    currentImageText.className = 'current-image-text';
                    currentImageText.textContent = 'Current Image:';
                    document.getElementById('edit-post-form').insertBefore(currentImageText, postImagePreview); // Insert text before the image
                }
            } else {
                const postImagePreview = document.getElementById('edit-post-image-preview');
                postImagePreview.style.display = 'none'; // Hide the image if no URL is provided
            }
        

            // Show the edit fields and the "Edit Post" button
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
    const author = document.getElementById('edit-author').value; // Optional
    const footer = document.getElementById('edit-footer').value; // Optional
    const image = document.getElementById('edit-image').files[0]; // Image file

    const formData = new FormData();
    formData.append('id', postId);
    formData.append('title', title);
    formData.append('content_body', content);
    formData.append('author', author);
    formData.append('footer', footer);

    // Only append image if the user selected a new one
    if (image) formData.append('image', image);

    fetch('https://api.pennrobotics.org/edit-post', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer website135'
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('message').textContent = data.message;
        } else {
            document.getElementById('message').textContent = data.error || "Error editing post.";
        }
    })
    .catch(error => {
        console.error('Error editing post:', error);
        alert("An error occurred while editing the post.");
    });
});

// Delete Post Form Submission
document.getElementById('delete-post-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const postId = document.getElementById('delete-id').value;

    fetch(`https://api.pennrobotics.org/delete/${postId}`, {  // Fixed template literal
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
