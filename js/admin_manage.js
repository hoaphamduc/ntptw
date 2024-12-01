// Lấy thông tin người dùng hiện tại
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Kiểm tra quyền admin trước khi render trang
function checkAdminAccess() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'Truy cập bị từ chối',
            text: 'Chỉ admin mới có quyền truy cập trang này!',
        }).then(() => {
            window.location.href = 'index.html'; // Chuyển hướng về trang chủ
        });
    } else {
        renderAdminContent(); // Nếu là admin, render nội dung
    }
}

// Hiển thị nội dung quản lý hồ sơ
function renderAdminContent() {
    displayApplications(); // Gọi hàm hiển thị danh sách hồ sơ
}

// Lấy danh sách hồ sơ từ Local Storage
function getApplications() {
    return JSON.parse(localStorage.getItem('applications')) || [];
}

// Lưu danh sách hồ sơ vào Local Storage
function setApplications(applications) {
    localStorage.setItem('applications', JSON.stringify(applications));
}

// Hiển thị danh sách hồ sơ với tìm kiếm và phân trang
function displayApplications(searchTerm = '', currentPage = 1) {
    const applications = getApplications();
    const container = document.getElementById('applications-container');
    const itemsPerPage = 20;
    const filteredApplications = applications.filter(app =>
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredApplications.length === 0) {
        container.innerHTML = '<p>Không tìm thấy hồ sơ nào.</p>';
        return;
    }

    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Họ và Tên</th>
                    <th>Ngày Nộp</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                </tr>
            </thead>
            <tbody>
                ${paginatedApplications.map((app, index) => {
                    // Gán class trạng thái tương ứng
                    let statusClass = '';
                    if (app.status.startsWith('Yêu cầu bổ sung')) {
                        statusClass = 'status-requested';
                    } else {
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
                                statusClass = '';
                        }
                    }

                    return `
                        <tr>
                            <td>${startIndex + index + 1}</td>
                            <td>${app.fullName}</td>
                            <td>${new Date(app.submittedAt).toLocaleDateString('vi-VN')} - ${new Date(app.submittedAt).toLocaleTimeString('vi-VN')}</td>
                            <td><span class="${statusClass}">${app.status}</span></td>
                            <td>
                                <button class="view" onclick="viewApplicationDetails(${applications.indexOf(app)})">Xem</button>
                                <button class="additional-request" onclick="requestMoreInfo(${applications.indexOf(app)})">Yêu cầu bổ sung</button>
                                <button class="approve" onclick="approveApplication(${applications.indexOf(app)})">Duyệt</button>
                                <button class="refuse" onclick="rejectApplication(${applications.indexOf(app)})">Không duyệt</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div class="pagination">
            ${Array.from({ length: totalPages }, (_, i) => `
                <button class="page-btn" onclick="displayApplications('${searchTerm}', ${i + 1})">${i + 1}</button>
            `).join('')}
        </div>
    `;
}

// Hiển thị thông tin chi tiết của thí sinh
function viewApplicationDetails(index) {
    const applications = getApplications();
    const app = applications[index];

    if (!app) return;

    const grades = `
        <ul>
            <li><strong>Lớp 10:</strong> ${app.grades.grade10}</li>
            <li><strong>Lớp 11:</strong> ${app.grades.grade11}</li>
            <li><strong>Lớp 12:</strong> ${app.grades.grade12 || 'Chưa cập nhật'}</li>
        </ul>
    `;

    const avatar = app.avatarBase64
        ? `<img src="${app.avatarBase64}" alt="Avatar" style="width: 150px; height: 150px; border-radius: 50%; display: block; margin: 15px auto; border-radius: 50%; border: 1px solid #707070;"/>`
        : '<p>Chưa cung cấp</p>';

    Swal.fire({
        title: `Thông tin chi tiết: ${app.fullName}`,
        html: `
            ${avatar}
            <p><strong>Họ và tên:</strong> ${app.fullName}</p>
            <p><strong>Ngày sinh:</strong> ${app.dob}</p>
            <p><strong>Email:</strong> ${app.email}</p>
            <p><strong>Địa chỉ:</strong> ${app.address}</p>
            <p><strong>Trường cấp 3:</strong> ${app.highschoolName}</p>
            <p><strong>Điểm tổng kết:</strong> ${grades}</p>
            <p><strong>Sở thích:</strong> ${app.hobbies || 'Chưa cung cấp'}</p>
            <p><strong>Ngành đăng ký:</strong> ${app.major}</p>
            <p><strong>Ngày nộp:</strong> ${new Date(app.submittedAt).toLocaleString()}</p>
            <p><strong>Trạng thái:</strong> ${app.status}</p>
        `,
        showCloseButton: true,
        confirmButtonText: 'Đóng',
    });
}

// Duyệt hồ sơ
function approveApplication(index) {
    const applications = getApplications();
    applications[index].status = 'Đã duyệt';
    setApplications(applications);
    Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Hồ sơ đã được duyệt.',
    });
    displayApplications();
}

// Yêu cầu bổ sung thông tin
function requestMoreInfo(index) {
    Swal.fire({
        title: 'Nhập lý do yêu cầu bổ sung',
        input: 'text',
        inputLabel: 'Lý do',
        inputPlaceholder: 'Nhập lý do...',
        showCancelButton: true,
    }).then(result => {
        if (result.isConfirmed && result.value) {
            const applications = getApplications();
            applications[index].status = `Yêu cầu bổ sung: ${result.value}`;
            setApplications(applications);
            Swal.fire({
                icon: 'success',
                title: 'Yêu cầu đã được gửi!',
            });
            displayApplications();
        }
    });
}

// Không duyệt hồ sơ
function rejectApplication(index) {
    Swal.fire({
        title: 'Xác nhận từ chối?',
        text: 'Bạn có chắc chắn muốn từ chối hồ sơ này không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Có',
        cancelButtonText: 'Không',
    }).then(result => {
        if (result.isConfirmed) {
            const applications = getApplications();
            applications[index].status = 'Không được duyệt';
            setApplications(applications);
            Swal.fire({
                icon: 'success',
                title: 'Hồ sơ đã bị từ chối.',
            });
            displayApplications();
        }
    });
}

// Xử lý tìm kiếm
function handleSearch() {
    const searchInput = document.getElementById('search-input').value;
    displayApplications(searchInput);
}

// Kiểm tra quyền admin khi tải trang
document.addEventListener('DOMContentLoaded', checkAdminAccess);