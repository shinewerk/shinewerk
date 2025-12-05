export default {
  async fetch(request) {
    const url = new URL(request.url);
    return new Response(`HOST=${url.host} PATH=${url.pathname}`, {
      headers: { "Content-Type": "text/plain" }
    });
  }
}
