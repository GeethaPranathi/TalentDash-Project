const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    // If we're in the browser on Vercel, the backend is at /_/backend
    return window.location.origin + "/_/backend";
  }
  return "http://localhost:5000";
};

export const API_URL = getApiUrl();
