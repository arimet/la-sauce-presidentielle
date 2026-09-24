// BASE_URL is "/" locally and "/<repo>" on GitHub Pages without a custom domain.
export const url = (path: string) => import.meta.env.BASE_URL.replace(/\/$/, '') + path;
