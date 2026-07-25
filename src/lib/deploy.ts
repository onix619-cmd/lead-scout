function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "site"
  );
}

// Deploys a single static HTML file directly to Vercel using their REST API.
// No GitHub repo is created for the generated site — this uses Vercel's
// direct-file-upload deployment flow. Docs: https://vercel.com/docs/rest-api
export async function deployToVercel(
  businessName: string,
  placeId: string,
  html: string
): Promise<string> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new Error("Missing VERCEL_API_TOKEN. Add it to your environment variables.");
  }

  // Suffix with part of the place ID so re-generating the same business
  // updates the same project instead of creating a new one each time.
  const projectName = `${slugify(businessName)}-${placeId.slice(-8).toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  const teamId = process.env.VERCEL_TEAM_ID; // optional, only if deploying under a team
  const url = `https://api.vercel.com/v13/deployments${teamId ? `?teamId=${teamId}` : ""}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      target: "production",
      files: [{ file: "index.html", data: html }],
      projectSettings: { framework: null },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel deploy failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  // Vercel returns the deployment host without a scheme.
  return `https://${data.url}`;
}
