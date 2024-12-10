"use client";

import { Elements } from "@stripe/react-stripe-js";
import { type StripeElementsOptions } from "@stripe/stripe-js";
import * as React from "react";

import { getStripe } from "~/server/get-stripe";
import { cn } from "~/server/utils";

/**
 * See the Stripe documentation for more information:
 * @see https://stripe.com/docs/payments/quickstart
 */

type CheckoutShellProps = {
  storeStripeAccountId: string;
  paymentIntentPromise: Promise<{
    data: {
      clientSecret: string | null;
    } | null;
    error: string | null;
  }>;
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

export function CheckoutShell({
  children,
  storeStripeAccountId,
  paymentIntentPromise,
  className,
  ...props
}: CheckoutShellProps) {
  const stripePromise = React.useMemo(
    () => getStripe(storeStripeAccountId),
    [storeStripeAccountId],
  );

  /**
   * Calling createPaymentIntentAction at the client component to avoid stripe authentication error in server action
   */
  const { data, error } = React.use(paymentIntentPromise);

  if (!data?.clientSecret || error) {
    return (
      <section className={cn("size-full", className)} {...props}>
        <div className="size-full bg-white" />
      </section>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret: data.clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <section className={cn("size-full", className)} {...props}>
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    </section>
  );
}
