export const isDevelopmentEnv = () => {
  return import.meta.env.VITE_APP_ENV === "development";
}