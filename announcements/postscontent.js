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
    postContainer.style.position = 'relative';

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

    const shareButton = document.createElement('button');
    shareButton.classList.add('share-button');
    shareButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M307 34.8c-11.5 5.1-19 16.6-19 29.2l0 64-112 0C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96l96 0 0 64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z"/></svg>`;

    shareButton.addEventListener('click', () => {
        const domain = window.location.origin;
        const url = `${domain}/announcements/post.html?post=${post.id}`;
        navigator.clipboard.writeText(url).then(() => {
            const tooltip = document.createElement('div');
            tooltip.classList.add('copy-tooltip');
            tooltip.textContent = 'Copied!';
            shareButton.appendChild(tooltip);
    
            setTimeout(() => tooltip.classList.add('show'), 100);
    
            setTimeout(() => {
                tooltip.classList.remove('show');
                setTimeout(() => tooltip.remove(), 100);
            }, 5000);
        });
    });

    postContainer.appendChild(postSection);
    postContainer.appendChild(shareButton);

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