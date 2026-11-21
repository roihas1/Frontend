/* Push handlers imported into the Workbox-generated service worker. */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Beyond The Bracket";
  const body = payload.body || "";
  const rawUrl = typeof payload.url === "string" ? payload.url : "/";
  const url = isSameOriginRelativePath(rawUrl) ? rawUrl : "/";
  const scope = self.registration.scope;

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body,
        // Absolute URLs: Android Chrome is unreliable with root-relative icon paths.
        icon: new URL("/icon-192.png", scope).href,
        badge: new URL("/icon-192.png", scope).href,
        tag: payload.tag || undefined,
        renotify: Boolean(payload.tag),
        // Keep the banner until the user clicks or dismisses it (OS temporary
        // banners otherwise disappear in a few seconds with no web API timer).
        requireInteraction: true,
        silent: false,
        data: { url },
      }),
      // iOS hides the banner while the app is on screen, so open pages also get an in-app toast.
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
        for (const win of windows) {
          if (win.visibilityState === "visible") {
            win.postMessage({ type: "push", title, body, url });
          }
        }
      }),
    ]),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw =
    (event.notification.data && event.notification.data.url) || "/";
  const path = isSameOriginRelativePath(raw) ? raw : "/";
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const win of windows) {
        if (win.url === target && "focus" in win) return win.focus();
      }
      const any = windows.find((w) => "navigate" in w);
      if (any) return any.navigate(target).then((w) => (w ? w.focus() : undefined));
      return self.clients.openWindow(target);
    }),
  );
});

/** Only allow same-origin relative paths (e.g. "/", "/home"). Reject protocol-relative and absolute URLs. */
function isSameOriginRelativePath(value) {
  if (typeof value !== "string") return false;
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  try {
    return new URL(value, self.location.origin).origin === self.location.origin;
  } catch {
    return false;
  }
}
