// Lấy danh sách hồ sơ từ Local Storage
function getApplications() {
    return JSON.parse(localStorage.getItem('applications')) || [];
}

// Lưu danh sách hồ sơ vào Local Storage
function setApplications(applications) {
    localStorage.setItem('applications', JSON.stringify(applications));
}

// Lấy người dùng hiện tại
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Cấu hình Flatpickr cho input ngày sinh
document.addEventListener('DOMContentLoaded', function () {
    flatpickr("#dob", {
        dateFormat: "d/m/Y", // Định dạng ngày dd/mm/yyyy
        maxDate: "today", // Không cho phép chọn ngày trong tương lai
        defaultDate: null // Không có ngày mặc định
    });

    checkExistingApplication(); // Kiểm tra trạng thái hồ sơ
});

// Kiểm tra xem người dùng đã nộp hồ sơ chưa
function checkExistingApplication() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Bạn cần đăng nhập trước khi truy cập trang này!');
        window.location.href = 'login.html';
        return;
    }

    const applications = getApplications();
    const userApplication = applications.find(app => app.username === currentUser.username);

    if (!userApplication) {
        return; // Nếu chưa có hồ sơ, giữ nguyên form để nộp mới
    }

    // Nếu trạng thái là "Yêu cầu bổ sung", cho phép chỉnh sửa
    if (userApplication.status.startsWith('Yêu cầu bổ sung')) {
        populateFormWithApplicationData(userApplication);
        return;
    }

    // Nếu trạng thái không phải "Yêu cầu bổ sung", ẩn form và hiển thị thông báo
    document.getElementById('apply-form').style.display = 'none';
    const submittedSection = document.getElementById('already-submitted');
    submittedSection.style.display = 'block';
}

function populateFormWithApplicationData(application) {
    document.getElementById('full-name').value = application.fullName || '';
    document.getElementById('dob').value = application.dob || '';
    document.getElementById('email').value = application.email || '';
    document.getElementById('address').value = application.address || '';
    document.getElementById('highschool-name').value = application.highschoolName || '';
    document.getElementById('grade-10').value = application.grades.grade10 || '';
    document.getElementById('grade-11').value = application.grades.grade11 || '';
    document.getElementById('grade-12').value = application.grades.grade12 || '';
    document.getElementById('hobbies').value = application.hobbies || '';
    document.getElementById('major').value = application.major || '';
}

// Xử lý nộp hồ sơ
document.getElementById('apply-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Lấy dữ liệu từ form
    const fullName = document.getElementById('full-name').value.trim();
    const dob = document.getElementById('dob').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const highschoolName = document.getElementById('highschool-name').value.trim();
    const grade10 = parseFloat(document.getElementById('grade-10').value.trim());
    const grade11 = parseFloat(document.getElementById('grade-11').value.trim());
    const grade12 = parseFloat(document.getElementById('grade-12').value.trim()) || null;
    const hobbies = document.getElementById('hobbies').value.trim();
    const major = document.getElementById('major').value.trim();
    const avatarFile = document.getElementById('avatar').files[0];

    // Validate tên đầy đủ (chỉ chứa chữ cái tiếng Việt và dấu cách)
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯàáâãèéêìíòóôõùúăđĩũơưẠ-ỹ\s]+$/;
    if (!nameRegex.test(fullName)) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi nhập liệu!',
            text: 'Họ và tên chỉ được chứa chữ cái và dấu cách.',
        });
        return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Email không hợp lệ!',
            text: 'Vui lòng nhập đúng định dạng email (vd: example@gmail.com).',
        });
        return;
    }

    // Validate điểm tổng kết (trong khoảng 0 - 10)
    if (grade10 < 0 || grade10 > 10 || grade11 < 0 || grade11 > 10 || (grade12 !== null && (grade12 < 0 || grade12 > 10))) {
        Swal.fire({
            icon: 'error',
            title: 'Điểm tổng kết không hợp lệ!',
            text: 'Điểm phải nằm trong khoảng từ 0 đến 10.',
        });
        return;
    }

    // Validate địa chỉ (ít nhất 5 ký tự)
    if (address.length < 5) {
        Swal.fire({
            icon: 'error',
            title: 'Địa chỉ không hợp lệ!',
            text: 'Địa chỉ phải chứa ít nhất 5 ký tự.',
        });
        return;
    }

    // Validate tên trường cấp 3 (chỉ chứa chữ cái và dấu cách)
    if (!nameRegex.test(highschoolName)) {
        Swal.fire({
            icon: 'error',
            title: 'Tên trường không hợp lệ!',
            text: 'Tên trường chỉ được chứa chữ cái và dấu cách.',
        });
        return;
    }

    // Validate chọn chuyên ngành
    if (!major) {
        Swal.fire({
            icon: 'error',
            title: 'Chưa chọn chuyên ngành!',
            text: 'Vui lòng chọn một chuyên ngành muốn học.',
        });
        return;
    }

    // Nếu tất cả hợp lệ, tiếp tục xử lý
    let avatarBase64 = '';
    if (avatarFile) {
        avatarBase64 = await convertFileToBase64(avatarFile);
    }

    // Lấy thông tin người dùng hiện tại
    const currentUser = getCurrentUser();
    if (!currentUser) {
        Swal.fire({
            icon: 'error',
            title: 'Chưa đăng nhập!',
            text: 'Vui lòng đăng nhập trước khi nộp hồ sơ.',
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }

    const applications = getApplications();
    const newApplication = {
        username: currentUser.username,
        fullName,
        dob,
        email,
        address,
        highschoolName,
        grades: { grade10, grade11, grade12 },
        avatarBase64,
        hobbies,
        major,
        status: 'Chờ duyệt', // Mặc định trạng thái
        submittedAt: new Date().toISOString()
    };

    // Lưu vào Local Storage
    applications.push(newApplication);
    setApplications(applications);

    Swal.fire({
        icon: 'success',
        title: 'Hồ sơ đã được nộp!',
        text: 'Bạn có thể theo dõi trạng thái hồ sơ.',
    }).then(() => {
        document.getElementById('apply-form').reset();
        window.location.href = 'status.html';
    });
});

// Hàm chuyển file sang Base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file); // Đọc file dưới dạng Data URL (Base64)
    });
}