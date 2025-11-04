# Vercel Deployment Notes

- Set the `VITE_API_BASE_URL` Environment Variable in the Vercel dashboard (Project Settings → Environment Variables) to the fully qualified base URL of the backend API, e.g. `https://api.example.com/api`.
- Redeploy the project after setting the variable so the build picks up the new value.
- For local development, no change is required: the app falls back to `/api` and relies on the Vite dev server proxy.

