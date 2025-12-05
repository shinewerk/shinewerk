export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1) API-Endpoint für Reviews
    if (url.pathname === "/reviews") {
      return handleReviews(request, env);
    }

    // 2) Standard: Statische Assets (HTML, Bilder, CSS, JS)
      try {
        return await env.ASSETS.fetch(request);
      } catch (err) {
        return await env.ASSETS.fetch(
          new Request(url.origin + "/index.html", request)
        );
      }
  }
};

async function handleReviews(request, env) {
  // Google Places Details API aufrufen
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
      // CORS, falls du später Subdomains / andere Origins nutzt:
      "Access-Control-Allow-Origin": "*"
    }
  });
}
