import { defineRailway, project, service } from "railway/iac";

export default defineRailway(() => {
  const web = service("web", {
    // No GitHub remote detected. `railway up` will upload this directory.
    build: "npm run build",
    start: "npm --prefix frontend run start",
  });

  return project("ManavstechStore", {
    resources: [web],
  });
});
