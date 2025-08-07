# 📅 Calendar Sync

A Google Apps Script for automatic synchronization of external ICS calendars with Google Calendar. This tool allows you to import read-only calendars from any ICS source into your own Google Calendar and share it with others.

## ✨ Features

- 🔄 **Automatic synchronization** of ICS calendars
- 🗑️ **Smart deletion** of old events before reloading
- 📧 **Email notifications** about sync status
- ⏰ **Automatic reminders** (30 minutes before event)
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
- ICS URL of an external calendar source

## 🛠️ Installation

### 1. Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Rename the project (e.g., "Calendar Sync")

### 2. Insert Code

Copy the entire code from the `calenderextsync` file into the editor.

### 3. Configure Settings

Edit the configuration constants at the beginning of the script:

```javascript
const CALENDAR_ID = "your_calendar_id@group.calendar.google.com";
const ICS_URL = "https://example.com/calendar.ics";
const STATUS_EMAIL = "your-email@domain.com";
const EVENT_PREFIX = "external";

// Event Configuration
const ENABLE_DURATION_MODIFICATION = true; // Whether to modify event duration
const EVENT_DURATION_MINUTES = 60; // Standard event duration in minutes
const ENABLE_REMINDERS = true; // Whether reminders should be activated
const REMINDER_MINUTES_BEFORE = 30; // Minutes before event for reminder
```

### 4. Find Calendar ID

1. Open Google Calendar
2. Click on the desired calendar
3. Click the three dots → "Settings and sharing"
4. Scroll down to "Integrate calendar" → "Calendar ID"

### 5. Grant Permissions

1. Click "Run" → "syncCalendar"
2. Grant the required permissions:
   - Read/write calendar
   - Send emails
   - Fetch external URLs

## ⚙️ Configuration

### Configuration Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CALENDAR_ID` | Target calendar ID | `"abc123@group.calendar.google.com"` |
| `ICS_URL` | ICS file URL | `"https://example.com/calendar.ics"` |
| `STATUS_EMAIL` | Email for status notifications | `"admin@domain.com"` |
| `EVENT_PREFIX` | Prefix for event titles | `"external"`, `"club"`, `"work"` |
| `EVENT_DURATION_MINUTES` | Standard event duration in minutes | `60`, `30`, `120` |
| `ENABLE_DURATION_MODIFICATION` | Modify event duration or use original | `true`, `false` |
| `ENABLE_REMINDERS` | Enable/disable reminders | `true`, `false` |
| `REMINDER_MINUTES_BEFORE` | Minutes before event for reminder | `30`, `60`, `15` |

### Example Configurations

#### Sports Club
```javascript
const EVENT_PREFIX = "sportsclub";
const ICS_URL = "https://sportsclub.com/schedule.ics";
```

#### Choir
```javascript
const EVENT_PREFIX = "choir";
const ICS_URL = "https://choir-website.com/events.ics";
```

#### Work Calendar
```javascript
const EVENT_PREFIX = "work";
const ICS_URL = "https://company.com/vacation.ics";
```

## 🔄 Automation

### Set up time-based triggers

1. Click on the clock icon (Triggers)
2. "Add trigger"
3. Configure:
   - **Function:** `syncCalendar`
   - **Source:** Time-driven
   - **Time-based trigger:** Daily, weekly, or hourly
   - **Time:** Choose a suitable time (e.g., 06:00)

### Recommended trigger settings

| Application | Frequency | Recommended Time |
|-------------|-----------|------------------|
| Sports Club | Daily | 06:00 |
| Choir | Weekly | Sunday 10:00 |
| Work Calendar | Hourly | Every hour |

## 📧 Email Notifications

The script sends a status email after each synchronization with:

- Total number of events in the period
- Number of deleted events
- Number of added events

### Example Email
```
Hello,

The external calendar sync has been completed.

- Total events in period: 45
- Deleted events (external): 12
- Added events: 15

Best regards,
Your Sync Script
```

## 🔧 Customization

### Configure Event Duration

#### Enable/disable duration modification
```javascript
const ENABLE_DURATION_MODIFICATION = true; // All events have the same duration
const ENABLE_DURATION_MODIFICATION = false; // Use original duration from ICS
```

**When to use which setting?**
- **`true`**: When all events should have the same duration (e.g., all meetings 1 hour)
- **`false`**: When original event durations from the ICS file should be preserved

#### Change event duration (only if ENABLE_DURATION_MODIFICATION = true)
```javascript
const EVENT_DURATION_MINUTES = 60; // 1 hour
const EVENT_DURATION_MINUTES = 30; // 30 minutes
const EVENT_DURATION_MINUTES = 120; // 2 hours
const EVENT_DURATION_MINUTES = 90; // 1.5 hours
```

### Configure Reminders

#### Enable/disable reminders
```javascript
const ENABLE_REMINDERS = true; // Reminders activated
const ENABLE_REMINDERS = false; // No reminders
```

#### Adjust reminder time
```javascript
const REMINDER_MINUTES_BEFORE = 30; // 30 minutes before
const REMINDER_MINUTES_BEFORE = 60; // 1 hour before
const REMINDER_MINUTES_BEFORE = 15; // 15 minutes before
const REMINDER_MINUTES_BEFORE = 1440; // 1 day before (24h * 60min)
```

### Example Configurations

#### Preserve original event durations
```javascript
const ENABLE_DURATION_MODIFICATION = false; // Use original duration
const ENABLE_REMINDERS = true;
const REMINDER_MINUTES_BEFORE = 30;
```

#### Short events without reminders
```javascript
const ENABLE_DURATION_MODIFICATION = true;
const EVENT_DURATION_MINUTES = 30;
const ENABLE_REMINDERS = false;
```

#### Long events with early reminder
```javascript
const ENABLE_DURATION_MODIFICATION = true;
const EVENT_DURATION_MINUTES = 180; // 3 hours
const ENABLE_REMINDERS = true;
const REMINDER_MINUTES_BEFORE = 60; // 1 hour before
```

#### All-day events with day advance
```javascript
const ENABLE_DURATION_MODIFICATION = true;
const EVENT_DURATION_MINUTES = 480; // 8 hours
const ENABLE_REMINDERS = true;
const REMINDER_MINUTES_BEFORE = 1440; // 1 day before
```

## 🐛 Troubleshooting

### Common Issues

#### "Calendar not found"
- Check the `CALENDAR_ID`
- Make sure you have access to the calendar

#### "ICS URL not reachable"
- Check the `ICS_URL`
- Test the URL in browser
- Make sure the URL is publicly accessible

#### "Missing permissions"
- Run the script manually
- Grant all required permissions

### Debugging

Enable logging in Google Apps Script:

1. Click "Run" → "syncCalendar"
2. Click "View execution log"
3. Check the log outputs

## 📝 Logs

The script creates detailed logs:

```
❌ Calendar not found.
  Event deleted: external Training
  Event deleted: external Game
✅ 15 events added.
```

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