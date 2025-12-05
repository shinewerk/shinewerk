export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    const pathname = url.pathname;

    // HARDCODE TEST
    if (hostname === "corporate.shinewerk.de" && pathname === "/") {
      return new Response("CORPORATE ROOT FROM WORKER", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    if (hostname === "exclusive.shinewerk.de" && pathname === "/") {
      return new Response("EXCLUSIVE ROOT FROM WORKER", {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    }

    // alles andere wie gehabt
    if (pathname === "/reviews") {
      return handleReviews(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
