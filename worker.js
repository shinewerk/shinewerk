export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Reviews Endpoint
    if (pathname === "/reviews") {
      return handleReviews(request, env);
    }

    // 2. Versuche die Datei direkt zu laden
    let pathToFile = pathname;

    // Wenn kein Punkt im Pfad → /exclusive → exclusive.html
    if (!pathToFile.includes(".")) {
      // / → index.html
      if (pathToFile === "/") {
        pathToFile = "/index.html";
      } else {
        pathToFile = `${pathToFile}.html`;
      }
    }

    // 3. Datei versuchen aus Assets laden
    try {
      return await env.ASSETS.fetch(new Request(url.origin + pathToFile, request));
    } catch (e) {
      // 4. Wenn Datei nicht existiert → fallback: index.html
      return await env.ASSETS.fetch(
        new Request(url.origin + "/index.html", request)
      );
    }
  }
};
