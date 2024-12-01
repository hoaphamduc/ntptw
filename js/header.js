// Tự động thêm SweetAlert2 vào trang
function loadSweetAlert() {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.defer = true;
    document.head.appendChild(script);
}

loadSweetAlert();

// Hàm kiểm tra người dùng hiện tại trong Local Storage
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Hàm render nút trong nav
function renderNavBar() {
    const navBar = document.getElementById('nav-bar');
    const currentUser = getCurrentUser();

    if (!currentUser) {
        navBar.innerHTML = `
            <a href="about.html">Giới thiệu ngành</a>
            <a href="https://hnuemaptest.netlify.app/login.html" target="_blank">Bản đồ trường</a>
            <a href="login.html">Đăng nhập</a>
            <a href="register.html">Đăng ký</a>
        `;
    } else {
        let userButtons = '';

        if (currentUser.role === 'admin') {
            userButtons = `
                <a href="admin_manage.html">Quản lý hồ sơ</a>
                <a href="admin_post.html">Quản lý tin tức</a>
            `;
        } else if (currentUser.role === 'candidate') {
            userButtons = `
                <a href="apply.html">Nộp Hồ Sơ</a>
                <a href="status.html">Theo Dõi Hồ Sơ</a>
            `;
        }

        navBar.innerHTML = `
            ${userButtons}
            <a href="about.html">Giới thiệu ngành</a>
            <a href="https://hnuemaptest.netlify.app/login.html" target="_blank">Bản đồ trường</a>
            <a href="#" id="logout">Đăng xuất</a>    
        `;

        document.getElementById('logout').addEventListener('click', logoutUser);
    }
}

// Hàm xử lý Đăng xuất
function logoutUser() {
    Swal.fire({
        title: 'Bạn có chắc chắn muốn đăng xuất không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy',
        reverseButtons: true,
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('currentUser');
            Swal.fire({
                icon: 'success',
                title: 'Bạn đã đăng xuất!',
                showConfirmButton: false,
                timer: 1500,
            }).then(() => {
                window.location.href = 'index.html';
            });
        }
    });
}

// Gọi hàm render khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    renderNavBar();

    const menuToggle = document.getElementById('menu-toggle');
    const navBar = document.getElementById('nav-bar');

    if (menuToggle && navBar) {
        menuToggle.addEventListener('click', () => {
            navBar.classList.toggle('show');
        });

        navBar.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                navBar.classList.remove('show');
            }
        });
    }
});