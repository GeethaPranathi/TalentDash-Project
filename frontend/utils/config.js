const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== "undefined") {
    // If we're on localhost, use the local backend port
    if (window.location.hostname === "localhost") {
      return "http://localhost:5000";
    }
    // If we're on Vercel, use the services route prefix
    return window.location.origin + "/_/backend";
  }
  
  return "http://localhost:5000";
};

export const API_URL = getApiUrl();
