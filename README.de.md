# 📅 Kalender-Sync

Ein Google Apps Script zur automatischen Synchronisation von externen ICS-Kalendern mit Google Kalender. Dieses Tool ermöglicht es, read-only Kalender von beliebigen ICS-Quellen in einen eigenen Google Kalender zu importieren und diesen anderen Personen freizugeben.

## ✨ Features

- 🔄 **Automatische Synchronisation** von ICS-Kalendern
- 🗑️ **Intelligentes Löschen** alter Events vor dem Neuladen
- 📧 **E-Mail-Benachrichtigungen** über Sync-Status
- ⏰ **Automatische Erinnerungen** (30 Minuten vor Event)
- 🌍 **Zeitzonen-Unterstützung** mit Sommer-/Winterzeit
- 🔧 **Flexible Konfiguration** für verschiedene Anwendungsfälle
- 👥 **Freigabe-Möglichkeit** (im Gegensatz zu klassischen Kalender-Einbindungen)

## 🚀 Vorteile gegenüber klassischen Kalender-Einbindungen

| Feature | Klassische Einbindung | Kalender-Sync |
|---------|----------------------|---------------|
| Freigabe an andere | ❌ Nicht möglich | ✅ Vollständig möglich |
| Bearbeitung von Events | ❌ Nicht möglich | ✅ Möglich |
| Erinnerungen | ❌ Nicht möglich | ✅ Automatisch |
| Anpassung der Darstellung | ❌ Nicht möglich | ✅ Vollständig |

## 📋 Voraussetzungen

- Google Workspace Account
- Zugriff auf Google Apps Script
- ICS-URL einer externen Kalenderquelle

## 🛠️ Installation

### 1. Google Apps Script erstellen

1. Gehe zu [script.google.com](https://script.google.com)
2. Klicke auf "Neues Projekt"
3. Benenne das Projekt um (z.B. "Kalender-Sync")

### 2. Code einfügen

Kopiere den gesamten Code aus der Datei `calenderextsync` in den Editor.

### 3. Konfiguration anpassen

Bearbeite die Konfigurationskonstanten am Anfang des Scripts:

```javascript
const CALENDAR_ID = "deine_kalender_id@group.calendar.google.com";
const ICS_URL = "https://example.com/calendar.ics";
const STATUS_EMAIL = "deine-email@domain.com";
const EVENT_PREFIX = "extern";

// Event-Konfiguration
const ENABLE_DURATION_MODIFICATION = true; // Ob die Event-Dauer modifiziert werden soll
const EVENT_DURATION_MINUTES = 60; // Standard-Dauer der Events in Minuten
const ENABLE_REMINDERS = true; // Ob Erinnerungen aktiviert werden sollen
const REMINDER_MINUTES_BEFORE = 30; // Minuten vor dem Event für die Erinnerung
```

### 4. Kalender-ID finden

1. Öffne Google Kalender
2. Klicke auf den gewünschten Kalender
3. Klicke auf die drei Punkte → "Einstellungen und Freigabe"
4. Scrolle nach unten zu "Integrieren" → "Kalender-ID"

### 5. Berechtigungen erteilen

1. Klicke auf "Ausführen" → "syncCalendar"
2. Erteile die erforderlichen Berechtigungen:
   - Kalender lesen/schreiben
   - E-Mails senden
   - Externe URLs abrufen

## ⚙️ Konfiguration

### Konfigurationsvariablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `CALENDAR_ID` | ID des Ziel-Kalenders | `"abc123@group.calendar.google.com"` |
| `ICS_URL` | URL der ICS-Datei | `"https://example.com/calendar.ics"` |
| `STATUS_EMAIL` | E-Mail für Status-Benachrichtigungen | `"admin@domain.com"` |
| `EVENT_PREFIX` | Präfix für Event-Titel | `"extern"`, `"verein"`, `"arbeit"` |
| `EVENT_DURATION_MINUTES` | Standard-Dauer der Events in Minuten | `60`, `30`, `120` |
| `ENABLE_DURATION_MODIFICATION` | Event-Dauer modifizieren oder ursprünglich verwenden | `true`, `false` |
| `ENABLE_REMINDERS` | Erinnerungen aktivieren/deaktivieren | `true`, `false` |
| `REMINDER_MINUTES_BEFORE` | Minuten vor Event für Erinnerung | `30`, `60`, `15` |

### Beispiel-Konfigurationen

#### Sportverein
```javascript
const EVENT_PREFIX = "sportverein";
const ICS_URL = "https://sportverein.de/termine.ics";
```

#### Chor
```javascript
const EVENT_PREFIX = "chor";
const ICS_URL = "https://chor-website.de/events.ics";
```

#### Arbeitskalender
```javascript
const EVENT_PREFIX = "arbeit";
const ICS_URL = "https://firma.com/urlaubsplan.ics";
```

## 🔄 Automatisierung

### Zeitbasierte Trigger einrichten

1. Klicke auf das Uhren-Symbol (Trigger)
2. "Trigger hinzufügen"
3. Konfiguriere:
   - **Funktion:** `syncCalendar`
   - **Quelle:** Zeitgesteuert
   - **Zeitbasierte Trigger:** Täglich, wöchentlich oder stündlich
   - **Zeit:** Wähle eine passende Zeit (z.B. 06:00 Uhr)

### Empfohlene Trigger-Einstellungen

| Anwendung | Häufigkeit | Empfohlene Zeit |
|-----------|------------|-----------------|
| Sportverein | Täglich | 06:00 Uhr |
| Chor | Wöchentlich | Sonntag 10:00 Uhr |
| Arbeitskalender | Stündlich | Jede Stunde |

## 📧 E-Mail-Benachrichtigungen

Das Script sendet nach jeder Synchronisation eine Status-E-Mail mit:

- Anzahl der gesamt vorhandenen Events
- Anzahl der gelöschten Events
- Anzahl der hinzugefügten Events

### Beispiel-E-Mail
```
Hallo,

Der Sync des externen Kalenders wurde durchgeführt.

- Gesamte Events im Zeitraum: 45
- Gelöschte Events (extern): 12
- Hinzugefügte Events: 15

Viele Grüße,
Dein Sync-Script
```

## 🔧 Anpassungen

### Event-Dauer konfigurieren

#### Event-Dauer-Modifikation aktivieren/deaktivieren
```javascript
const ENABLE_DURATION_MODIFICATION = true; // Alle Events haben die gleiche Dauer
const ENABLE_DURATION_MODIFICATION = false; // Ursprüngliche Dauer aus ICS verwenden
```

**Wann welche Einstellung?**
- **`true`**: Wenn alle Events die gleiche Dauer haben sollen (z.B. alle Meetings 1 Stunde)
- **`false`**: Wenn die ursprünglichen Event-Dauern aus der ICS-Datei beibehalten werden sollen

#### Event-Dauer ändern (nur wenn ENABLE_DURATION_MODIFICATION = true)
```javascript
const EVENT_DURATION_MINUTES = 60; // 1 Stunde
const EVENT_DURATION_MINUTES = 30; // 30 Minuten
const EVENT_DURATION_MINUTES = 120; // 2 Stunden
const EVENT_DURATION_MINUTES = 90; // 1,5 Stunden
```

### Erinnerungen konfigurieren

#### Erinnerungen aktivieren/deaktivieren
```javascript
const ENABLE_REMINDERS = true; // Erinnerungen aktiviert
const ENABLE_REMINDERS = false; // Keine Erinnerungen
```

#### Erinnerungszeit anpassen
```javascript
const REMINDER_MINUTES_BEFORE = 30; // 30 Minuten vorher
const REMINDER_MINUTES_BEFORE = 60; // 1 Stunde vorher
const REMINDER_MINUTES_BEFORE = 15; // 15 Minuten vorher
const REMINDER_MINUTES_BEFORE = 1440; // 1 Tag vorher (24h * 60min)
```

### Beispiel-Konfigurationen

#### Ursprüngliche Event-Dauern beibehalten
```javascript
const ENABLE_DURATION_MODIFICATION = false; // Ursprüngliche Dauer verwenden
const ENABLE_REMINDERS = true;
const REMINDER_MINUTES_BEFORE = 30;
```

#### Kurze Events ohne Erinnerungen
```javascript
const ENABLE_DURATION_MODIFICATION = true;
const EVENT_DURATION_MINUTES = 30;
const ENABLE_REMINDERS = false;
```

#### Lange Events mit früher Erinnerung
```javascript
const ENABLE_DURATION_MODIFICATION = true;
const EVENT_DURATION_MINUTES = 180; // 3 Stunden
const ENABLE_REMINDERS = true;
const REMINDER_MINUTES_BEFORE = 60; // 1 Stunde vorher
```

#### Ganztägige Events mit Tagesvorlauf
```javascript
const ENABLE_DURATION_MODIFICATION = true;
const EVENT_DURATION_MINUTES = 480; // 8 Stunden
const ENABLE_REMINDERS = true;
const REMINDER_MINUTES_BEFORE = 1440; // 1 Tag vorher
```

## 🐛 Fehlerbehebung

### Häufige Probleme

#### "Kalender nicht gefunden"
- Überprüfe die `CALENDAR_ID`
- Stelle sicher, dass du Zugriff auf den Kalender hast

#### "ICS-URL nicht erreichbar"
- Überprüfe die `ICS_URL`
- Teste die URL im Browser
- Stelle sicher, dass die URL öffentlich zugänglich ist

#### "Berechtigungen fehlen"
- Führe das Script manuell aus
- Erteile alle erforderlichen Berechtigungen

### Debugging

Aktiviere das Logging in Google Apps Script:

1. Klicke auf "Ausführen" → "syncCalendar"
2. Klicke auf "Ausführungsprotokoll anzeigen"
3. Überprüfe die Log-Ausgaben

## 📝 Logs

Das Script erstellt detaillierte Logs:

```
❌ Kalender nicht gefunden.
  Event gelöscht: extern Training
  Event gelöscht: extern Spiel
✅ 15 Events hinzugefügt.
```

## 🤝 Beitragen

Verbesserungsvorschläge und Bug-Reports sind willkommen! Erstelle einfach ein Issue oder einen Pull Request.

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- Google Apps Script für die Plattform
- ICS-Standard für die Kalender-Kompatibilität
- Alle Mitwirkenden und Tester

---

**Hinweis:** Dieses Script ist für den persönlichen und kommerziellen Gebrauch geeignet. Stelle sicher, dass du die Nutzungsbedingungen der ICS-Quelle befolgst. 