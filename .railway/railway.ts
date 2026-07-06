import { defineRailway, github, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  // Define persistent volume for backend sqlite db & file uploads
  const backendVolume = volume("backend-volume", {
    alerts: { usage: { "100": {}, "80": {}, "95": {} } },
    allowOnlineResize: true,
    region: "sfo",
    sizeMB: 500
  });

  // Define backend Express API service
  const backend = service("backend", {
    source: github("Manav7999/Manavstechstore", { branch: "main" }),
    root: "/backend",
    domains: ["manavstechstore-backend.railway.app"],
    env: {
      PORT: "8080",
      DATABASE_URL: "file:/app/uploads/dev.db",
      JWT_SECRET: "my-super-secret-jwt-key-12345",
      NODE_ENV: "production",
    },
    deploy: {
      startCommand: "npx prisma db push && npx prisma db seed && node dist/server.js",
    },
    volumeMounts: {
      "/app/uploads": backendVolume,
    },
  });

  // Define frontend Next.js service
  const frontend = service("frontend", {
    source: github("Manav7999/Manavstechstore", { branch: "main" }),
    root: "/frontend",
    domains: ["manavstechstore.railway.app"],
    env: {
      PORT: "3000",
      NEXT_PUBLIC_API_URL: "https://manavstechstore-backend.railway.app",
      NODE_ENV: "production",
    },
  });

  return project("manavstech-store", {
    resources: [backendVolume, backend, frontend],
  });
});
