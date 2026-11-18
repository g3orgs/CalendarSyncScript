# 📅 Kalender-Sync

Ein Google Apps Script zur automatischen Synchronisation von externen ICS-Kalendern mit Google Kalender. Dieses Tool ermöglicht es, read-only Kalender aus einem geschützten ICS-Feed in einen eigenen Google Kalender zu importieren und diesen anderen Personen freizugeben.

## ✨ Features

- 🔄 **Automatische Synchronisation** von ICS-Kalendern
- 🔑 **Abgleich per ICS-UID** mit gezielten Aktualisierungen und Löschungen
- 📧 **E-Mail-Benachrichtigungen** über Sync-Status
- ⏰ **Popup-Erinnerungen** 24 Stunden und 2 Stunden vor dem Termin
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
- HTTPS-ICS-Feed mit Lesetoken und Schreibzugriff auf den Zielkalender

## 🛠️ Installation

### 1. Google Apps Script erstellen

1. Gehe zu [script.google.com](https://script.google.com)
2. Klicke auf "Neues Projekt"
3. Benenne das Projekt um (z.B. "Kalender-Sync")

### 2. Code einfügen

Kopiere den gesamten Code aus der Datei `calenderextsync` in den Editor.

### 3. Konfiguration anpassen

Übernimm bei einem bestehenden Script den bisherigen Wert von `CALENDAR_ID`. Bei einer Neuinstallation findest du ihn in **Google Kalender → Einstellungen und Freigabe → Kalender integrieren**.

Lege in **Apps Script → Projekteinstellungen → Skripteigenschaften** diese Eigenschaften an.

| Eigenschaft | Wert |
|-------------|------|
| `ICS_URL` | `https://calendar-sync.o-ab7.workers.dev/calendar.ics` |
| `ICS_READ_TOKEN` | Lesetoken des Workers, direkt in Apps Script hinterlegen |

Das Script sendet den Token als Bearer-Header über HTTPS. Es folgt keinen Weiterleitungen. Das Ausführungsprotokoll enthält Zähler und allgemeine Fehlermeldungen.

### 4. Zugriff auf Google Kalender aktivieren

Füge im Apps-Script-Editor unter **Dienste** die **Google Calendar API** mit dem Bezeichner `Calendar` hinzu. Bei einem eigenen Google-Cloud-Projekt muss die Google Calendar API auch dort aktiviert werden. Führe `syncCalendar` einmal im Editor aus, um den Zugriff zu autorisieren. Bestehende zeitgesteuerte Trigger rufen weiterhin `syncCalendar` auf.

## 🔄 Synchronisierung

- Das Script ruft den vollständigen Feed ab und prüft ihn, bevor es auf Google Kalender zugreift. Bei einem HTTP-Fehler, einem ungültigen oder nicht unterstützten Feed oder doppelten ICS-UIDs endet der Lauf.
- Aktualisierte Termine behalten ihre Google-Termin-ID. Neue UIDs werden angelegt. Nach erfolgreichen Aktualisierungen und Neuanlagen löscht das Script verwaltete Termine, deren UID im Feed fehlt.
- Einträge aus älteren Script-Versionen haben keine gespeicherte ICS-UID. Sie bleiben erhalten und können beim ersten Lauf neben den neu synchronisierten Terminen erscheinen. Prüfe diese Alttermine einzeln vor dem Entfernen.
- Der unterstützte Feed enthält Einzeltermine mit Uhrzeit in UTC oder `Europe/Berlin`. Uhrzeiten ohne Zeitzonenangabe gelten als Berliner Ortszeit. Ein gültiger Feed ohne Termine kann eine `VTIMEZONE` enthalten. Eine Antwort ohne Kalenderkomponente bricht den Lauf ab.
- Google Kalender speichert die beiden Popup-Erinnerungen für das Konto, das den Abgleich ausführt.

## ⚙️ Konfiguration

| Variable | Beschreibung |
|----------|--------------|
| `STATUS_EMAIL` | Optionaler Empfänger für die Zusammenfassung der Synchronisierung |
| `EVENT_PREFIX` | Optionales Präfix für importierte Titel |
| `INCLUDE_TERMS`, `EXCLUDE_TERMS` | Filtern Neuanlagen und Aktualisierungen nach Titel, Beschreibung oder Ort. Vorhandene UIDs aus dem Feed bleiben erhalten. |
| `ENABLE_DURATION_MODIFICATION` | Bei `true` die konfigurierte Dauer verwenden, bei `false` das `DTEND` oder `DURATION` aus dem Feed übernehmen |
| `EVENT_DURATION_MINUTES` | Konfigurierte Dauer und Ersatzdauer für Termine mit reiner Startzeit. Vorgabe sind 60 Minuten. |

## 🧪 Tests

Mit `node tests/calendar-sync.test.cjs` lassen sich der authentifizierte Abruf, das ICS-Parsing und der Kalenderabgleich mit simulierten Apps-Script-Diensten prüfen.

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