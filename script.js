document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phoneInput');
    const submitBtn = document.getElementById('submitBtn');

    // تفعيل الزر عند كتابة رقم
    phoneInput.addEventListener('input', (e) => {
        // التحقق من أن المدخل يحتوي على أرقام فقط (تبسيطاً)
        if (e.target.value.length >= 9) {
            submitBtn.classList.add('active');
            submitBtn.disabled = false;
        } else {
            submitBtn.classList.remove('active');
            submitBtn.disabled = true;
        }
    });

    // منع إدخال غير الأرقام
    phoneInput.addEventListener('keypress', (e) => {
        if (isNaN(String.fromCharCode(e.which))) {
            e.preventDefault();
        }
    });
});
