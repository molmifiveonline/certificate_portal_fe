const fs = require('fs');
const path = require('path');
const appJsPath = path.join('d:', 'molmi-rajjubhai', 'certificate_portal_fe', 'src', 'App.js');
let content = fs.readFileSync(appJsPath, 'utf8');

const retryLogic = `const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed && error.name === 'ChunkLoadError') {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });`;

content = content.replace('const Login = lazy', retryLogic + '\n\nconst Login = lazy');
content = content.replace(/lazy\(\(\) =>/g, 'lazyWithRetry(() =>');
content = content.replace('const lazyWithRetry = (componentImport) =>\n  lazyWithRetry(async () => {', 'const lazyWithRetry = (componentImport) =>\n  lazy(async () => {');

fs.writeFileSync(appJsPath, content);
console.log('App.js updated successfully.');
