document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('post');

    if (postId) {
        fetchPost(postId);
    } else {
        displayErrorMessage("Post ID is missing.");
    }
});

function fetchPost(postId) {
    fetch(`http://127.0.0.1:5000//get-post/${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                displayErrorMessage(data.error);
            } else {
                displayPost(data);
            }
        })
        .catch(error => {
            console.error('Error fetching post:', error);
            displayErrorMessage("Unable to load the post.");
        });
}

function displayPost(post) {
    document.title = post.title + " - Penn Robotics";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        const contentSnippet = getContentSnippet(post.content_body);
        metaDescription.setAttribute('content', contentSnippet);
    }

    const postContainer = document.querySelector('.posts-location');
    const newPostContainer = createPostContainer(post);
    postContainer.appendChild(newPostContainer);

    
}
function getContentSnippet(content) {
    const words = content.split(/\s+/);
    const snippet = words.slice(0, 15).join(' ');
    return snippet + (words.length > 15 ? ' ...' : '');
}
function displayErrorMessage(message) {
    const postContainer = document.querySelector('.posts-location');
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    postContainer.appendChild(errorMessage);
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
    shareButton.style.position = 'absolute';
    shareButton.style.bottom = '10px'; 
    shareButton.style.right = '10px';
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
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    content = content.replace(/^-\s+(.*?)(?=\n|$)/gm, '<li>$1</li>');
    content = content.replace(/(<li>.*?<\/li>)/g, '<ul>$&</ul>');
    content = content.replace(/^# (.*?)$/gm, '<h3>$1</h3>');

    return content;
}
