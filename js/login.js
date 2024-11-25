// Lấy danh sách người dùng từ Local Storage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Hàm xử lý đăng nhập
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const rememberMe = document.getElementById('remember-me').checked;

    // Kiểm tra thông tin nhập vào
    if (username.length < 5) {
        Swal.fire({
            icon: 'error',
            title: 'Tên đăng nhập không hợp lệ!',
            text: 'Tên đăng nhập phải có ít nhất 5 ký tự.',
        });
        return;
    }

    if (password.length < 6) {
        Swal.fire({
            icon: 'error',
            title: 'Mật khẩu không hợp lệ!',
            text: 'Mật khẩu phải có ít nhất 6 ký tự.',
        });
        return;
    }

    // Kiểm tra thông tin tài khoản từ Local Storage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        Swal.fire({
            icon: 'success',
            title: 'Đăng nhập thành công!',
            text: 'Chào mừng bạn quay trở lại!',
        }).then(() => {
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Lưu thông tin tài khoản nếu chọn "Nhớ tài khoản"
            if (rememberMe) {
                localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
            } else {
                localStorage.removeItem('rememberedUser'); // Xóa thông tin nếu không nhớ
            }

            window.location.href = 'index.html'; // Chuyển đến trang chủ
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Đăng nhập thất bại!',
            text: 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.',
        });
    }
});

// Tự động điền thông tin nếu "Nhớ tài khoản" đã được chọn trước đó
document.addEventListener('DOMContentLoaded', function () {
    const rememberedUser = JSON.parse(localStorage.getItem('rememberedUser'));
    if (rememberedUser) {
        document.getElementById('login-username').value = rememberedUser.username;
        document.getElementById('login-password').value = rememberedUser.password;
        document.getElementById('remember-me').checked = true;
    }
});