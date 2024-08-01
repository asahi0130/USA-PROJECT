export type {};

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("push", async (event) => {
  try {
    console.log("PUSH", { event });
    const data = await event.data?.json();
    event?.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/images/logo.png",
      })
    );
  } catch (error) {
    console.error("PUSH ERROR", { error });
  }
});
