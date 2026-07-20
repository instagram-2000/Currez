# Appointment Filtering — Past, Today & Upcoming

## Overview
Added date-based categorization to the appointments page so staff can quickly switch between **Past**, **Today**, and **Upcoming** views instead of scrolling a single flat list.

## Files Changed

### 1. `src/utils/appointmentFilters.js` (new)
Utility that groups appointments into three buckets:

| Bucket | Date Range | Sort Order |
|---|---|---|
| **Past** | yesterday back to 7 days ago (excludes today, excludes anything older than 7 days) | descending by date+time (most recent first) |
| **Today** | the current calendar date only | ascending by time |
| **Upcoming** | tomorrow up to 7 days ahead | ascending by date+time |

The comparison uses `YYYY-MM-DD` strings so timezone offsets don't matter — calendar date is all that counts.

### 2. `src/pages/hospitalAdmin/AppointmentsPage.jsx`
- Imports `TABS`, `TAB_TODAY`, and `categorizeAppointments` from the new utility
- Added `activeTab` state (defaults to `"today"`)
- Added a `categorized` memo that runs `categorizeAppointments(visible)` — where `visible` is the already-role-filtered and search-filtered list
- Added a **pill-style tab bar** between the search input and the table (Past | Today | Upcoming)
- Table rows now render from `categorized[activeTab]` instead of the raw `visible` array
- Empty-state message shows which tab is active (e.g. "No past appointments found.")

## How It Works
1. `subscribeAppointments` fetches **all** hospital appointments (unchanged)
2. `visible` memo applies role filtering (doctor sees only their own) and text search
3. `categorizeAppointments` splits `visible` into the three date buckets
4. The active tab controls which bucket renders in the table — no additional Firestore queries
5. Search still works across all appointments regardless of which tab is active
