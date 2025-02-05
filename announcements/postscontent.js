document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    let isLoading = false;

    fetchPosts(currentPage);

    window.addEventListener('scroll', () => {
        if (isLoading) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            isLoading = true;
            currentPage++;
            fetchPosts(currentPage);
        }
    });
});

function fetchPosts(page) {
    fetch(`https://api.pennrobotics.org/get-posts?page=${page}&limit=5`)
        .then(response => response.json())
        .then(data => {
            const postContainer = document.querySelector('.posts-location');

            if (!data.posts || data.posts.length === 0) {
                if (page === 1) {
                    const noPostsMessage = document.createElement('div');
                    noPostsMessage.classList.add('no-posts-message');
                    noPostsMessage.textContent = "The posts were unable to load, please try again later.";
                    postContainer.appendChild(noPostsMessage);
                }
            } else {
                const sortedPosts = data.posts.sort((a, b) => b.id - a.id);
                sortedPosts.forEach(post => {
                    const newPostContainer = createPostContainer(post);
                    postContainer.appendChild(newPostContainer);
                });
            }
            isLoading = false;
        })
        .catch(error => {
            console.error('Error fetching posts:', error);

            // Display "Can't find any posts." message if API call fails
            const postContainer = document.querySelector('.posts-location');
            const noPostsMessage = document.createElement('div');
            noPostsMessage.classList.add('no-posts-message');
            noPostsMessage.textContent = "Can't find any posts.";
            postContainer.appendChild(noPostsMessage);
            isLoading = false;
        });
}

function createPostContainer(post) {
    const postContainer = document.createElement('div');
    postContainer.classList.add('post-container');

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
    postAuthor.textContent = post.author ? `By ${post.author}` : '';

    postDateAuthorContainer.appendChild(postDate);
    postDateAuthorContainer.appendChild(postAuthor);

    const postContentBody = document.createElement('div');
    postContentBody.classList.add('post-content-body');
    postContentBody.innerHTML = parseMarkdown(post.content_body || 'No content available.');

    const postImagesContainer = document.createElement('div');
    postImagesContainer.classList.add('post-images-container');
    
    if (post.image) {
        const postImageContainer = document.createElement('div');
        postImageContainer.classList.add('post-image');

        const postImage = document.createElement('img');
        postImage.src = post.image;

        postImageContainer.appendChild(postImage);
        postImagesContainer.appendChild(postImageContainer);
    }

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

// Custom Markdown Parser
function parseMarkdown(content) {
    // Convert bold text
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert links
    content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Convert markdown list items to <li> tags
    content = content.replace(/^-\s+(.*?)(?=\n|$)/gm, '<li>$1</li>'); // This matches list items

    // Wrap all list items in a <ul> tag
    content = content.replace(/(<li>.*?<\/li>)/g, '<ul>$&</ul>');

    content = content.replace(/^# (.*?)$/gm, '<h3>$1</h3>');

    return content;
}