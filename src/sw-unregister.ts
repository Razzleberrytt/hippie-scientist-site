export function unregisterServiceWorkers() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        regs.forEach((registration) => registration.unregister());
      })
      .catch(() => {});
  }
}
