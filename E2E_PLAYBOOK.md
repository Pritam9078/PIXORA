# Pixora Super Admin E2E Playbook

This playbook outlines the steps required to verify the end-to-end functionality of the Pixora Super Admin Ecosystem before a full production deployment.

## Prerequisites
- A connected Supabase instance with valid credentials.
- `super_admin` role assigned to the testing user in the `profiles` table.

## Test 1: Zod Schema Validation
**Goal**: Ensure strict data integrity for core administrative modules.

**Steps**:
1. Navigate to **User Management**.
2. Click **Add User** and attempt to submit an empty form. 
   - **Expected**: Form validation errors prevent submission (e.g., "Invalid email address").
3. Fill out the form with valid data and submit.
   - **Expected**: User is added; modal closes.

**Repeat** the same validation tests for **College Management** and **Course Management**. Ensure required fields block submission when empty, and correct formats (URLs, numbers) are enforced.

## Test 2: Audit Logs & Telemetry
**Goal**: Verify that administrative actions are tracked and state changes are recorded.

**Steps**:
1. After completing Test 1 (adding a User, College, or Course), navigate to the **Audit Logs** panel.
2. Look for the recent actions (e.g., `CREATE_USER`, `CREATE_COLLEGE`).
3. Click on the log entry to expand it.
   - **Expected**: The state diff expands, showing the newly created object in the `New State` section, and `null` in the `Previous State` section.
4. Go back to User Management and **edit** the newly created user (e.g., change their full name).
5. Return to **Audit Logs**.
   - **Expected**: An `UPDATE_USER` log appears. Expanding it should display the old name in `Previous State` and the new name in `New State`.

## Test 3: System Stability & RBAC
**Goal**: Ensure `super_admin` controls are correctly isolated.

**Steps**:
1. Log in as a non-super-admin user (e.g., `student`).
   - **Expected**: Access to the Admin Layout is denied.
2. Switch back to a `super_admin` account.
3. Access the **Security & Auth** panel. Check the active sessions and general configurations.

## Test 4: Real-time Supabase Sync
**Goal**: Verify the `useSupabaseData` hook effectively subscribes to realtime updates.

**Steps**:
1. Open the **Notifications** panel in the browser.
2. Open your Supabase dashboard in another tab and manually insert a new row into the `notifications` table.
3. Return to the browser tab.
   - **Expected**: The newly inserted notification appears without requiring a manual page refresh.

## Completion
If all tests pass, the ecosystem is verified for production readiness. You may proceed with:
`npm run build`
