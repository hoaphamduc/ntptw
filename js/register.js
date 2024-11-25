// Lấy danh sách người dùng từ Local Storage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Lưu danh sách người dùng vào Local Storage
function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Hàm xử lý đăng ký
document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    // Kiểm tra độ dài tài khoản và mật khẩu
    if (username.length < 5) {
        Swal.fire({
            icon: 'error',
            title: 'Tên đăng nhập quá ngắn!',
            text: 'Tên đăng nhập phải có ít nhất 5 ký tự.',
        });
        return;
    }

    if (password.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Mật khẩu quá ngắn!',
            text: 'Mật khẩu phải có ít nhất 6 ký tự.',
        });
        return;
    }

    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Xác nhận mật khẩu không khớp!',
            text: 'Vui lòng kiểm tra lại mật khẩu.',
        });
        return;
    }

    // Lấy danh sách người dùng từ Local Storage
    const users = getUsers();

    // Kiểm tra tài khoản đã tồn tại
    if (users.some(user => user.username === username)) {
        Swal.fire({
            icon: 'error',
            title: 'Tài khoản đã tồn tại!',
            text: 'Vui lòng chọn tên đăng nhập khác.',
        });
        return;
    }

    // Xác định vai trò của người dùng
    const role = username.toLowerCase() === 'admin' ? 'admin' : 'candidate';

    // Thêm người dùng mới
    users.push({ username, password, role });
    setUsers(users);

    Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: role === 'admin' ? 'Bạn đã được gán vai trò admin.' : 'Bạn có thể đăng nhập ngay bây giờ.',
    }).then(() => {
        window.location.href = 'login.html';
    });
});