import type { Metadata } from "next";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { Shell } from "~/components/shell";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { env } from "~/env.js";

import { UserProfile } from "./_components/user-profile";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Account",
  description: "Manage your account settings",
};

export default function AccountPage() {
  return (
    <Shell variant="sidebar" className="overflow-hidden">
      <PageHeader>
        <PageHeaderHeading size="sm">Account</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Manage your account settings
        </PageHeaderDescription>
      </PageHeader>
      <ScrollArea className="w-full pb-3.5">
        <UserProfile />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Shell>
  );
}
