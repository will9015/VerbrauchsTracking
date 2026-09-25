// Vercel-Funktion: /api/sprit?plz=01067&type=e5
// Liefert den Durchschnittspreis im Umkreis der PLZ (Daten: Tankerkönig / MTS-K, CC BY 4.0).
// Benötigt die Umgebungsvariable TANKERKOENIG_KEY.

const TYPES = new Set(["e5", "e10", "diesel"]);

module.exports = async (req, res) => {
  const plz = String(req.query.plz || "").trim();
  const type = String(req.query.type || "e5").toLowerCase();
  const key = process.env.TANKERKOENIG_KEY;

  const send = (status, body, cache) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", cache || "no-store");
    res.status(status).send(JSON.stringify(body));
  };

  if (!/^\d{5}$/.test(plz)) return send(400, { error: "Bitte eine fünfstellige Postleitzahl angeben." });
  if (!TYPES.has(type)) return send(400, { error: "Unbekannte Spritsorte." });
  if (!key) return send(500, { error: "TANKERKOENIG_KEY ist in Vercel nicht gesetzt." });

  try {
    // 1) PLZ in Koordinaten umwandeln (OpenStreetMap Nominatim)
    const geo = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${plz}&country=de&format=json&limit=1`,
      { headers: { "User-Agent": "Ladelog-PWA/1.0", "Accept-Language": "de" } }
    ).then((r) => r.json());
    if (!Array.isArray(geo) || !geo.length) return send(404, { error: "Postleitzahl nicht gefunden." });
    const lat = Number(geo[0].lat).toFixed(3), lng = Number(geo[0].lon).toFixed(3);
    const place = String(geo[0].display_name || "").split(",")[0].trim();

    // 2) Tankstellen im Umkreis abfragen, bei zu wenigen Treffern Radius vergrößern
    let prices = [];
    for (const rad of [10, 25]) {
      const url = `https://creativecommons.tankerkoenig.de/json/list.php?lat=${lat}&lng=${lng}&rad=${rad}&sort=dist&type=all&apikey=${key}`;
      const data = await fetch(url).then((r) => r.json());
      if (!data.ok) return send(502, { error: data.message || "Tankerkönig hat die Anfrage abgelehnt." });
      prices = (data.stations || []).map((s) => s[type]).filter((p) => typeof p === "number" && p > 0.5 && p < 5);
      if (prices.length >= 3) break;
    }
    if (!prices.length) return send(404, { error: "Keine Preise im Umkreis gefunden." });

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return send(200, {
      plz, place, type,
      price: Math.round(avg * 1000) / 1000,
      stations: prices.length,
      time: new Date().toISOString(),
      source: "Tankerkönig / MTS-K, CC BY 4.0",
    }, "public, s-maxage=3600, stale-while-revalidate=7200");
  } catch (e) {
    return send(502, { error: "Preisabfrage fehlgeschlagen." });
  }
};
