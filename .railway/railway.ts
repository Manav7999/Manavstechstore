import { defineRailway, github, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const Manavstechstore = github("Manav7999/Manavstechstore");

  const backendVolume = volume("backend-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "sfo", sizeMB: 500 });
  const backend = service("backend", {
    source: Manavstechstore,
    root: "/backend",
    start: "npx prisma db push && npx prisma db seed && node dist/server.js",
    replicas: 1,
    volumeMounts: {
      "/app/uploads": backendVolume,
    },
    env: {
      DATABASE_URL: preserve(),
      JWT_SECRET: preserve(),
      NODE_ENV: preserve(),
      PORT: preserve(),
    },
  });
  const frontend = service("frontend", {
    source: Manavstechstore,
    root: "/frontend",
    replicas: 1,
    env: {
      NEXT_PUBLIC_API_URL: "https://backend-production-bf0e.up.railway.app",
      NODE_ENV: preserve(),
      PORT: preserve(),
    },
  });

  return project("manavstech-store", {
    resources: [backend, frontend, backendVolume],
  });
});
