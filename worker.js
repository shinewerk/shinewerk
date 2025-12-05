export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      // Statische Assets (index.html, Bilder etc.) ausliefern
      return await env.ASSETS.fetch(request);
    } catch (err) {
      // Fallback: immer index.html zurückgeben (für /irgend-eine-route)
      return await env.ASSETS.fetch(
        new Request(url.origin + "/index.html", request)
      );
    }
  }
}
