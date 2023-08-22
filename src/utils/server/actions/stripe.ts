"use server";

import { currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { type z } from "zod";

import { db } from "~/data/db/drizzle";
import { payments, stores } from "~/data/db/schema";
import type {
  createAccountLinkSchema,
  manageSubscriptionSchema
} from "~/data/zod/stripe";
import { absoluteUrl } from "~/utils/server/fmt";
import { stripe } from "~/utils/server/stripe";

// For managing stripe subscriptions for a user
export async function manageSubscriptionAction(
  input: z.infer<typeof manageSubscriptionSchema>
) {
  const billingUrl = absoluteUrl("/dashboard/billing");

  const user = await currentUser();

  if (!user) {
    throw new Error("User not found.");
  }

  const email =
    user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  // If the user is already subscribed to a plan, we redirect them to the Stripe billing portal
  if (input.isSubscribed && input.stripeCustomerId && input.isCurrentPlan) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: input.stripeCustomerId,
      return_url: billingUrl
    });

    return {
      url: stripeSession.url
    };
  }

  // If the user is not subscribed to a plan, we create a Stripe Checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: billingUrl,
    cancel_url: billingUrl,
    payment_method_types: ["card"],
    mode: "subscription",
    billing_address_collection: "auto",
    customer_email: email,
    line_items: [
      {
        price: input.stripePriceId,
        quantity: 1
      }
    ],
    metadata: {
      userId: user.id
    }
  });

  return {
    url: stripeSession.url
  };
}

export async function getStripeAccountAction(
  input: z.infer<typeof createAccountLinkSchema>
) {
  const nullReturn = {
    isConnected: false,
    account: null,
    payment: null
  };

  const store = await db.query.stores.findFirst({
    where: eq(stores.id, input.storeId)
  });

  if (!store) return nullReturn;

  const payment = await db.query.payments.findFirst({
    where: eq(payments.storeId, input.storeId),
    columns: {
      stripeAccountId: true,
      detailsSubmitted: true
    }
  });

  if (!payment || !payment.stripeAccountId) return nullReturn;

  const account = await stripe.accounts.retrieve(payment.stripeAccountId);

  if (!account) return nullReturn;

  // If the account details have been submitted, we update the store and payment records
  if (account.details_submitted && !payment.detailsSubmitted) {
    await db.transaction(async (tx) => {
      await tx
        .update(payments)
        .set({
          detailsSubmitted: account.details_submitted,
          stripeAccountCreatedAt: account.created
        })
        .where(eq(payments.storeId, input.storeId));

      await tx
        .update(stores)
        .set({
          stripeAccountId: account.id,
          active: true
        })
        .where(eq(stores.id, input.storeId));
    });
  }

  return {
    isConnected:
      account.details_submitted && payment.detailsSubmitted ? true : false,
    account,
    payment
  };
}

// For connecting a Stripe account to a store
export async function createAccountLinkAction(
  input: z.infer<typeof createAccountLinkSchema>
) {
  const { isConnected, payment } = await getStripeAccountAction(input);

  if (isConnected) {
    throw new Error("Store already connected to Stripe.");
  }

  const stripeAccountId =
    payment?.stripeAccountId ?? (await createStripeAccount());

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: absoluteUrl(`/dashboard/stores/${input.storeId}`),
    return_url: absoluteUrl(`/dashboard/stores/${input.storeId}`),
    type: "account_onboarding"
  });

  if (!accountLink?.url) {
    throw new Error("Error creating Stripe account link, please try again.");
  }

  return { url: accountLink.url };

  async function createStripeAccount(): Promise<string> {
    const account = await stripe.accounts.create({ type: "standard" });

    if (!account) {
      throw new Error("Error creating Stripe account.");
    }

    await db.insert(payments).values({
      storeId: input.storeId,
      stripeAccountId: account.id
    });

    return account.id;
  }
}
