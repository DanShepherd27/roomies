import AdminPageClient from "@/components/AdminPageClient";

export default function AdminPage() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV;
  const deploymentVersion = commitSha || process.env.NEXT_PUBLIC_APP_VERSION || "local";

  return (
    <AdminPageClient
      deploymentVersion={deploymentVersion}
      environment={environment}
    />
  );
}
