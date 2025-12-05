export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.host;

    // API Endpoint bleibt unverändert
    if (url.pathname === "/reviews") {
      return handleReviews(request, env);
    }

    // Host → HTML Datei
    let htmlFile = "/index.html";

    if (host === "corporate.shinewerk.de") {
      htmlFile = "/corporate.html";
    }

    if (host === "exclusive.shinewerk.de") {
      htmlFile = "/exclusive.html";
    }

    try {
      // gewünschte Datei abrufen
      return await env.ASSETS.fetch(
        new Request(url.origin + htmlFile, request)
      );
    } catch (err) {
      // fallback auf index.html
      return await env.ASSETS.fetch(
        new Request(url.origin + "/index.html", request)
      );
    }
  }
};

async function handleReviews(request, env) {
  const apiUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json");

  apiUrl.searchParams.set("place_id", env.GOOGLE_PLACE_ID);
  apiUrl.searchParams.set("fields", "rating,user_ratings_total,reviews");
  apiUrl.searchParams.set("key", env.GOOGLE_API_KEY);
  apiUrl.searchParams.set("language", "de");

  const googleResp = await fetch(apiUrl.toString());
  if (!googleResp.ok) {
    return new Response(JSON.stringify({ error: "google_api_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const data = await googleResp.json();
  const result = data.result || {};

  const simplified = {
    rating: result.rating,
    total: result.user_ratings_total,
    reviews: (result.reviews || []).map((r) => ({
      author_name: r.author_name,
      rating: r.rating,
      text: r.text,
      relative_time: r.relative_time_description
    }))
  };

  return new Response(JSON.stringify(simplified), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
