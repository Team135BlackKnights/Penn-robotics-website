
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


// Background upload handlers
function fetchBackground() {
    // Use new get-image endpoint for the landing hero background
    fetch(`${baseUrl}/get-image?key=landing.hero`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.url) {
            const preview = document.getElementById('background-preview');
            if (preview) {
                preview.src = data.url;
                preview.style.display = 'block';
            }
        }
    })
    .catch(err => console.error('Error fetching background:', err));
}

const bgInput = document.getElementById('background-image');
if (bgInput) {
    bgInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        const preview = document.getElementById('background-preview');
        if (!file) {
            preview.style.display = 'none';
            preview.src = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    });
}

const uploadForm = document.getElementById('upload-background-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const file = document.getElementById('background-image').files[0];
        if (!file) {
            alert('Please select an image to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('image', file);

        fetch(`${baseUrl}/upload-image`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.url) {
                alert('Background uploaded successfully.');
                const preview = document.getElementById('background-preview');
                preview.src = data.url;
                preview.style.display = 'block';
            } else {
                alert(data.error || 'Error uploading background.');
            }
        })
        .catch(err => {
            console.error('Error uploading background:', err);
            alert('Error uploading background.');
        });
    });
}

// Fetch current background on admin page load
fetchBackground();

// -----------------------------
// Dynamic Image Slots Renderer
// -----------------------------
function showImageSlotsError(msg) {
    const container = document.getElementById('image-slots-container');
    if (!container) return;
    container.innerHTML = '';
    const p = document.createElement('p');
    p.style.color = 'red';
    p.textContent = msg;
    container.appendChild(p);
}

function createImageSlotWidget(key, meta) {
    const container = document.getElementById('image-slots-container');
    if (!container) return;

    const slot = document.createElement('div');
    slot.className = 'image-slot';
    const title = document.createElement('h3');
    title.textContent = meta.label || key;
    slot.appendChild(title);

    const keyText = document.createElement('p');
    keyText.className = 'image-slot-key';
    keyText.textContent = `Key: ${key}`;
    slot.appendChild(keyText);

    if (meta.description) {
        const desc = document.createElement('p');
        desc.className = 'image-slot-desc';
        desc.textContent = meta.description;
        slot.appendChild(desc);
    }

    const preview = document.createElement('img');
    preview.className = 'image-slot-preview';
    preview.alt = `${key} preview`;
    preview.style.maxWidth = '300px';
    preview.style.display = 'none';
    slot.appendChild(preview);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = (meta.allowed_mime && meta.allowed_mime.join(',')) || 'image/*';
    fileInput.className = 'image-slot-input';
    slot.appendChild(fileInput);

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.textContent = 'Upload';
    slot.appendChild(uploadBtn);

    const status = document.createElement('div');
    status.className = 'image-slot-status';
    slot.appendChild(status);

    // Load current image for this key
    fetch(`${baseUrl}/get-image?key=${encodeURIComponent(key)}`, { credentials: 'include' })
        .then(resp => resp.json())
        .then(data => {
            if (data && data.url) {
                preview.src = data.url;
                preview.style.display = 'block';
            }
        }).catch(() => {/* ignore current image fetch errors */});

    fileInput.addEventListener('change', function (e) {
        const f = e.target.files[0];
        if (!f) {
            preview.style.display = 'none';
            preview.src = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
            preview.src = ev.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(f);
    });

    uploadBtn.addEventListener('click', function () {
        const f = fileInput.files[0];
        if (!f) {
            alert('Please choose a file to upload.');
            return;
        }
        status.textContent = 'Uploading...';
        const fd = new FormData();
        fd.append('key', key);
        fd.append('image', f);

        fetch(`${baseUrl}/upload-image`, {
            method: 'POST',
            credentials: 'include',
            body: fd
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.url) {
                preview.src = data.url;
                preview.style.display = 'block';
                status.textContent = 'Upload successful.';
            } else {
                status.textContent = data.error || 'Upload failed.';
            }
        })
        .catch(err => {
            console.error('Upload error:', err);
            status.textContent = 'Upload error.';
        });
    });

    container.appendChild(slot);
}

function renderImageSlots() {
    const container = document.getElementById('image-slots-container');
    if (!container) return;
    container.innerHTML = '<p>Loading image slots...</p>';

    fetch(`${baseUrl}/image-keys`, { credentials: 'include' })
        .then(resp => {
            if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
            const ct = resp.headers.get('content-type') || '';
            if (!ct.includes('application/json')) throw new Error('Expected JSON response');
            return resp.json();
        })
        .then(data => {
            container.innerHTML = '';
            const keys = data.keys || data;
            if (!keys || Object.keys(keys).length === 0) {
                container.innerHTML = '<p>No image slots defined.</p>';
                return;
            }
            Object.entries(keys).forEach(([k, v]) => createImageSlotWidget(k, v || {}));
        })
        .catch(err => {
            console.error('Error loading image keys:', err);
            showImageSlotsError('Failed to load image slots. Check server and login.');
        });
}

// Kick off rendering when admin script loads (after check-login appended script)
// If this script is appended dynamically after DOMContentLoaded, call immediately.
try {
    console.log('admin/app.js loaded — initializing image slots renderer');
} catch (e) {}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderImageSlots);
} else {
    // DOM already ready (script appended late) — run now
    renderImageSlots();
}