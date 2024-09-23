import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getTranslations } from "next-intl/server";

import { authjs } from "~/auth/authjs";
import { clerk } from "~/auth/clerk";
import { authProvider } from "~/auth/provider";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/Navigation/PageNavMenu";
import { Shell } from "~/components/Wrappers/ShellVariants";
import { auth } from "~/server/queries/user";

export const metadata: Metadata = {
  description: "Manage the subscription",
  title: "Subscription",
};

// /dashboard/account/manage
// todo: add a link to the Stripe portal
export default async function ManageSubscriptionPage() {
  const t = await getTranslations();

  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  return (
    <Shell variant="sidebar">
      <PageHeader
        id="dashboard-manage-subscription-header"
        aria-labelledby="dashboard-manage-subscription-header-heading"
      >
        <PageHeaderHeading size="sm">
          {t("page.manageTheSubscription")}
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Manage the subscription
        </PageHeaderDescription>
      </PageHeader>
      <div>{t("page.thePageIsStillInProductionPleaseCheckBackHereLater")}</div>
    </Shell>
  );
}
