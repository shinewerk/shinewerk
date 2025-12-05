export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.host;
    const pathname = url.pathname;

    // 1) API-Endpoint für Reviews
    if (pathname === "/reviews") {
      return handleReviews(request, env);
    }

    // 2) Subdomain → Redirect auf passende HTML-Datei

    // corporate.shinewerk.de → /corporate.html
    if (
      host === "corporate.shinewerk.de" &&
      (pathname === "/" || pathname === "/index.html")
    ) {
      return Response.redirect(
        "https://corporate.shinewerk.de/corporate.html",
        302
      );
    }

    // exclusive.shinewerk.de → /exclusive.html
    if (
      host === "exclusive.shinewerk.de" &&
      (pathname === "/" || pathname === "/index.html")
    ) {
      return Response.redirect(
        "https://exclusive.shinewerk.de/exclusive.html",
        302
      );
    }

    // 3) Standard: statische Assets + Root-Domain-Fallback
    try {
      return await env.ASSETS.fetch(request);
    } catch (err) {
      if (host === "shinewerk.de") {
        return await env.ASSETS.fetch(
          new Request(new URL("/index.html", request.url), request)
        );
      }
      return new Response("Not found", { status: 404 });
    }
  }
};

async function handleReviews(request, env) {
  const apiUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );

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
