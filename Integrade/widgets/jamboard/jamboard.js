document.addEventListener('DOMContentLoaded', () => {
    // --- Session and User Data (from user's jamboard.js) ---
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session");

    let sessionDisplayName = "Anonymous";
    let sessionUserPhoto = ""; // Will be raw, needs decodeURIComponent for display
    let sessionPromptText = "";
    let sessionPromptFile = ""; // Base64 data
    let sessionPromptFileName = "";
    let sessionRoom = "unknown";

    if (sessionId) {
        const session = JSON.parse(sessionStorage.getItem(sessionId));
        if (session) {
            sessionDisplayName = session.name || "Anonymous";
            sessionUserPhoto = session.photo || ""; // Store raw
            sessionPromptText = session.prompt || "";
            sessionPromptFile = session.promptFile || "";
            sessionPromptFileName = session.fileName || "";
            sessionRoom = session.room || "unknown";
        }
    }

    document.getElementById("room-label-display").textContent = `Room: ${sessionRoom}`;

    // --- UI Elements ---
    const postsContainer = document.getElementById('jamboard-posts-container');
    const addPostFab = document.getElementById('add-post-fab');
    const newPostModal = document.getElementById('new-post-modal');
    const closeModalBtn = document.getElementById('modal-close-main');
    const postSubjectInput = document.getElementById('post-subject-input');
    const postTextInput = document.getElementById('post-text-input');
    const modalFileUploadInput = document.getElementById('modal-file-upload');
    const modalFileNameDisplay = document.getElementById('modal-file-name');
    const publishPostButton = document.getElementById('publish-post-button');
    const promptDisplayArea = document.getElementById('prompt-display-area');

    // --- Placeholder Images & Data ---
    const defaultAvatar = 'https://via.placeholder.com/40/7E57C2/FFFFFF?Text=U'; // A default avatar
    const placeholderPostImage1 = 'https://via.placeholder.com/300x200/e0e0e0/757575?Text=Default+Image';

    // Attempt to use the uploaded image for the first default post.
    // Replace 'user_post_image.png' with the actual name of the image if it's specific.
    let initialPostImage = 'user_post_image.png';
    const imgTest = new Image();
    imgTest.src = initialPostImage;
    imgTest.onerror = () => { initialPostImage = placeholderPostImage1; renderPosts(); };

    let posts = [];

    async function loadPosts() {
        try {
            const response = await fetch(`../../includes/jamboard_posts.php?room=${encodeURIComponent(sessionRoom)}`);
            const data = await response.json();
            if (data.success) {
                posts = data.posts.map(p => ({
                    id: parseInt(p.id),
                    username: p.username,
                    avatar: p.avatar,
                    timestamp: new Date(p.created_at).toLocaleString(),
                    title: p.title,
                    content: p.content,
                    attachment: p.attachment,
                    filename: p.filename,
                    likes: 0,
                    comments: []
                }));
            }
        } catch (e) {
            console.error('Failed to load posts', e);
        }
    }

    async function savePost(post) {
        try {
            const response = await fetch('../../includes/jamboard_posts.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            const data = await response.json();
            if (data.success && data.id) {
                post.id = data.id;
            }
        } catch (e) {
            console.error('Failed to save post', e);
        }
    }




    // --- Prompt Display (from user's jamboard.js, adapted) ---
    function displayPrompt() {
        promptDisplayArea.innerHTML = ""; // Clear previous
        if (sessionPromptText || sessionPromptFile) {
            const displayWrapper = document.createElement("div");
            displayWrapper.className = "prompt-content-wrapper";

            if (sessionPromptText) {
                const textEl = document.createElement("p");
                textEl.textContent = sessionPromptText;
                displayWrapper.appendChild(textEl);
            }

            if (sessionPromptFile && sessionPromptFileName) {
                const preview = renderAttachment(sessionPromptFile, sessionPromptFileName, true); // isPrompt = true
                // displayWrapper.innerHTML += preview; // Avoids clearing previously added textEl if both exist
                const promptAttachmentContainer = document.createElement('div');
                promptAttachmentContainer.innerHTML = preview;
                displayWrapper.appendChild(promptAttachmentContainer);
            }
            promptDisplayArea.appendChild(displayWrapper);
        } else {
            promptDisplayArea.innerHTML = "<p>No prompt set for this session.</p>";
        }
    }

    // --- Core Functions (Rendering, Modal, etc.) ---
    function getDecodedUserPhoto(rawPhoto) {
        try {
            return rawPhoto ? decodeURIComponent(rawPhoto) : defaultAvatar;
        } catch (e) {
            console.warn("Failed to decode user photo, using default.", e);
            return defaultAvatar;
        }
    }

    function renderAttachment(base64OrUrl, filename, isPrompt = false) {
        if (!base64OrUrl || !filename) return "";
        const ext = filename.split('.').pop().toLowerCase();
        const attachmentClass = isPrompt ? "prompt-attachment" : "post-attachment-display";

        if (["png", "jpg", "jpeg", "gif"].includes(ext)) {
            return `<div class="${attachmentClass}"><img src="${base64OrUrl}" alt="${filename}" /></div>`;
        } else if (ext === "pdf") {
            return `<div class="${attachmentClass}"><embed src="${base64OrUrl}" type="application/pdf" width="100%" height="${isPrompt ? '200px': '300px'}" /></div>`;
        } else {
             return `<div class="${attachmentClass}"><p>Attachment: <a href="${base64OrUrl}" download="${filename}">${filename}</a> (Preview not available)</p></div>`;
        }
    }
    
    function createPostElement(post) {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.dataset.id = post.id;

        const userAvatarForPost = post.avatar ? (post.avatar.startsWith('http') || post.avatar.startsWith('data:') ? post.avatar : getDecodedUserPhoto(post.avatar)) : defaultAvatar;

        card.innerHTML = `
            <div class="post-header">
                <img src="${userAvatarForPost}" alt="${post.username}'s Avatar" class="avatar">
                <div class="user-info">
                    <span class="username">${post.username}</span>
                    <span class="timestamp">${post.timestamp}</span>
                </div>
                <button class="options-btn" aria-label="Post options">⋮</button>
            </div>
            <h2 class="post-title">${post.title}</h2>
            ${renderAttachment(post.attachment, post.filename)}
            <p class="post-content-text">${post.content}</p>
            <div class="post-footer">
                <div class="reactions">
                    <button class="like-btn" aria-label="Like post">
                        <span class="icon">♡</span> <span class="like-count">${post.likes}</span>
                    </button>
                    <!-- Comment count can be derived from post.comments.length -->
                </div>
            </div>
            <div class="comments-section">
                <div class="comment-list"></div>
                <button class="toggle-comment-button">Comment</button>
                <div class="comment-box hidden">
                    <textarea placeholder="Add a comment..."></textarea>
                    <button class="submit-comment-btn">Submit Comment</button>
                </div>
            </div>
        `;

        // Like button functionality
        card.querySelector('.like-btn').addEventListener('click', () => {
            post.likes++;
            renderPosts(); // Re-render to update like count
        });

        // Comment functionality (adapted from user's jamboard.js)
        const commentListEl = card.querySelector('.comment-list');
        const toggleButton = card.querySelector('.toggle-comment-button');
        const commentBox = card.querySelector('.comment-box');
        const commentTextarea = commentBox.querySelector('textarea');
        const submitCommentBtn = commentBox.querySelector('.submit-comment-btn');

        // Render existing comments
        post.comments.forEach(comment => {
            const cEl = document.createElement("div");
            cEl.className = "comment";
            const commentUserAvatar = comment.photo ? (comment.photo.startsWith('http') || comment.photo.startsWith('data:') ? comment.photo : getDecodedUserPhoto(comment.photo)) : defaultAvatar;
            cEl.innerHTML = `
                <img src="${commentUserAvatar}" alt="${comment.user}'s Photo" class="avatar">
                <div class="comment-content"><strong>${comment.user}:</strong> ${comment.content}</div>
            `;
            commentListEl.appendChild(cEl);
        });
        
        // Update comment count in reactions if you want to display it
        const commentCountDisplay = card.querySelector('.reactions .comments-count-display'); // Add this span in HTML if needed
        if(commentCountDisplay) commentCountDisplay.textContent = post.comments.length;


        toggleButton.addEventListener("click", () => {
            commentBox.classList.remove("hidden");
            toggleButton.classList.add("hidden");
            commentTextarea.focus();
        });

        submitCommentBtn.addEventListener("click", () => {
            const commentText = commentTextarea.value.trim();
            if (commentText) {
                post.comments.push({
                    user: sessionDisplayName,
                    photo: sessionUserPhoto, // Store raw session photo
                    content: commentText
                });
                renderPosts(); // Re-render to show new comment
            }
        });

        return card;
    }

    function renderPosts() {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            postsContainer.appendChild(createPostElement(post));
        });
    }

    function toggleModal(show) {
        newPostModal.style.display = show ? 'flex' : 'none';
        if (show) {
            postSubjectInput.value = '';
            postTextInput.value = '';
            modalFileUploadInput.value = ''; // Clear file input
            modalFileNameDisplay.textContent = ''; // Clear file name display
            publishPostButton.disabled = true;
            postSubjectInput.focus();
        }
    }

    function validateModalInputs() {
        const subjectFilled = postSubjectInput.value.trim() !== '';
        const textFilled = postTextInput.value.trim() !== '';
        publishPostButton.disabled = !(subjectFilled || textFilled || modalFileUploadInput.files.length > 0) ; // Enable if any field has content or file
    }

    postSubjectInput.addEventListener('input', validateModalInputs);
    postTextInput.addEventListener('input', validateModalInputs);
    modalFileUploadInput.addEventListener('change', () => {
        if (modalFileUploadInput.files.length > 0) {
            modalFileNameDisplay.textContent = modalFileUploadInput.files[0].name;
        } else {
            modalFileNameDisplay.textContent = '';
        }
        validateModalInputs();
    });


    addPostFab.addEventListener('click', () => toggleModal(true));
    closeModalBtn.addEventListener('click', () => toggleModal(false));
    newPostModal.addEventListener('click', (event) => {
        if (event.target === newPostModal) {
            toggleModal(false);
        }
    });

    publishPostButton.addEventListener('click', () => {
        if (publishPostButton.disabled) return;

        const subject = postSubjectInput.value.trim();
        const text = postTextInput.value.trim();
        const file = modalFileUploadInput.files[0];

        const newPost = {
            room: sessionRoom,
            username: sessionDisplayName,
            avatar: sessionUserPhoto,
            title: subject,
            content: text,
            attachment: null,
            filename: null
        };

        const finalize = async () => {
            await savePost(newPost);
            newPost.timestamp = 'just now';
            posts.unshift(newPost);
            renderPosts();
            toggleModal(false);
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                newPost.attachment = e.target.result;
                newPost.filename = file.name;
                finalize();
            };
            reader.readAsDataURL(file);
        } else {
            finalize();
        }
    });

    // --- Initializations ---
    displayPrompt();
    loadPosts().then(renderPosts);
});