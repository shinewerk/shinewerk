export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const host = url.host;
    const pathname = url.pathname;

    // 1) API-Endpoint für Reviews
    if (pathname === "/reviews") {
      return handleReviews(request, env);
    }

    // 2) HTML-Routing nach Host
    // Nur für die Startpfade ("/" oder "/index.html") manipulieren wir den Request,
    // Assets (CSS/JS/Bilder) bleiben unverändert.

    let rewrittenRequest = request;

    if (host === "corporate.shinewerk.de" &&
        (pathname === "/" || pathname === "/index.html")) {
      rewrittenRequest = new Request(
        new URL("/corporate.html", request.url),
        request
      );
    } else if (host === "exclusive.shinewerk.de" &&
               (pathname === "/" || pathname === "/index.html")) {
      rewrittenRequest = new Request(
        new URL("/exclusive.html", request.url),
        request
      );
    } else if (host === "shinewerk.de" &&
               (pathname === "/" || pathname === "/index.html")) {
      // Root-Domain → index.html
      rewrittenRequest = new Request(
        new URL("/index.html", request.url),
        request
      );
    }

    // 3) Standard: Statische Assets
    try {
      return await env.ASSETS.fetch(rewrittenRequest);
    } catch (err) {
      // Fallback Root
      return await env.ASSETS.fetch(
        new Request(new URL("/index.html", request.url), request)
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
