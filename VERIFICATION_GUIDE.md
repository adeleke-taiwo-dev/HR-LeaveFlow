# HR-LeaveFlow Enhancement Verification Guide

## Quick Start

### 1. Setup & Start
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Run database migration
cd server
npx prisma migrate dev --name add-multi-level-approval
npx prisma generate

# Start backend (Terminal 1)
cd server
npm run dev
# Server should start on http://localhost:5000

# Start frontend (Terminal 2)
cd client
npm run dev
# Client should start on http://localhost:5173
```

### 2. Test User Accounts
Ensure you have test accounts with different roles:
- **Employee**: employee@test.com
- **Manager**: manager@test.com
- **Admin**: admin@test.com

## Feature Verification

### ✅ Feature 1: Reports & Export

#### Test CSV Export
1. Login as **Manager** or **Admin**
2. Navigate to **Reports** (sidebar)
3. Select date range (e.g., last 30 days)
4. Select status filter (e.g., "Approved")
5. Click **"Export CSV"**
6. **Expected**: CSV file downloads with filtered leaves
7. Open CSV in Excel/Numbers to verify data

#### Test PDF Export
1. On Reports page
2. Select filters
3. Click **"Export PDF"**
4. **Expected**: PDF file downloads with formatted report
5. Open PDF to verify formatting and data

#### Test Annual Report
1. Switch to **"Annual Reports"** tab
2. Select an employee from dropdown
3. Select year (e.g., 2024)
4. **Expected**:
   - Summary cards show total leaves, days taken, days pending
   - Leave balances table displays
   - Breakdown by leave type shows

#### Test Department Analytics (Admin Only)
1. Login as **Admin**
2. Go to Reports > **"Department Analytics"** tab
3. Select a department
4. Select date range
5. **Expected**:
   - Summary statistics display
   - Monthly trends line chart appears
   - Leave type distribution pie chart shows
   - Employee utilization bar chart renders

### ✅ Feature 2: Dashboard Enhancements

#### Test Upcoming Leaves
1. Login as **Manager** or **Admin**
2. Go to **Dashboard**
3. Scroll to **"Upcoming Leaves"** section
4. **Expected**:
   - Table shows approved leaves starting within next 30 days
   - Columns: Employee, Leave Type, Dates, Days
   - Data is relevant to your role (dept for manager, all for admin)

#### Test Leave Trends Chart
1. On Dashboard, scroll to **"Leave Trends"** section
2. **Expected**:
   - Line chart shows last 6 months
   - Three lines: Approved (green), Pending (orange), Rejected (red)
   - X-axis shows months, Y-axis shows count

#### Test Quick Actions
1. Login as **Manager** or **Admin**
2. On Dashboard, find **"Quick Actions"** section
3. Click **"Review"** on a pending leave
4. **Expected**:
   - Comment textarea appears
   - "Approve" and "Reject" buttons show
5. Add optional comment
6. Click **"Approve"**
7. **Expected**:
   - Success toast appears
   - Leave disappears from Quick Actions
   - Dashboard refreshes

### ✅ Feature 3: Multi-level Approval

#### Setup Workflow (Admin)
1. Login as **Admin**
2. Navigate to **Admin > Workflows**
3. Click **"+ Create Workflow"**
4. Select leave type (e.g., "Annual Leave")
5. **Option A**: Enable "Always Requires HR Approval"
6. **Option B**: Set "Min Days for HR" to 5
7. Click **"Create"**
8. **Expected**: Workflow card appears in grid

#### Test Multi-step Approval Flow
**Step 1: Employee Requests Leave**
1. Login as **Employee**
2. Create new leave request:
   - Leave Type: Annual Leave (or type with workflow)
   - Duration: 7 days (exceeds threshold if set)
3. Submit
4. **Expected**: Status shows "Pending"

**Step 2: Manager Approves**
1. Login as **Manager**
2. Go to **Team Leaves**
3. Find the leave request
4. Click **"Approve"**
5. **Expected**:
   - Status changes to **"Awaiting HR Approval"** (orange badge)
   - Manager approval details show
   - Leave balance NOT updated yet

**Step 3: HR/Admin Finalizes**
1. Login as **Admin**
2. Go to **Team Leaves**
3. Filter by **"Awaiting HR"**
4. Find the leave
5. **Expected**:
   - See manager approval: "Manager: Approved by [Name]"
   - Status badge shows "Awaiting HR Approval"
6. Click **"Approve"**
7. **Expected**:
   - Status changes to **"Approved"** (green badge)
   - HR approval details show
   - Both manager and HR comments visible
   - Leave balance updated

#### Test Manager Rejection (Early Exit)
1. Employee creates leave request
2. Manager clicks **"Reject"**
3. Add rejection reason
4. **Expected**:
   - Status immediately goes to "Rejected"
   - No HR step needed
   - Balance restored

### ✅ Feature 4: Mobile Responsiveness

#### Test Mobile Navigation
1. Resize browser to 375px width (or use Chrome DevTools mobile view)
2. **Expected**:
   - Sidebar hidden by default
   - Blue hamburger menu button in top-left corner
3. Click hamburger button
4. **Expected**:
   - Sidebar slides in from left
   - Dark backdrop overlay appears
   - Close icon (X) replaces hamburger
5. Click backdrop or X
6. **Expected**: Sidebar slides out

#### Test Dashboard Mobile Layout
1. In mobile view, go to Dashboard
2. **Expected**:
   - Stats cards stack vertically (1 column)
   - Recent Leaves and Balance cards stack
   - Charts are responsive
   - Quick Actions cards stack
   - No horizontal scrolling

#### Test Leaves Mobile Layout
1. Go to My Leaves or Team Leaves
2. **Expected**:
   - Filter buttons scroll horizontally if needed
   - Leave cards are full width
   - Action buttons stack vertically
   - All text readable without zooming

#### Test Reports Mobile Layout
1. Go to Reports page
2. **Expected**:
   - Tabs scroll horizontally
   - Filter fields stack vertically
   - Export buttons stack vertically
   - Charts are responsive
   - Summary cards stack

## Common Issues & Solutions

### Issue: Migration fails
**Solution**: Check PostgreSQL is running and DATABASE_URL is correct in server/.env

### Issue: CSV/PDF export returns 404
**Solution**: Ensure no leaves match the filters. Try broader date range or "All" status.

### Issue: Charts not rendering
**Solution**: Check browser console for errors. Ensure recharts is installed: `npm install recharts`

### Issue: Workflow not triggering HR step
**Solution**:
- Verify workflow exists for the leave type
- Check leave duration exceeds minDaysForHR threshold
- Ensure reviewer role is "manager" not "admin"

### Issue: Mobile menu not appearing
**Solution**: Clear browser cache, ensure Sidebar.css has mobile styles

### Issue: PENDING_HR status not showing
**Solution**: Check constants.js has PENDING_HR status and STATUS_LABELS

## Performance Benchmarks

### Expected Load Times
- Dashboard: < 1 second
- Reports page (with filters): < 2 seconds
- Export CSV (100 leaves): < 1 second
- Export PDF (100 leaves): 2-3 seconds
- Charts render: < 500ms

### Database Query Performance
- Leave list (paginated 20): < 100ms
- Annual report: < 200ms
- Department analytics: < 500ms

## Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Reports | ✅ | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ | ✅ |
| Export PDF | ✅ | ✅ | ✅ | ✅ |
| Charts | ✅ | ✅ | ✅ | ✅ |
| Mobile Menu | ✅ | ✅ | ✅ | ✅ |
| Workflows | ✅ | ✅ | ✅ | ✅ |

## API Testing (Optional)

### Using curl or Postman

#### Test Export Endpoint
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/leaves/export?format=csv&status=approved" \
  --output leaves.csv
```

#### Test Annual Report
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/leaves/reports/annual/USER_ID/2024"
```

#### Test Workflow Creation
```bash
curl -X POST http://localhost:5000/api/workflows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveTypeId": "LEAVE_TYPE_UUID",
    "requiresHR": true,
    "minDaysForHR": 5
  }'
```

## Success Criteria

### All Features Working ✓
- [ ] CSV export downloads with correct data
- [ ] PDF export generates formatted report
- [ ] Annual report displays employee breakdown
- [ ] Department analytics shows charts
- [ ] Dashboard shows upcoming leaves
- [ ] Dashboard shows leave trends chart
- [ ] Quick actions approve/reject works
- [ ] Mobile hamburger menu toggles
- [ ] Mobile layouts stack correctly
- [ ] Workflow configuration saves
- [ ] Multi-step approval completes fully
- [ ] PENDING_HR status displays properly
- [ ] Manager and HR comments save
- [ ] Leave balance updates after final approval

### No Breaking Changes ✓
- [ ] Existing features still work (My Leaves, New Request, etc.)
- [ ] Login/logout functional
- [ ] User management works
- [ ] Department management works
- [ ] Leave type management works
- [ ] Calendar view displays

## Rollback Plan

If critical issues found:
```bash
# Revert database migration
cd server
npx prisma migrate reset

# Restore previous code (if using git)
git checkout HEAD~1

# Reinstall dependencies
npm install
```

## Next Steps After Verification

1. **User Acceptance Testing**: Have actual users test in staging
2. **Performance Testing**: Load test with 1000+ leave records
3. **Security Audit**: Review role-based access controls
4. **Documentation**: Update user manual with new features
5. **Training**: Train HR staff on multi-level approval workflow
6. **Deployment**: Deploy to production with feature flags

---

**Verification Completed By**: _________________

**Date**: _________________

**Issues Found**: _________________

**Status**: [ ] Passed  [ ] Failed  [ ] Needs Fixes
