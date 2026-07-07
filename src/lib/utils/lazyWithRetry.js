import { lazy } from "react";

const isStaleChunkError = (error) => {
  if (error.name === 'ChunkLoadError') return true;
  // Webpack stale module error: "Cannot read properties of undefined (reading 'call')"
  if (
    error instanceof TypeError &&
    error.message &&
    error.message.includes("reading 'call'")
  ) return true;
  // CSS chunk load failures
  if (error.message && error.message.includes('Loading chunk')) return true;
  return false;
};

const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed && isStaleChunkError(error)) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });

export default lazyWithRetry;
