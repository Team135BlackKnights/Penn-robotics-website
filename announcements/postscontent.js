document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});

function fetchPosts() {
    fetch('http://localhost:5000/get-posts')
        .then(response => response.json())
        .then(data => {
            const postContainer = document.querySelector('.posts-location');

            if (!data.posts || data.posts.length === 0) {
                const noPostsMessage = document.createElement('div');
                noPostsMessage.classList.add('no-posts-message');
                noPostsMessage.textContent = "The posts were unable to load, please try again later.";
                postContainer.appendChild(noPostsMessage);
            } else {
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

    const postFooter = document.createElement('div');
    postFooter.classList.add('post-footer');
    postFooter.textContent = post.footer
        ? `${post.footer} | Post ID: ${post.id}`
        : `Penn Robotics | Post ID: ${post.id}`;

    postSection.appendChild(postTitle);
    postSection.appendChild(postDateAuthorContainer);
    postSection.appendChild(postContentBody);
    postSection.appendChild(postFooter);

    postContainer.appendChild(postSection);

    return postContainer;
}

// Custom Markdown Parser
function parseMarkdown(content) {
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    content = content.replace(/(^|\n)- (.*?)(?=\n|$)/g, '$1<li>$2</li>');

    content = content.replace(/(<li>.*?<\/li>)/g, '<ul>$1</ul>');

    return content;
}