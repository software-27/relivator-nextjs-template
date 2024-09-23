import type { SubscriptionPlanTypes, UserSubscriptionPlan } from "~/types/plan";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckIcon } from "@radix-ui/react-icons";
import { desc, eq, sql } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

import { authjs } from "~/auth/authjs";
import { clerk } from "~/auth/clerk";
import { authProvider } from "~/auth/provider";
import { UserNotFound } from "~/components/Account/Guest/UserNotFound";
import { PlanManageForm } from "~/components/Forms/PlanManageForm";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/Navigation/PageNavMenu";
import { buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Shell } from "~/components/Wrappers/ShellVariants";
import { storeSubscriptionPlans } from "~/core/stripe/subs";
import { db } from "~/db";
import { products, stores } from "~/db/schema";
import { env } from "~/env";
import { getPlan } from "~/server/actions/deprecated/stripe/getPlan";
import {
  getDashboardRedirectPath,
  getPlanFeatures,
} from "~/server/helpers/plan";
import { auth } from "~/server/queries/user";
import { cn } from "~/utils/cn";
import { formatDate } from "~/utils/date";
import { formatPrice } from "~/utils/number";

export const metadata: Metadata = {
  description: "Manage the billing and subscription",
  title: "Billing",
};

export default async function BillingPage() {
  const t = await getTranslations();

  const user = await auth();

  if (!user) {
    return <UserNotFound />;
  }

  // @ts-expect-error TODO: Fix ts
  const userPlanInfo = await getPlan(user.id || "");

  const allStores = await db
    .select({
      id: stores.id,
      name: stores.name,
      description: stores.description,
      stripeAccountId: stores.stripeAccountId,
    })
    .from(stores)
    .leftJoin(products, eq(products.storeId, stores.id))
    .groupBy(stores.id)
    .orderBy(desc(stores.stripeAccountId), desc(sql`count(*)`))
    .where(eq(stores.userId, user.id));

  // @ts-expect-error TODO: Fix ts
  const subscriptionPlan = await getPlan(user.id || "");

  const { maxProductCount, maxStoreCount } = getPlanFeatures(
    // @ts-expect-error TODO: Fix ts
    (subscriptionPlan && subscriptionPlan.id) || undefined,
  );

  return (
    <Shell as="div" variant="sidebar">
      <PageHeader
        id="billing-header"
        aria-labelledby="billing-header-heading"
        separated
      >
        <div className="flex space-x-4">
          <PageHeaderHeading size="sm">
            {t("example.billing")}
          </PageHeaderHeading>
          <Link
            className={cn(
              buttonVariants({
                size: "sm",
              }),
            )}
            aria-label="Create store"
            href={getDashboardRedirectPath({
              storeCount: allStores.length,
              // @ts-expect-error TODO: Fix ts
              subscriptionPlan: subscriptionPlan,
            })}
          >
            Create store
          </Link>
        </div>
        <PageHeaderDescription size="sm">
          Manage the billing and subscription
        </PageHeaderDescription>
      </PageHeader>
      <section
        id="billing-info"
        className="space-y-5"
        aria-labelledby="billing-info-heading"
      >
        <h2
          className={`
            mb-2 text-xl font-semibold

            sm:text-2xl
          `}
        >
          Subscription Plans
        </h2>
        <Card className="grid gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            the current plan is{" "}
            <span className="font-semibold">
              {/* @ts-expect-error TODO: Fix ts */}
              {(subscriptionPlan && subscriptionPlan.name) || "Starter"}
            </span>
            .{/* @ts-expect-error TODO: fix */}
            {!userPlanInfo && userPlanInfo.isSubscribed
              ? " Upgrade to create more stores and products "
              : // @ts-expect-error TODO: fix
                userPlanInfo.isCanceled
                ? " the plan will be canceled on "
                : " It renews on "}
            {userPlanInfo && userPlanInfo.stripeCurrentPeriodEnd
              ? `${formatDate(userPlanInfo.stripeCurrentPeriodEnd)}. `
              : null}
            This plan allows you to create{" "}
            <span className="font-semibold">up to {maxStoreCount} stores</span>{" "}
            and include{" "}
            <span className="font-semibold">
              up to {maxProductCount} products
            </span>{" "}
            per store.
          </p>
        </Card>
      </section>
      <section
        id="subscription-plans"
        className="space-y-5 pb-2.5"
        aria-labelledby="subscription-plans-heading"
      >
        {env.DEMO_NOTES_ENABLED === "true" && (
          <p>
            [demo-only-msg] When using buttons below {" -> "} use Stripe Test
            Card data:
            <span className="font-semibold"> 4242424242424242</span>
            <span className="font-light"> | </span>
            <span className="font-semibold">12/34</span>
            <span className="font-light"> | </span>
            <span className="font-semibold">567</span>
          </p>
        )}
        {env.NODE_ENV === "development" && (
          <p
            className={`
              text-red-700

              dark:text-red-500
            `}
          >
            [localhost-notice] Ensure you have correctly filled out the{" "}
            <span className="font-semibold">`.env`</span> file and have{" "}
            <span className="font-semibold">`pnpm stripe:listen`</span> running{" "}
            <span className="font-semibold">{t("example.beforeUsing")}</span>{" "}
            the buttons below.
            <br />
            [localhost-notice]{" "}
            <span className="font-semibold">Buttons are hidden if</span>{" "}
            NEXT_PUBLIC_APP_URL and Stripe environment variable keys are
            missing. Refer to .env.example file.
          </p>
        )}
        <div
          className={`
            grid grid-cols-1 gap-4 p-4 pt-2

            md:-ml-4 md:grid-cols-3
          `}
        >
          {storeSubscriptionPlans.map((planInfo, index) => (
            <SubscriptionPlanCard
              key={planInfo.name}
              isHighlighted={index === 1}
              isLast={index === storeSubscriptionPlans.length - 1}
              planInfo={planInfo}
              // @ts-expect-error TODO: Fix ts
              userPlanInfo={userPlanInfo}
            />
          ))}
        </div>
      </section>
    </Shell>
  );
}

type SubscriptionPlanCardProps = {
  isHighlighted: boolean;
  isLast: boolean;
  planInfo: SubscriptionPlanTypes;
  userPlanInfo: null | UserSubscriptionPlan;
};

function SubscriptionPlanCard({
  isHighlighted,
  isLast,
  planInfo,
  userPlanInfo,
}: SubscriptionPlanCardProps) {
  const pricing = formatPrice(planInfo.price, {
    currency: "USD",
  });

  const isCurrentPlan = userPlanInfo && userPlanInfo.name === planInfo.name;
  const isSubscribed = (userPlanInfo && userPlanInfo.isSubscribed) || false;

  return (
    <div
      className={cn(
        `
          mb-4 flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-6
          shadow-lg

          dark:border-zinc-800 dark:bg-zinc-950
        `,
        {
          "border-primary shadow-md": isHighlighted,
          "lg:col-span-2 xl:col-span-1": isLast,
        },
      )}
    >
      <h2
        className={`
          mb-2 line-clamp-1 text-lg font-semibold text-zinc-900

          dark:text-white
        `}
      >
        {planInfo.name}
      </h2>
      <p
        className={`
          mb-4 text-lg font-semibold text-zinc-800

          dark:text-zinc-300
        `}
      >
        {pricing}
        <span className="text-sm font-normal text-muted-foreground">
          /month
        </span>
      </p>
      <div
        className={`
          line-clamp-2 text-zinc-800

          dark:text-zinc-300
        `}
      >
        {planInfo.description}
      </div>
      <Separator className="my-6" />
      <ul className="mb-6 grow">
        {planInfo.features.map((feature) => (
          <li
            key={feature}
            className={`
              flex items-center gap-2 text-zinc-600

              dark:text-zinc-400
            `}
          >
            <CheckIcon className="size-4" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      {env.NEXT_PUBLIC_APP_URL &&
        env.STRIPE_SECRET_KEY &&
        env.STRIPE_WEBHOOK_SIGNING_SECRET &&
        env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
        (env.STRIPE_PROFESSIONAL_SUBSCRIPTION_PRICE_ID ||
          env.STRIPE_ENTERPRISE_SUBSCRIPTION_PRICE_ID) && (
          <PlanManageForm
            isCurrentPlan={isCurrentPlan || false}
            isSubscribed={isSubscribed}
            mapPlanId={planInfo.id}
            stripeCustomerId={userPlanInfo && userPlanInfo.stripeCustomerId}
            stripePriceId={planInfo.stripePriceId}
            stripeSubscriptionId={
              userPlanInfo && userPlanInfo.stripeSubscriptionId
            }
          />
        )}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="opacity-50 mt-6 text-sm space-y-2">
          <h2 className="font-semibold">{t("example.localhostDebug")}</h2>
          <p>mapPlanId: {planInfo.id}</p>
          <p>isCurrentPlan: {String(isCurrentPlan)}</p>
          <p>isSubscribed: {String(isSubscribed)}</p>
          <p>stripeCustomerId: {userPlanInfo?.stripeCustomerId}</p>
          <p>stripePriceId: {planInfo.stripePriceId}</p>
          <p>stripeSubscriptionId: {userPlanInfo?.stripeSubscriptionId}</p>
        </div>
      )} */}
    </div>
  );
}
