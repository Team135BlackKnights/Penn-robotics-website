document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();
});

function fetchPosts() {
    fetch('http://localhost:5000/get-posts')
        .then(response => response.json())
        .then(data => {
            const postContainer = document.querySelector('.posts-location');
            
            const sortedPosts = data.posts.sort((a, b) => b.id - a.id);

            sortedPosts.forEach(post => {
                const newPostContainer = createPostContainer(post);
                postContainer.appendChild(newPostContainer);
            });
        })
        .catch(error => console.error('Error fetching posts:', error));
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
    postAuthor.textContent = `By ${post.author || 'Unknown Author'}`;

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
    postFooter.textContent = post.footer || 'No footer available';

    postSection.appendChild(postTitle);
    postSection.appendChild(postDateAuthorContainer);
    postSection.appendChild(postContentBody);
    postSection.appendChild(postImagesContainer);
    postSection.appendChild(postFooter);

    postContainer.appendChild(postSection);

    return postContainer;
}
