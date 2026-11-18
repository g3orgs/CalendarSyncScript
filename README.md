# 📅 Calendar Sync

A Google Apps Script for automatic synchronization of external ICS calendars with Google Calendar. This tool allows you to import read-only calendars from an authenticated ICS feed into your own Google Calendar and share it with others.

## ✨ Features

- 🔄 **Automatic synchronization** of ICS calendars
- 🔑 **UID-based updates** and deletion of managed events that have disappeared from a validated feed
- 📧 **Email notifications** about sync status
- ⏰ **Popup reminders** 24 hours and 2 hours before each event
- 🌍 **Timezone support** with daylight saving time
- 🔧 **Flexible configuration** for various use cases
- 👥 **Sharing capability** (unlike classic calendar subscriptions)

## 🚀 Advantages over classic calendar subscriptions

| Feature | Classic Subscription | Calendar Sync |
|---------|---------------------|---------------|
| Share with others | ❌ Not possible | ✅ Fully possible |
| Edit events | ❌ Not possible | ✅ Possible |
| Reminders | ❌ Not possible | ✅ Automatic |
| Customize appearance | ❌ Not possible | ✅ Fully customizable |

## 📋 Prerequisites

- Google Workspace Account
- Access to Google Apps Script
- An HTTPS ICS feed, its read token, and write access to the target Google calendar

## 🛠️ Installation

### 1. Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Rename the project (e.g., "Calendar Sync")

### 2. Insert Code

Copy the entire code from the `calenderextsync` file into the editor.

### 3. Configure settings

Keep the existing value of `CALENDAR_ID` when replacing the code in an installed project. For a new project, find the ID under **Google Calendar → Settings and sharing → Integrate calendar**.

In **Apps Script → Project Settings → Script Properties**, add these properties.

| Property | Value |
|----------|-------|
| `ICS_URL` | `https://calendar-sync.o-ab7.workers.dev/calendar.ics` |
| `ICS_READ_TOKEN` | The worker's read token, entered directly in Apps Script |

The script sends the token as a Bearer header over HTTPS and leaves redirects unfollowed. The execution log includes counts and sanitized error messages.

### 4. Enable Google Calendar access

In the Apps Script editor, add **Google Calendar API** under **Services** with the identifier `Calendar`. For a standard Google Cloud project, also enable the Google Calendar API in that Cloud project. Run `syncCalendar` once from the editor to authorize access. Existing time-driven triggers continue to call `syncCalendar`.

## 🔄 Synchronization

- The script reads and validates the full feed before accessing Google Calendar. An HTTP error, an invalid or unsupported feed, or a duplicate ICS UID stops the run.
- Existing managed events keep their Google event ID. The script creates missing UIDs and deletes managed events whose UIDs are absent from the feed after successful creates and updates.
- Events made by older versions carry no UID marker. They remain in place and can appear next to newly synced copies on the first run. Check those older entries individually before removing any.
- The supported feed contains individual timed events in UTC or `Europe/Berlin`. Floating times are interpreted as Berlin local time. A valid feed without events can contain a `VTIMEZONE` component. A componentless response stops the run.
- Google Calendar stores the two reminder overrides for the account running the sync.

## ⚙️ Configuration

| Variable | Description |
|----------|-------------|
| `STATUS_EMAIL` | Optional recipient for the sync-count summary |
| `EVENT_PREFIX` | Optional prefix for imported titles |
| `INCLUDE_TERMS`, `EXCLUDE_TERMS` | Filter creates and updates by title, description or location. Existing UIDs still in the feed are retained. |
| `ENABLE_DURATION_MODIFICATION` | Use the configured duration when true, or use the feed's `DTEND` or `DURATION` when false |
| `EVENT_DURATION_MINUTES` | Configured duration and fallback for events with only a start time. Defaults to 60 minutes. |

## 🧪 Tests

Run `node tests/calendar-sync.test.cjs` to exercise authenticated fetching, ICS parsing and calendar reconciliation with mocked Apps Script services.

## 🤝 Contributing

Improvement suggestions and bug reports are welcome! Simply create an issue or pull request.

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Google Apps Script for the platform
- ICS standard for calendar compatibility
- All contributors and testers

---

**Note:** This script is suitable for personal and commercial use. Make sure to comply with the terms of use of the ICS source. 