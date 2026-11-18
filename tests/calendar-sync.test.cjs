const assert = require("node:assert/strict");
const fs = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const script = fs.readFileSync(join(__dirname, "..", "calenderextsync"), "utf8");
const feedUrl = "https://example.test/calendar.ics";
const fakeToken = "test-placeholder";
const zone = [
  "BEGIN:VTIMEZONE", "TZID:Europe/Berlin", "BEGIN:STANDARD",
  "DTSTART:20251026T030000", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100",
  "END:STANDARD", "END:VTIMEZONE",
].join("\r\n");

function feed(...components) {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Calendar Sync Test//EN",
    ...components, "END:VCALENDAR", ""].join("\r\n");
}

function event(uid, start = "DTSTART:20260710T080000Z", ...properties) {
  return ["BEGIN:VEVENT", `UID:${uid}`, "DTSTAMP:20260101T000000Z", start,
    "SUMMARY:Anhörung", ...properties, "END:VEVENT"].join("\r\n");
}

function managed(uid, data = {}) {
  return {
    id: `google-${uid}`,
    etag: `"etag-${uid}"`,
    extendedProperties: { private: { calendarSyncSource: "CalendarSyncScript", calendarSyncUid: uid } },
    ...data,
  };
}

function setup({ body = feed(event("uid-1")), status = 200, fetchError, pages = [[]],
  failPatch = false, filter, preserveDuration = false, lockAvailable = true, token = fakeToken } = {}) {
  const calls = [];
  const entries = pages.map(page => page.slice());
  const logs = [];
  const formatter = new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", timeZoneName: "longOffset" });

  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({
      getProperty: name => ({ ICS_URL: feedUrl, ICS_READ_TOKEN: token })[name],
    }) },
    UrlFetchApp: { fetch: (url, options) => {
      calls.push(["fetch", url, structuredClone(options)]);
      if (fetchError) throw new Error(`Transport failure ${token}`);
      return { getResponseCode: () => status, getContent: () => {
        calls.push(["body"]);
        return Buffer.from(body);
      } };
    } },
    Utilities: {
      newBlob: bytes => ({ getDataAsString: () => Buffer.from(bytes).toString("utf8") }),
      formatDate: (date, timeZone, pattern) => {
        assert.equal(timeZone, "Europe/Berlin");
        assert.equal(pattern, "Z");
        return formatter.formatToParts(date).find(part => part.type === "timeZoneName")
          .value.replace("GMT", "").replace(":", "");
      },
    },
    LockService: { getScriptLock: () => ({
      tryLock: () => lockAvailable,
      releaseLock: () => calls.push(["release"]),
    }) },
    Calendar: { Events: {
      list: (id, options) => {
        calls.push(["list", id, structuredClone(options)]);
        const index = Number(options.pageToken || 0);
        return { items: entries[index], nextPageToken: index + 1 < entries.length ? String(index + 1) : undefined };
      },
      insert: (resource, id) => {
        calls.push(["insert", structuredClone(resource), id]);
        entries[0].push(managed(resource.extendedProperties.private.calendarSyncUid, resource));
      },
      patch: (resource, id, eventId, options, headers) => {
        calls.push(["patch", structuredClone(resource), id, eventId, structuredClone(headers)]);
        if (failPatch) throw new Error(`Mock Google API error ${token}`);
        Object.assign(entries.flat().find(entry => entry.id === eventId), structuredClone(resource));
      },
      remove: (id, eventId, options, headers) => {
        calls.push(["remove", id, eventId, structuredClone(headers)]);
        for (const page of entries) {
          const index = page.findIndex(entry => entry.id === eventId);
          if (index !== -1) page.splice(index, 1);
        }
      },
    } },
    Logger: { log: message => logs.push(message) },
  });

  let configuredScript = script.replace('const CALENDAR_ID = "";', 'const CALENDAR_ID = "test-calendar";');
  if (filter) configuredScript = configuredScript.replace("const INCLUDE_TERMS = [];", `const INCLUDE_TERMS = [${JSON.stringify(filter)}];`);
  if (preserveDuration) configuredScript = configuredScript.replace("ENABLE_DURATION_MODIFICATION = true", "ENABLE_DURATION_MODIFICATION = false");
  vm.runInContext(configuredScript, context);
  return { calls, logs, sync: () => vm.runInContext("syncCalendar()", context) };
}

function assertNoCalendarCalls(calls) {
  assert.ok(calls.every(([method]) => ["fetch", "body", "release"].includes(method)));
}

for (const status of [206, 302, 401, 403, 404, 500]) {
  test(`HTTP ${status} cannot read or change Google Calendar`, () => {
    const { calls, logs, sync } = setup({ status, pages: [[managed("old")]] });
    assert.throws(sync, new RegExp(`HTTP ${status}`));
    assertNoCalendarCalls(calls);
    assert.deepEqual(calls[0], ["fetch", feedUrl, {
      headers: { Authorization: `Bearer ${fakeToken}` },
      followRedirects: false,
      muteHttpExceptions: true,
    }]);
    assert.equal(calls.some(([method]) => method === "body"), false);
    assert.deepEqual(logs, []);
  });
}

test("transport failure hides the original exception and releases the lock", () => {
  const { calls, sync } = setup({ fetchError: true });
  assert.throws(sync, { message: "Unable to fetch the ICS feed." });
  assertNoCalendarCalls(calls);
  assert.deepEqual(calls.at(-1), ["release"]);
});

test("a missing token prevents any fetch or Calendar operation", () => {
  const { calls, sync } = setup({ token: "" });
  assert.throws(sync, /Script Properties/);
  assert.deepEqual(calls, [["release"]]);
});

const invalidFeeds = [
  ["HTML with HTTP 200", "<html>Access denied</html>"],
  ["missing VCALENDAR properties", "BEGIN:VCALENDAR\nEND:VCALENDAR"],
  ["componentless VCALENDAR", feed()],
  ["truncated ICS after a complete event", feed(event("new")).replace("END:VCALENDAR", "")],
  ["invalid second event", feed(event("new"), event("bad", "DTSTART:20260230T100000Z"))],
  ["duplicate UID", feed(event("new"), event("new"))],
  ["missing UID", feed(event("new").replace("UID:new\r\n", ""))],
  ["non-UTC DTSTAMP", feed(event("new").replace("DTSTAMP:20260101T000000Z", "DTSTAMP:20260101T000000"))],
  ["partial scheduling message", feed(event("new")).replace("VERSION:2.0", "VERSION:2.0\r\nMETHOD:CANCEL")],
  ["recurrence", feed(event("new", undefined, "RRULE:FREQ=DAILY"))],
  ["unsupported TZID", feed(event("new", "DTSTART;TZID=Not/AZone:20260710T100000"))],
];

for (const [label, body] of invalidFeeds) {
  test(`invalid feed leaves the calendar untouched: ${label}`, () => {
    const { calls, sync } = setup({ body, pages: [[managed("old")]] });
    assert.throws(sync, /Invalid or unsupported ICS feed/);
    assertNoCalendarCalls(calls);
  });
}

test("unfolds UTF-8 bytes, parses escaped fields and keeps both alarms off the event description", () => {
  const input = feed(event("fol\r\n ded-id", "DTSTART;TZID=\"Europe/Berlin\":20260710T100000",
    "LOCATION:Saal 1\\, Leipzig: Eingang B",
    "DESCRIPTION;ALTREP=\"https://example.test/info\":Zeile 1\\nZeile\r\n\t 2\\; Zusatz",
    "X-AKTENZEICHEN:4 A 7/26",
    "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT24H", "DESCRIPTION:Alarm", "END:VALARM",
    "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT2H", "DESCRIPTION:Alarm", "END:VALARM"));
  const bytes = Buffer.from(input);
  const fold = bytes.indexOf(Buffer.from("ö")) + 1;
  const body = Buffer.concat([bytes.subarray(0, fold), Buffer.from("\r\n "), bytes.subarray(fold)]);
  const { calls, sync } = setup({ body });

  sync();

  const [, resource] = calls.find(([name]) => name === "insert");
  assert.equal(resource.summary, "Anhörung");
  assert.equal(resource.description, "Zeile 1\nZeile 2; Zusatz\nAktenzeichen: 4 A 7/26");
  assert.equal(resource.location, "Saal 1, Leipzig: Eingang B");
  assert.equal(resource.start.dateTime, "2026-07-10T08:00:00.000Z");
  assert.equal(resource.end.dateTime, "2026-07-10T09:00:00.000Z");
  assert.equal(resource.extendedProperties.private.calendarSyncUid, "folded-id");
  assert.deepEqual(resource.reminders, { useDefault: false, overrides: [
    { method: "popup", minutes: 1440 }, { method: "popup", minutes: 120 },
  ] });
});

test("converts winter, summer, DST overlap and DST gap while UTC stays UTC", () => {
  const cases = [
    ["TZID=Europe/Berlin:20260115T100000", "2026-01-15T09:00:00.000Z"],
    ["TZID=Europe/Berlin:20260715T100000", "2026-07-15T08:00:00.000Z"],
    ["TZID=Europe/Berlin:20260329T023000", "2026-03-29T01:30:00.000Z"],
    ["TZID=Europe/Berlin:20261025T023000", "2026-10-25T00:30:00.000Z"],
    [":20260715T100000Z", "2026-07-15T10:00:00.000Z"],
    [":20260715T100000", "2026-07-15T08:00:00.000Z"],
  ];
  const body = feed(...cases.map(([start], index) => event(
    `time-${index}`, `DTSTART${start.startsWith(":") ? "" : ";"}${start}`,
  )));
  const { sync, calls } = setup({ body });

  sync();

  assert.deepEqual(calls.filter(([name]) => name === "insert")
    .map(([, resource]) => resource.start.dateTime), cases.map(([, expected]) => expected));
});

test("keeps explicit DTEND and calendar-day durations when configured", () => {
  const body = feed(
    event("end", "DTSTART:20260328T090000Z", "DTEND:20260328T094000Z"),
    event("duration", "DTSTART;TZID=Europe/Berlin:20260328T100000", "DURATION:P1DT15M"),
  );
  const { sync, calls } = setup({ body, preserveDuration: true });

  sync();

  assert.deepEqual(calls.filter(([name]) => name === "insert").map(([, resource]) => resource.end.dateTime),
    ["2026-03-28T09:40:00.000Z", "2026-03-29T08:15:00.000Z"]);
});

test("updates by UID, creates new UIDs and deletes only missing managed UIDs after both writes", () => {
  const body = feed(event("moved", "DTSTART:20280120T084500Z", "DESCRIPTION:Termin verlegt"),
    event("new"), event("filtered", undefined, "DESCRIPTION:Unpassend").replace("SUMMARY:Anhörung", "SUMMARY:Sonstiges"));
  const pages = [
    [managed("moved", { summary: "Alter Titel", reminders: { useDefault: true, overrides: [{ method: "popup", minutes: 30 }] } })],
    [managed("gone"), managed("filtered"), { id: "manual", summary: "Anhörung" }],
  ];
  const { calls, sync } = setup({ body, pages, filter: "Anhörung" });

  sync();
  sync();

  const changes = calls.filter(([method]) => ["patch", "insert", "remove"].includes(method));
  assert.deepEqual(changes.map(([method]) => method), ["patch", "insert", "remove"]);
  assert.equal(changes[0][3], "google-moved");
  assert.deepEqual(changes[0][4], { "If-Match": '"etag-moved"' });
  assert.equal(changes[0][1].description, "Termin verlegt");
  assert.equal(changes[0][1].start.dateTime, "2028-01-20T08:45:00.000Z");
  assert.deepEqual(changes[0][1].reminders.overrides.map(reminder => reminder.minutes), [1440, 120]);
  assert.equal(changes[1][1].extendedProperties.private.calendarSyncUid, "new");
  assert.deepEqual(changes[2], ["remove", "test-calendar", "google-gone", { "If-Match": '"etag-gone"' }]);
  assert.deepEqual(calls.filter(([method]) => method === "list").map(([, , options]) => options.pageToken),
    [undefined, "1", undefined, "1"]);
  assert.deepEqual(calls.find(([method]) => method === "list")[2].privateExtendedProperty,
    ["calendarSyncSource=CalendarSyncScript"]);
});

test("failed updates skip deletions and do not report API error details", () => {
  const { calls, sync } = setup({ pages: [[managed("uid-1"), managed("gone")]], failPatch: true });

  assert.throws(sync, { message: "Google Calendar synchronization failed. Check calendar access and managed entries." });
  assert.equal(calls.some(([method]) => method === "remove"), false);
});

test("a valid calendar with a timezone and no events removes the last managed UID", () => {
  const { calls, sync } = setup({ body: feed(zone), pages: [[managed("last"), { id: "manual" }]] });

  sync();

  assert.deepEqual(calls.filter(([method]) => method === "remove"),
    [["remove", "test-calendar", "google-last", { "If-Match": '"etag-last"' }]]);
});

test("overlapping triggers do not fetch or modify the calendar", () => {
  const { calls, sync } = setup({ lockAvailable: false });
  sync();
  assert.deepEqual(calls, []);
});
