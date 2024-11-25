// Lấy danh sách hồ sơ từ Local Storage
function getApplications() {
    return JSON.parse(localStorage.getItem('applications')) || [];
}

// Lấy người dùng hiện tại
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Hiển thị trạng thái hồ sơ của thí sinh
function displayStatus() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Bạn cần đăng nhập để kiểm tra trạng thái hồ sơ!');
        window.location.href = 'login.html';
        return;
    }

    const applications = getApplications();
    const userApplications = applications.filter(app => app.username === currentUser.username);

    const statusContainer = document.getElementById('status-container');

    if (userApplications.length === 0) {
        statusContainer.innerHTML = '<p>Bạn chưa nộp hồ sơ.</p> Vui lòng nộp hồ sơ tại <a href="apply.html">đây</a>!';
        return;
    }

    statusContainer.innerHTML = userApplications.map(app => {
        let statusClass = '';
        switch (app.status) {
            case 'Đã duyệt':
                statusClass = 'status-approved';
                break;
            case 'Chờ duyệt':
                statusClass = 'status-pending';
                break;
            case 'Không được duyệt':
                statusClass = 'status-rejected';
                break;
            default:
                if (app.status.startsWith('Yêu cầu bổ sung')) {
                    statusClass = 'status-requested';
                }
        }
    
        return `
            <div class="application-card">
                <span class="status-badge ${statusClass}">${app.status}</span>
                <p><strong>Họ và tên:</strong> ${app.fullName}</p>
                <p><strong>Ngày sinh:</strong> ${app.dob}</p>
                <p><strong>Email:</strong> ${app.email}</p>
                <p><strong>Địa chỉ:</strong> ${app.address}</p>
                <p><strong>Tên trường cấp 3:</strong> ${app.highschoolName}</p>
                <p><strong>Điểm tổng kết:</strong></p>
                <ul>
                    <li><strong>Lớp 10:</strong> ${app.grades.grade10}</li>
                    <li><strong>Lớp 11:</strong> ${app.grades.grade11}</li>
                    <li><strong>Lớp 12:</strong> ${app.grades.grade12 || 'Chưa cập nhật'}</li>
                </ul>
                <p><strong>Sở thích:</strong> ${app.hobbies || 'Chưa cung cấp'}</p>
                <p><strong>Chuyên ngành muốn học:</strong> ${app.major}</p>
                <p><strong>Hình đại diện:</strong></p>
                ${app.avatarBase64 ? `<img src="${app.avatarBase64}" alt="Avatar" class="avatar-preview">` : '<p>Chưa cung cấp</p>'}
                ${app.status.startsWith('Yêu cầu bổ sung') ? `
                    <button onclick="window.location.href='apply.html'">Chỉnh sửa hồ sơ</button>
                ` : ''}
                <p><strong>Ngày nộp:</strong> ${new Date(app.submittedAt).toLocaleString()}</p>
            </div>
        `;
    }).join('');
}

// Hiển thị trạng thái khi tải trang
document.addEventListener('DOMContentLoaded', displayStatus);
