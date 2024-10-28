import * as React from "react";
import { redirect } from "next/navigation";

import { getCachedUser } from "~/lib/queries/user";

interface DashboardStoreLayoutProps {
  params: Promise<{
    storeId: string;
  }>;
  children: React.ReactNode;
}

export default async function DashboardStoreLayout({
  children,
  params,
}: DashboardStoreLayoutProps) {
  // Await params to handle the asynchronous nature
  const { storeId } = await params;
  const decodedStoreId = decodeURIComponent(storeId);

  // Get the cached user and redirect if not found
  const user = await getCachedUser();
  if (!user) {
    return redirect("/signin");
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 overflow-hidden px-6 pt-6">{children}</main>
    </div>
  );
}
