import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, readSession } from "@/lib/admin/auth";
import { StudioApp } from "@/components/studio/StudioApp";

/** /admin: the Studio for a signed-in account; anyone else goes to the login page. */
async function Gate() {
  const me = await readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!me) redirect("/admin/login");
  return <StudioApp me={me} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-[#050507]" />}>
      <Gate />
    </Suspense>
  );
}
