document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});

function fetchPosts() {
    fetch('http://localhost:5000/get-posts')
        .then(response => response.json())
        .then(data => {
            const postContainer = document.querySelector('.posts-location');

            // Check if there are no posts or an empty response
            if (!data.posts || data.posts.length === 0) {
                const noPostsMessage = document.createElement('div');
                noPostsMessage.classList.add('no-posts-message');
                noPostsMessage.textContent = "The posts were unable to load, please try again later.";
                postContainer.appendChild(noPostsMessage);
            } else {
                // Sort and display posts if they exist
                const sortedPosts = data.posts.sort((a, b) => b.id - a.id);
                sortedPosts.forEach(post => {
                    const newPostContainer = createPostContainer(post);
                    postContainer.appendChild(newPostContainer);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);

            // Display "Can't find any posts." message if API call fails
            const postContainer = document.querySelector('.posts-location');
            const noPostsMessage = document.createElement('div');
            noPostsMessage.classList.add('no-posts-message');
            noPostsMessage.textContent = "Can't find any posts.";
            postContainer.appendChild(noPostsMessage);
        });
}

function createPostContainer(post) {
    const postContainer = document.createElement('div');
    postContainer.classList.add('post-container');  // New post container

    const postSection = document.createElement('div');
    postSection.classList.add('post-section');
    
    const postTitle = document.createElement('div');
    postTitle.classList.add('post-title');
    postTitle.textContent = post.title;

    const postDateAuthorContainer = document.createElement('div');
    postDateAuthorContainer.classList.add('post-date-author-container');

    const postDate = document.createElement('div');
    postDate.classList.add('post-date');
    postDate.textContent = post.date || 'Date not available';

    const postAuthor = document.createElement('div');
    postAuthor.classList.add('post-author');
    
    if (post.author) {
        postAuthor.textContent = `By ${post.author}`;
    } else {
        postAuthor.textContent = '';
    }

    postDateAuthorContainer.appendChild(postDate);
    postDateAuthorContainer.appendChild(postAuthor);

    const postContentBody = document.createElement('div');
    postContentBody.classList.add('post-content-body');
    postContentBody.textContent = post.content_body || 'No content available.';

    const postImagesContainer = document.createElement('div');
    postImagesContainer.classList.add('post-images-container');

    post.image && post.image.forEach(imgUrl => {
        const postImage = document.createElement('div');
        postImage.classList.add('post-image');
        const imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        postImage.appendChild(imgElement);
        postImagesContainer.appendChild(postImage);
    });

    const postFooter = document.createElement('div');
    postFooter.classList.add('post-footer');
    postFooter.textContent = post.footer 
        ? `${post.footer} | Post ID: ${post.id}` 
        : `Penn Robotics | Post ID: ${post.id}`;

    postSection.appendChild(postTitle);
    postSection.appendChild(postDateAuthorContainer);
    postSection.appendChild(postContentBody);
    postSection.appendChild(postImagesContainer);
    postSection.appendChild(postFooter);

    postContainer.appendChild(postSection);

    return postContainer;
}
