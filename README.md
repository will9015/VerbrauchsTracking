# Ladelog (PWA)

## Online stellen (Vercel)
1. Ordner in ein GitHub-Repo pushen.
2. In Vercel: New Project → Repo wählen → Framework "Other" → Deploy. Kein Build nötig.

## Auf den Homescreen
- iPhone: Seite in Safari öffnen → Teilen → „Zum Home-Bildschirm“.
- Android: In Chrome öffnen → Menü → „App installieren“.

## Spritpreise online (optional)
1. Kostenlosen API-Key holen: https://creativecommons.tankerkoenig.de (Registrierung per E-Mail).
2. In Vercel: Projekt → Settings → Environment Variables → `TANKERKOENIG_KEY` = dein Key.
3. Neu deployen (Deployments → … → Redeploy).
4. In der App unter Einstellungen die Postleitzahl eintragen.

Preisdaten: Tankerkönig / Markttransparenzstelle für Kraftstoffe, Lizenz CC BY 4.0.

## Daten
Alles bleibt lokal auf dem Gerät. In den Einstellungen gibt es Export und Import als CSV.
Die CSV aus der Claude-Version lässt sich direkt importieren.

## Updates
Nach Änderungen an Dateien in sw.js den CACHE-Namen hochzählen (v1 → v2).
