// Global variables
let leaves = [];
let leaveIdCounter = 1;

// DOM elements
const leaveForm = document.getElementById('leaveForm');
const leaveList = document.getElementById('leaveList');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const daysIndicator = document.getElementById('daysIndicator');
const daysCount = document.getElementById('daysCount');

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
startDateInput.min = today;
endDateInput.min = today;

// Helper functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

function updateDaysCounter() {
    const start = startDateInput.value;
    const end = endDateInput.value;

    if (start && end) {
        const days = calculateDays(start, end);
        daysCount.textContent = days;
        daysIndicator.classList.add('show');
        startDateInput.classList.add('has-value');
        endDateInput.classList.add('has-value');
    } else {
        daysIndicator.classList.remove('show');
        startDateInput.classList.remove('has-value');
        endDateInput.classList.remove('has-value');
    }
}

function updateStats() {
    document.getElementById('totalLeaves').textContent = leaves.length;
    document.getElementById('pendingLeaves').textContent =
        leaves.filter(l => l.status === 'pending').length;
    document.getElementById('approvedLeaves').textContent =
        leaves.filter(l => l.status === 'approved').length;
    document.getElementById('rejectedLeaves').textContent =
        leaves.filter(l => l.status === 'rejected').length;
}

function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function renderLeaves() {
    if (leaves.length === 0) {
        leaveList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No leave requests yet</p></div>';
        return;
    }

    leaveList.innerHTML = leaves.map(leave => `
        <div class="leave-item">
            <div class="leave-header">
                <div class="leave-type">${leave.type}</div>
                <span class="status-badge status-${leave.status}">${leave.status}</span>
            </div>
            <div style="margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary);">
                ${leave.name}
            </div>
            <div class="leave-dates">
                ${formatDisplayDate(leave.startDate)} - ${formatDisplayDate(leave.endDate)}
                <span class="leave-days">${leave.days} ${leave.days === 1 ? 'day' : 'days'}</span>
            </div>
            <div class="leave-reason">${leave.reason}</div>
            ${leave.status === 'pending' ? `
                <div class="leave-actions">
                    <button class="btn btn-small btn-approve" onclick="approveLeave(${leave.id})">Approve</button>
                    <button class="btn btn-small btn-reject" onclick="rejectLeave(${leave.id})">Reject</button>
                    <button class="btn btn-small btn-delete" onclick="deleteLeave(${leave.id})">Delete</button>
                </div>
            ` : `
                <div class="leave-actions">
                    <button class="btn btn-small btn-delete" onclick="deleteLeave(${leave.id})">Delete</button>
                </div>
            `}
        </div>
    `).join('');
}

// Event listeners
startDateInput.addEventListener('change', function() {
    endDateInput.min = this.value;
    updateDaysCounter();
});

endDateInput.addEventListener('change', updateDaysCounter);

// Form submission
leaveForm.onsubmit = function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('employeeName').value.trim(),
        type: document.getElementById('leaveType').value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        reason: document.getElementById('reason').value.trim()
    };

    // Validation
    if (!formData.name || !formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
        alert('Please fill in all fields');
        return false;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
        alert('End date must be on or after start date');
        return false;
    }

    // Create new leave
    const newLeave = {
        id: leaveIdCounter++,
        name: formData.name,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'pending',
        days: calculateDays(formData.startDate, formData.endDate)
    };

    leaves.unshift(newLeave);
    updateStats();
    renderLeaves();

    // Reset form
    leaveForm.reset();
    daysIndicator.classList.remove('show');
    startDateInput.classList.remove('has-value');
    endDateInput.classList.remove('has-value');
    startDateInput.min = today;
    endDateInput.min = today;

    // Success animation
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { submitBtn.style.transform = 'scale(1)'; }, 200);

    return false;
};

// Leave actions
function approveLeave(id) {
    const leave = leaves.find(l => l.id === id);
    if (leave) {
        leave.status = 'approved';
        updateStats();
        renderLeaves();
    }
}

function rejectLeave(id) {
    const leave = leaves.find(l => l.id === id);
    if (leave) {
        leave.status = 'rejected';
        updateStats();
        renderLeaves();
    }
}

function deleteLeave(id) {
    leaves = leaves.filter(l => l.id !== id);
    updateStats();
    renderLeaves();
}

// Initialize with sample data
function init() {
    const todayDate = new Date();
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(todayDate);
    nextWeek.setDate(nextWeek.getDate() + 7);

    leaves = [{
        id: leaveIdCounter++,
        name: 'John Doe',
        type: 'Annual Leave',
        startDate: formatDate(tomorrow),
        endDate: formatDate(nextWeek),
        reason: 'Family vacation',
        status: 'pending',
        days: calculateDays(formatDate(tomorrow), formatDate(nextWeek))
    }];

    updateStats();
    renderLeaves();
}

init();
