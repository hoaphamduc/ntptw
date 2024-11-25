let currentEditPostId = null;
let currentPage = 1; // Biến để lưu trang hiện tại
const itemsPerPage = 10; // Giới hạn bài đăng mỗi trang

// Mở modal chỉnh sửa
function openEditModal(id) {
    const posts = getPosts();
    const post = posts.find((p) => p.id === id);

    if (!post) return;

    currentEditPostId = id; // Lưu ID bài viết hiện tại

    // Điền thông tin bài viết vào modal
    document.getElementById('edit-title').value = post.title;
    document.getElementById('edit-content').value = post.content;

    const imagePreview = document.getElementById('edit-image-preview');
    if (post.imageBase64) {
        imagePreview.src = post.imageBase64;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.style.display = 'none';
    }

    // Hiển thị modal
    document.getElementById('edit-modal').style.display = 'flex';
}

// Đóng modal chỉnh sửa
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Lưu thay đổi sau khi chỉnh sửa
function saveEditChanges() {
    const posts = getPosts();
    const post = posts.find((p) => p.id === currentEditPostId);

    if (!post) return;

    const updatedTitle = document.getElementById('edit-title').value.trim();
    const updatedContent = document.getElementById('edit-content').value.trim();
    const updatedImageFile = document.getElementById('edit-image').files[0];

    if (!updatedTitle || !updatedContent) {
        Swal.fire({
            icon: 'error',
            title: 'Thông tin không đầy đủ',
            text: 'Vui lòng nhập đầy đủ tiêu đề và nội dung.',
        });
        return;
    }

    // Cập nhật thông tin bài viết
    post.title = updatedTitle;
    post.content = updatedContent;

    // Nếu người dùng cập nhật hình ảnh mới
    if (updatedImageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            post.imageBase64 = e.target.result;
            setPosts(posts); // Lưu lại vào Local Storage
            renderPostsList(document.getElementById('posts-container')); // Cập nhật danh sách
            closeEditModal(); // Đóng modal
        };
        reader.readAsDataURL(updatedImageFile);
    } else {
        setPosts(posts); // Lưu lại vào Local Storage
        renderPostsList(document.getElementById('posts-container')); // Cập nhật danh sách
        closeEditModal(); // Đóng modal
    }
}

// Kiểm tra quyền admin trước khi render trang
function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'Truy cập bị từ chối',
            text: 'Chỉ admin mới có quyền truy cập!',
        }).then(() => {
            window.location.href = 'index.html'; // Chuyển hướng về trang chủ
        });
        return false;
    }
    return true;
}

// Hàm render nội dung trang
function renderAdminContent() {
    const postsContainer = document.getElementById('posts-container');
    renderPostForm();
    renderPostsList(postsContainer);
}

// Hiển thị form đăng bài
function renderPostForm() {
    document.getElementById('post-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const imageFile = document.getElementById('post-image').files[0];

        if (!title || !content) {
            Swal.fire({
                icon: 'error',
                title: 'Thông tin không đầy đủ',
                text: 'Vui lòng nhập tiêu đề và nội dung bài viết.',
            });
            return;
        }

        let imageBase64 = '';
        if (imageFile) {
            imageBase64 = await convertFileToBase64(imageFile); // Chuyển ảnh sang Base64
        }

        const posts = getPosts();
        const newPost = {
            id: Date.now(), // Tạo ID duy nhất
            title,
            content,
            imageBase64,
            postedAt: new Date().toISOString(),
        };

        posts.push(newPost);
        setPosts(posts);

        Swal.fire({
            icon: 'success',
            title: 'Đăng tin thành công!',
        });

        document.getElementById('post-form').reset();
        renderPostsList(document.getElementById('posts-container'));
    });
}

// Hiển thị danh sách bài đăng với phân trang và tìm kiếm
function renderPostsList(container, searchTerm = '') {
    const posts = getPosts();
    const filteredPosts = posts.filter(
        (post) =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredPosts.length === 0) {
        container.innerHTML = '<p>Không có bài đăng nào phù hợp.</p>';
        return;
    }

    // Tính toán số trang
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const postsToDisplay = filteredPosts.slice(startIndex, endIndex);

    // Hiển thị bài đăng dạng lưới
    container.innerHTML = postsToDisplay
            .map(
                (post) => `
            <div class="post">
                <h3 class="no-select">${post.title}</h3>
                <em style="color: #333; font-size: 12px; display: block; margin-bottom: 15px;" class="no-select">
                    Ngày đăng: ${new Date(post.postedAt).toLocaleDateString('vi-VN')} ${new Date(post.postedAt).toLocaleTimeString('vi-VN')}
                </em>
                ${
                    post.imageBase64
                        ? `<img src="${post.imageBase64}" alt="Hình ảnh" class="post-image no-select">`
                        : ''
                }
                <div class="post-content no-select">${post.content.replace(/\n/g, '<br>')}</div>
                <button onclick="openEditModal(${post.id})">Sửa</button>
                <button onclick="deletePost(${post.id})">Xóa</button>
            </div>
        `
            )
            .join('');

    // Hiển thị phân trang
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination');
    paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        return `<button class="page-btn" ${
            page === currentPage ? 'style="font-weight: bold;"' : ''
        } onclick="changePage(${page}, '${searchTerm}')">${page}</button>`;
    }).join('');
    container.appendChild(paginationContainer);
}

// Chuyển trang
function changePage(page, searchTerm = '') {
    currentPage = page;
    renderPostsList(document.getElementById('posts-container'), searchTerm);
}

// Hàm tìm kiếm
function handleSearch() {
    const searchInput = document.getElementById('search-input').value.trim();
    currentPage = 1; // Reset về trang đầu tiên
    renderPostsList(document.getElementById('posts-container'), searchInput);
}

// Xóa bài đăng
function deletePost(id) {
    Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: 'Bài viết sẽ bị xóa và không thể khôi phục!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
    }).then((result) => {
        if (result.isConfirmed) {
            const posts = getPosts();
            const updatedPosts = posts.filter((post) => post.id !== id);
            setPosts(updatedPosts);

            Swal.fire({
                icon: 'success',
                title: 'Đã xóa bài đăng!',
            });

            renderPostsList(document.getElementById('posts-container'));
        }
    });
}

// Sửa bài đăng
function editPost(id) {
    const posts = getPosts();
    const post = posts.find((p) => p.id === id);

    if (!post) return;

    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;

    Swal.fire({
        title: 'Chỉnh sửa bài viết',
        text: 'Bạn đang chỉnh sửa bài viết này.',
        icon: 'info',
    });

    // Xử lý lưu sau khi chỉnh sửa
    const submitButton = document.querySelector('#post-form button');
    submitButton.innerText = 'Cập Nhật';
    submitButton.onclick = function () {
        const updatedTitle = document.getElementById('post-title').value.trim();
        const updatedContent = document.getElementById('post-content').value.trim();

        if (!updatedTitle || !updatedContent) {
            Swal.fire({
                icon: 'error',
                title: 'Thông tin không đầy đủ',
                text: 'Vui lòng nhập tiêu đề và nội dung đầy đủ.',
            });
            return;
        }

        post.title = updatedTitle;
        post.content = updatedContent;

        setPosts(posts);
        Swal.fire({
            icon: 'success',
            title: 'Cập nhật bài đăng thành công!',
        });

        renderPostsList(document.getElementById('posts-container'));
        document.getElementById('post-form').reset();
        submitButton.innerText = 'Đăng Tin';
        submitButton.onclick = null; // Reset lại sự kiện click
    };
}

// Lấy danh sách bài đăng từ Local Storage
function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

// Lưu danh sách bài đăng vào Local Storage
function setPosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Hàm chuyển file ảnh sang Base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// Kiểm tra quyền và render nội dung
document.addEventListener('DOMContentLoaded', function () {
    if (checkAdminAccess()) {
        renderAdminContent();
    }
});
