/* Quick Park – one tap to Google Maps */
(function () {
  const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
  const RADII = [800, 1200, 1600, 2000]; // meters, progressive expand
  const BTN = document.getElementById("findParking");

  function setLoading(loading) {
    if (loading) {
      BTN.disabled = true;
      BTN.dataset.label = BTN.textContent;
      BTN.textContent = "…";
    } else {
      BTN.disabled = false;
      BTN.textContent = BTN.dataset.label || "🅿️";
    }
  }

  function buildOverpassQuery(lat, lng, radius) {
    return `
[out:json][timeout:25];
(
  node(around:${radius}, ${lat}, ${lng})["amenity"="parking"]["fee"!="yes"];
  way(around:${radius}, ${lat}, ${lng})["amenity"="parking"]["fee"!="yes"];
);
out center 100;
`;
  }

  async function fetchPlaces(lat, lng, radius) {
    const query = buildOverpassQuery(lat, lng, radius);
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: new URLSearchParams({ data: query }).toString(),
    });
    if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);
    const data = await res.json();
    return (data && data.elements) || [];
  }

  function distMeters(aLat, aLng, bLat, bLng) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s1 = Math.sin(dLat / 2);
    const s2 = Math.sin(dLng / 2);
    const aa = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  }

  function pickClosest(elements, lat, lng) {
    let best = null;
    for (const el of elements) {
      const tags = el.tags || {};
      if (tags.amenity !== "parking" || tags.fee === "yes") continue;
      let pLat, pLng;
      if (el.type === "node") {
        pLat = el.lat; pLng = el.lon;
      } else if (el.center) {
        pLat = el.center.lat; pLng = el.center.lon;
      }
      if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) continue;
      const d = distMeters(lat, lng, pLat, pLng);
      if (!best || d < best.d) best = { d, lat: pLat, lng: pLng, name: tags.name || "Free Parking" };
    }
    return best;
  }

  function openGoogleMaps(dest) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=driving`;
    window.location.href = url; // triggers app if installed via universal link
  }

  async function locateAndGo() {
    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported. Please enable location or try another browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        let chosen = null;
        for (const r of RADII) {
          const list = await fetchPlaces(latitude, longitude, r);
          chosen = pickClosest(list, latitude, longitude);
          if (chosen) break;
        }
        if (!chosen) {
          alert("No free parking found nearby. Please try again later or move to another location.");
        } else {
          openGoogleMaps(chosen);
        }
      } catch (e) {
        console.error(e);
        alert("Search failed. Please try again later.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.warn("Geolocation failed", err);
      setLoading(false);
      alert("Unable to get your location. Please allow location access in your browser.");
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
  }

  BTN.addEventListener("click", locateAndGo);
})();
