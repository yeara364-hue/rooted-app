exports.handler = async function (event) {
  try {
    const params = event.queryStringParameters || {};
    const lat = parseFloat(params.lat);
    const lng = parseFloat(params.lng);
    const requestedRadius = parseInt(params.radius || "800", 10);
    const radius = Math.min(requestedRadius, 1000);

    console.log("nearby-places incoming radius:", requestedRadius, "| capped radius:", radius);
    console.log("nearby-places params — lat:", lat, "lng:", lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid lat/lng" }),
      };
    }

    const query = `
      [out:json][timeout:8];
      (
        nwr(around:${radius},${lat},${lng})["sport"="yoga"];
        nwr(around:${radius},${lat},${lng})["name"~"yoga|meditation|pilates|wellness|breathwork|sound bath", i];
        nwr(around:${radius},${lat},${lng})["leisure"="fitness_centre"];
      );
      out center tags;
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const startTime = Date.now();

    let response;
    try {
      response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "data=" + encodeURIComponent(query),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log("nearby-places fetch failed after", elapsed, "ms —", fetchErr.message);
      return {
        statusCode: 200,
        body: JSON.stringify({
          places: [],
          fallback: true,
          error: "Nearby places request timed out",
        }),
      };
    }

    clearTimeout(timeoutId);
    const elapsed = Date.now() - startTime;

    const status = response.status;
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    console.log("nearby-places response time:", elapsed, "ms | status:", status, "| content-type:", contentType);
    console.log("nearby-places raw response:", text.slice(0, 1000));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          places: [],
          fallback: true,
          error: "Nearby API did not return JSON",
          status,
          contentType,
          raw: text.slice(0, 500),
        }),
      };
    }

    const elements = Array.isArray(data.elements) ? data.elements : [];
    console.log("nearby-places raw elements from Overpass:", elements.length);

    const places = elements
      .map((el) => {
        const tags = el.tags || {};
        const placeLat = el.lat ?? el.center?.lat;
        const placeLng = el.lon ?? el.center?.lon;

        if (placeLat == null || placeLng == null) return null;

        let category = "wellness";

        if (tags.sport === "yoga") category = "yoga";
        else if (/meditation/i.test(tags.name || "")) category = "meditation";
        else if (/pilates/i.test(tags.name || "")) category = "pilates";
        else if (/breathwork/i.test(tags.name || "")) category = "breathwork";
        else if (tags.leisure === "fitness_centre") category = "fitness";

        return {
          id: `${el.type}-${el.id}`,
          name: tags.name || "Unnamed place",
          title: tags.name || "Unnamed place",
          lat: placeLat,
          lng: placeLng,
          category,
        };
      })
      .filter(Boolean)
      .filter((place) => place.name !== "Unnamed place");

    const uniquePlaces = Array.from(
      new Map(places.map((p) => [`${p.name}-${p.category}`, p])).values()
    );
    console.log("nearby-places normalized places returned:", uniquePlaces.length);

    return {
      statusCode: 200,
      body: JSON.stringify({
        places: uniquePlaces.slice(0, 20),
      }),
    };
  } catch (error) {
    console.error("nearby-places error:", error);

    return {
      statusCode: 200,
      body: JSON.stringify({
        places: [],
        fallback: true,
        error: error.message || "Failed to fetch nearby places",
      }),
    };
  }
};
