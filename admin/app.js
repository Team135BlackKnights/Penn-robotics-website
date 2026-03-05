
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

// Scroll-to-bottom button behavior for logs
(function () {
    const logsContainer = document.getElementById('logs-container');
    const scrollBtn = document.getElementById('scroll-bottom-btn');
    if (!logsContainer || !scrollBtn) return;

    function updateScrollBtnVisibility() {
        // Show the button only when content overflows and the user is not already at the bottom
        const canScroll = logsContainer.scrollHeight > logsContainer.clientHeight + 4;
        const atBottom = (logsContainer.scrollHeight - logsContainer.scrollTop - logsContainer.clientHeight) <= 6;
        scrollBtn.style.display = (canScroll && !atBottom) ? 'flex' : 'none';
    }

    // Click -> jump to bottom
    scrollBtn.addEventListener('click', function () {
        logsContainer.scrollTop = logsContainer.scrollHeight;
        updateScrollBtnVisibility();
    });

    // Toggle visibility when user scrolls
    logsContainer.addEventListener('scroll', updateScrollBtnVisibility);

    // When logs content changes (e.g. after fetch), update visibility
    const mo = new MutationObserver(updateScrollBtnVisibility);
    mo.observe(logsContainer, { childList: true, characterData: true, subtree: true });

    // Initial check after short delay to let existing content layout
    setTimeout(updateScrollBtnVisibility, 100);
})();

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
    if (meta && meta.page) slot.setAttribute('data-slot-page', meta.page);
    const title = document.createElement('h3');
    title.textContent = meta.label || key;
    slot.appendChild(title);

    const keyText = document.createElement('p');
    keyText.className = 'image-slot-key';
    keyText.textContent = `Key: ${key}`;
    slot.appendChild(keyText);

    // Link to view the image target on the live site (opens page and focuses this slot)
    if (meta && meta.page) {
        const viewLink = document.createElement('a');
        viewLink.className = 'image-slot-link';
        // Use a hash param so the target page can find the slot and highlight it
        viewLink.href = `${meta.page}#focus=${encodeURIComponent(key)}`;
        viewLink.target = '_blank';
        viewLink.rel = 'noopener noreferrer';
        viewLink.textContent = 'View on site';
        viewLink.style.display = 'inline-block';
        viewLink.style.marginTop = '6px';
        slot.appendChild(viewLink);
    }

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
    preview.style.cursor = 'zoom-in';
    slot.appendChild(preview);

    // Drop hint overlay (shown when dragging files over the slot)
    const dropHint = document.createElement('div');
    dropHint.className = 'image-drop-hint';
    dropHint.textContent = 'Drop image here';
    dropHint.style.display = 'none';
    slot.appendChild(dropHint);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = (meta.allowed_mime && meta.allowed_mime.join(',')) || 'image/*';
    fileInput.className = 'image-slot-input';
    slot.appendChild(fileInput);

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.textContent = 'Upload';
    slot.appendChild(uploadBtn);

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Reset to default';
    resetBtn.style.marginLeft = '8px';
    slot.appendChild(resetBtn);

    const status = document.createElement('div');
    status.className = 'image-slot-status';
    slot.appendChild(status);

    // Helper: try a list of candidate URLs until one successfully loads into the preview
    function tryLoadCandidates(candidates, onSuccess, onAllFailed) {
        if (!candidates || candidates.length === 0) {
            if (onAllFailed) onAllFailed();
            return;
        }
        const candidate = candidates.shift();
        console.log(`Trying image candidate for key=${key}: ${candidate}`);
        const img = new Image();
        img.onload = function () {
            onSuccess(candidate);
        };
        img.onerror = function () {
            // try next
            tryLoadCandidates(candidates, onSuccess, onAllFailed);
        };
        img.src = candidate;
    }

    // Load current image for this key. Show uploaded image if present, otherwise try defaults from several hosts.
    fetch(`${baseUrl}/get-image?key=${encodeURIComponent(key)}`, { credentials: 'include' })
        .then(resp => resp.json())
        .then(data => {
            const candidates = [];

            if (data && data.url) {
                // server provided a URL (may be uploaded or default); try it first
                candidates.push(data.url);
            }

            // client-side meta.default from image_keys.json (could be relative)
            const def = meta && meta.default;
            if (def) {
                // normalize: try forms in order: as-is, frontend dev host, window.origin, API baseUrl
                if (typeof def === 'string') {
                    candidates.push(def);
                    // ensure leading slash
                    const path = def.startsWith('/') ? def : '/' + def;
                    // front-end dev server
                    candidates.push(`http://127.0.0.1:5500${path}`);
                    // current page origin (works when serving front-end from same origin)
                    candidates.push(`${window.location.origin}${path}`);
                    // API host (may serve static files under same path)
                    candidates.push(`${baseUrl}${path}`);
                }
            }

            // Remove duplicates while preserving order
            const seen = new Set();
            const uniq = candidates.filter(c => {
                if (!c) return false;
                if (seen.has(c)) return false;
                seen.add(c);
                return true;
            });

            tryLoadCandidates(uniq.slice(), function (successUrl) {
                preview.src = successUrl;
                preview.style.display = 'block';
                if (data && data.version) {
                    status.textContent = 'Using uploaded image';
                } else {
                    status.textContent = 'Using default image (no upload yet)';
                }
                console.log(`Image loaded for key=${key} from ${successUrl}`);
            }, function () {
                console.warn(`All candidate image URLs failed for key=${key}`);
                status.textContent = 'No image available (failed to load)';
            });
        }).catch((err) => {
            console.error('Error fetching current image for key', key, err);
            status.textContent = 'Error loading image metadata';
        });

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

    // Drag & drop support: highlight slot when dragging files and accept drop to set file input
    function isFileDrag(e) {
        try {
            const types = e.dataTransfer && e.dataTransfer.types;
            if (!types) return false;
            // Chrome/Edge: contains 'Files', Firefox may include 'application/x-moz-file'
            return Array.from(types).some(t => t === 'Files' || t === 'files' || t.includes && t.includes('Files'));
        } catch (err) {
            return false;
        }
    }

    function showDragOver() {
        slot.classList.add('drag-over');
        dropHint.style.display = 'flex';
    }

    function clearDragOver() {
        slot.classList.remove('drag-over');
        dropHint.style.display = 'none';
    }

    // Handle drop: set file input (if possible) and preview
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const files = (e.dataTransfer && e.dataTransfer.files) || [];
        if (!files || files.length === 0) return clearDragOver();
        const f = files[0];

        // Try to set fileInput.files via DataTransfer if supported
        try {
            const dt = new DataTransfer();
            dt.items.add(f);
            fileInput.files = dt.files;
        } catch (err) {
            // Setting files may not be supported in some browsers; fall back to only previewing
            console.warn('Could not set file input programmatically:', err);
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = function (ev) {
            preview.src = ev.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(f);

        // Optionally, focus upload button for quick upload
        uploadBtn.focus();

        clearDragOver();
    }

    // Drag events
    slot.addEventListener('dragenter', function (e) {
        if (isFileDrag(e)) {
            e.preventDefault();
            showDragOver();
        }
    });
    slot.addEventListener('dragover', function (e) {
        if (isFileDrag(e)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            showDragOver();
        }
    });
    slot.addEventListener('dragleave', function (e) {
        // If leaving the slot entirely, clear highlight
        const rect = slot.getBoundingClientRect();
        const x = e.clientX, y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) clearDragOver();
    });
    slot.addEventListener('dragend', function (e) { clearDragOver(); });
    slot.addEventListener('drop', handleDrop);

    // Open lightbox when clicking the preview
    preview.addEventListener('click', function (e) {
        if (!preview.src) return;
        openImageLightbox(preview.src, meta.label || key);
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

    resetBtn.addEventListener('click', function () {
        if (!confirm(`Reset ${key} to default? This will remove the uploaded image.`)) return;
        status.textContent = 'Resetting...';
        const fd = new FormData();
        fd.append('key', key);
        fetch(`${baseUrl}/delete-image`, {
            method: 'POST',
            credentials: 'include',
            body: fd
        })
        .then(resp => resp.json())
        .then(data => {
            if (data && data.message) {
                status.textContent = 'Reset to default';
                // reload this slot preview by re-rendering all slots
                renderImageSlots();
            } else {
                status.textContent = data.error || 'Reset failed';
            }
        })
        .catch(err => {
            console.error('Error resetting image mapping:', err);
            status.textContent = 'Reset error';
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
            initImageSlotSearch();
        })
        .catch(err => {
            console.error('Error loading image keys:', err);
            showImageSlotsError('Failed to load image slots. Check server and login.');
        });
}

// --- Image Slot Search + Filter ---

// Active filter state
var _slotFilters = { pages: [], statuses: [] };

function applySlotFilters() {
    var searchInput = document.getElementById('image-slot-search');
    var container = document.getElementById('image-slots-container');
    if (!container) return;

    var query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    var terms = query ? query.split(/\s+/).filter(Boolean) : [];
    var slots = Array.from(container.querySelectorAll('.image-slot'));

    var hasAnyFilter = terms.length > 0 || _slotFilters.pages.length > 0 || _slotFilters.statuses.length > 0;

    if (!hasAnyFilter) {
        slots.forEach(function (s) { s.style.display = ''; s.style.order = ''; });
        container.style.display = '';
        renderActiveFilterTags();
        return;
    }

    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    slots.forEach(function (slot) {
        var dominated = false;

        // --- Page filter ---
        if (_slotFilters.pages.length > 0) {
            var slotPage = slot.getAttribute('data-slot-page') || '';
            if (_slotFilters.pages.indexOf(slotPage) === -1) dominated = true;
        }

        // --- Status filter ---
        if (!dominated && _slotFilters.statuses.length > 0) {
            var statusEl = slot.querySelector('.image-slot-status');
            var statusText = (statusEl ? statusEl.textContent : '').toLowerCase();
            var isUploaded = statusText.indexOf('uploaded') !== -1 || statusText.indexOf('upload successful') !== -1;
            var isDefault = !isUploaded;
            var passStatus = false;
            if (_slotFilters.statuses.indexOf('uploaded') !== -1 && isUploaded) passStatus = true;
            if (_slotFilters.statuses.indexOf('default') !== -1 && isDefault) passStatus = true;
            if (!passStatus) dominated = true;
        }

        // --- Search terms ---
        if (!dominated && terms.length > 0) {
            var pieces = [];
            var h3 = slot.querySelector('h3');
            if (h3) pieces.push(h3.textContent);
            var keyEl = slot.querySelector('.image-slot-key');
            if (keyEl) pieces.push(keyEl.textContent);
            var descEl = slot.querySelector('.image-slot-desc');
            if (descEl) pieces.push(descEl.textContent);
            var linkEl = slot.querySelector('.image-slot-link');
            if (linkEl) { pieces.push(linkEl.textContent); pieces.push(linkEl.href); }
            var statusEl2 = slot.querySelector('.image-slot-status');
            if (statusEl2) pieces.push(statusEl2.textContent);
            var previewEl = slot.querySelector('.image-slot-preview');
            if (previewEl && previewEl.src) pieces.push(previewEl.src);
            var haystack = pieces.join(' ').toLowerCase();
            var matches = terms.every(function (t) { return haystack.indexOf(t) !== -1; });
            if (!matches) dominated = true;
        }

        slot.style.display = dominated ? 'none' : '';
        slot.style.order = dominated ? '1' : '0';
    });

    renderActiveFilterTags();
}

function renderActiveFilterTags() {
    var container = document.getElementById('active-filters');
    if (!container) return;
    container.innerHTML = '';

    _slotFilters.pages.forEach(function (page) {
        var tag = document.createElement('span');
        tag.className = 'filter-tag';
        tag.innerHTML = '<i class="fa-solid fa-file"></i> ' + page + ' <button data-type="page" data-value="' + page + '">&times;</button>';
        container.appendChild(tag);
    });

    _slotFilters.statuses.forEach(function (status) {
        var tag = document.createElement('span');
        tag.className = 'filter-tag';
        var label = status === 'uploaded' ? 'Uploaded' : 'Default';
        tag.innerHTML = '<i class="fa-solid fa-circle-info"></i> ' + label + ' <button data-type="status" data-value="' + status + '">&times;</button>';
        container.appendChild(tag);
    });

    // Attach remove handlers
    container.querySelectorAll('.filter-tag button').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var type = btn.getAttribute('data-type');
            var value = btn.getAttribute('data-value');
            if (type === 'page') {
                _slotFilters.pages = _slotFilters.pages.filter(function (p) { return p !== value; });
                // Uncheck corresponding checkbox
                var cb = document.querySelector('.filter-page-cb[value="' + CSS.escape(value) + '"]');
                if (cb) cb.checked = false;
            } else if (type === 'status') {
                _slotFilters.statuses = _slotFilters.statuses.filter(function (s) { return s !== value; });
                var cb = document.querySelector('.filter-status-cb[value="' + CSS.escape(value) + '"]');
                if (cb) cb.checked = false;
            }
            applySlotFilters();
        });
    });
}

function buildPageFilterOptions() {
    var container = document.getElementById('filter-page-options');
    if (!container) return;
    container.innerHTML = '';

    // Collect unique pages from rendered slots
    var pages = [];
    document.querySelectorAll('.image-slot[data-slot-page]').forEach(function (slot) {
        var p = slot.getAttribute('data-slot-page');
        if (p && pages.indexOf(p) === -1) pages.push(p);
    });
    pages.sort();

    pages.forEach(function (page) {
        var label = document.createElement('label');
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'filter-page-cb';
        cb.value = page;
        cb.addEventListener('change', function () {
            if (cb.checked) {
                if (_slotFilters.pages.indexOf(page) === -1) _slotFilters.pages.push(page);
            } else {
                _slotFilters.pages = _slotFilters.pages.filter(function (p) { return p !== page; });
            }
            applySlotFilters();
        });
        label.appendChild(cb);
        // Friendly display name
        var displayName = page.replace(/^\//, '').replace(/\.html$/, '') || 'index';
        label.appendChild(document.createTextNode(' ' + displayName));
        container.appendChild(label);
    });
}

function initImageSlotSearch() {
    var searchInput = document.getElementById('image-slot-search');
    var filterBtn = document.getElementById('filter-toggle-btn');
    var filterDropdown = document.getElementById('filter-dropdown');
    var clearBtn = document.getElementById('filter-clear-btn');

    // Search input
    if (searchInput) {
        searchInput.removeEventListener('input', searchInput._slotSearchHandler);
        searchInput._slotSearchHandler = function () { applySlotFilters(); };
        searchInput.addEventListener('input', searchInput._slotSearchHandler);
    }

    // Filter toggle: position dropdown as fixed so it won't cause page horizontal scroll
    if (filterBtn && filterDropdown) {
        // helper to position dropdown inside viewport near the button
        function positionFilterDropdown() {
            var rect = filterBtn.getBoundingClientRect();
            // ensure visible for measurement
            filterDropdown.style.display = 'block';
            filterDropdown.style.position = 'fixed';
            filterDropdown.style.boxSizing = 'border-box';
            filterDropdown.style.maxWidth = 'calc(100vw - 40px)';

            // measure width after display
            var ddw = filterDropdown.offsetWidth || Math.min(320, window.innerWidth - 40);
            var vw = window.innerWidth;
            var left = rect.left;
            // keep a 20px gutter from viewport edges
            var gutter = 20;
            if (left + ddw > vw - gutter) left = Math.max(gutter, vw - ddw - gutter);
            if (left < gutter) left = gutter;

            filterDropdown.style.left = left + 'px';
            filterDropdown.style.top = (rect.bottom + 6) + 'px';
        }

        filterBtn.onclick = function (e) {
            e.stopPropagation();
            var isVisible = filterDropdown.style.display === 'block';
            if (isVisible) {
                filterDropdown.style.display = 'none';
            } else {
                // show then position
                filterDropdown.style.display = 'block';
                filterDropdown.style.position = 'fixed';
                positionFilterDropdown();
            }
        };

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!filterDropdown.contains(e.target) && e.target !== filterBtn && !filterBtn.contains(e.target)) {
                filterDropdown.style.display = 'none';
            }
        });

        // Reposition on resize/scroll (use capture for scroll to catch container scrolling)
        window.addEventListener('resize', function () { if (filterDropdown.style.display === 'block') positionFilterDropdown(); });
        window.addEventListener('scroll', function () { if (filterDropdown.style.display === 'block') positionFilterDropdown(); }, true);
    }

    // Status checkboxes
    document.querySelectorAll('.filter-status-cb').forEach(function (cb) {
        cb.addEventListener('change', function () {
            if (cb.checked) {
                if (_slotFilters.statuses.indexOf(cb.value) === -1) _slotFilters.statuses.push(cb.value);
            } else {
                _slotFilters.statuses = _slotFilters.statuses.filter(function (s) { return s !== cb.value; });
            }
            applySlotFilters();
        });
    });

    // Clear all
    if (clearBtn) {
        clearBtn.onclick = function () {
            _slotFilters = { pages: [], statuses: [] };
            document.querySelectorAll('.filter-page-cb, .filter-status-cb').forEach(function (cb) { cb.checked = false; });
            if (searchInput) searchInput.value = '';
            applySlotFilters();
        };
    }

    // Build page filter checkboxes from rendered slot data
    buildPageFilterOptions();
}

// ----------------------------------------
// How-to modal: explain adding dynamic image slots
// ----------------------------------------
(function () {
    function wireModal(modalId, openBtnId, closeBtnId) {
        var modal = document.getElementById(modalId);
        var openBtn = document.getElementById(openBtnId);
        var closeBtn = document.getElementById(closeBtnId);
        if (!modal || !openBtn) return;

        function openModal() {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            if (closeBtn) closeBtn.focus();
        }

        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            openBtn.focus();
        }

        openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
        });
    }

    wireModal('how-to-modal',     'how-to-dynamic-btn', 'how-to-modal-close');
    wireModal('how-to-use-modal', 'how-to-use-btn',     'how-to-use-modal-close');
})();

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

// --------------------
// Image Lightbox Helper
// --------------------
function openImageLightbox(src, title) {
    // Avoid duplicates
    if (document.querySelector('.image-lightbox')) return;

    const overlay = document.createElement('div');
    overlay.className = 'image-lightbox';

    const content = document.createElement('div');
    content.className = 'image-lightbox-content';

    const img = document.createElement('img');
    img.src = src;
    img.alt = title || '';
    img.className = 'image-lightbox-img';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'image-lightbox-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close image');
    // Inline SVG close icon for crisp rendering and styling control
    closeBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M6 6 L18 18 M6 18 L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
    `;

    content.appendChild(closeBtn);
    content.appendChild(img);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // show (allow CSS transitions)
    requestAnimationFrame(() => overlay.classList.add('visible'));

    function close() {
        overlay.classList.remove('visible');
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }

    // click outside content closes
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
    });

    closeBtn.addEventListener('click', close);

    // ESC closes
    function onKey(e) {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', onKey);
        }
    }
    document.addEventListener('keydown', onKey);
}