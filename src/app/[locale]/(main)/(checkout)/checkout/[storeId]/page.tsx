import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { siteConfig } from "~/app";
import { env } from "~/env.mjs";
import { Link } from "~/navigation";
import { cn, formatPrice } from "~/utils";
import { eq } from "drizzle-orm";

import { getCartAction } from "~/server/actions/cart";
import { db } from "~/data/db";
import { stores } from "~/data/db/schema";
import { CheckoutForm } from "~/forms/checkout-form";
import { CartLineItems } from "~/islands/checkout/cart-line-items";
import { CheckoutShell } from "~/islands/checkout/checkout-shell";
import { Button, buttonVariants } from "~/islands/primitives/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "~/islands/primitives/drawer";
import { ScrollArea } from "~/islands/primitives/scroll-area";
import { Shell } from "~/islands/wrappers/shell-variants";
import {
  createPaymentIntentAction,
  getStripeAccountAction,
} from "~/utils/stripe/actions";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Checkout",
  description: "Checkout with store items",
};

interface CheckoutPageProps {
  params: {
    storeId: string;
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const appName = siteConfig.name;
  const appUrl = siteConfig.url.base ?? "";

  const storeId = Number(params.storeId);

  const store = await db
    .select({
      id: stores.id,
      name: stores.name,
      stripeAccountId: stores.stripeAccountId,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .execute()
    .then((rows) => rows[0]);

  if (!store) {
    notFound();
  }

  const { isConnected } = await getStripeAccountAction({
    storeId,
  });

  const cartLineItems = await getCartAction(storeId);

  const paymentIntent = createPaymentIntentAction({
    storeId: store.id,
    items: cartLineItems,
  });

  const total = cartLineItems.reduce(
    (total, item) => total + item.quantity * Number(item.price),
    0,
  );

  if (!(isConnected && store.stripeAccountId)) {
    return (
      <Shell
        id="checkout-not-connected"
        aria-labelledby="checkout-not-connected-heading"
        variant="centered"
      >
        <div className="flex flex-col items-center justify-center gap-2 pt-20">
          <div className="text-center text-2xl font-bold">
            Store is not connected to Stripe
          </div>
          <div className="text-center text-muted-foreground">
            Store owner needs to connect their store to Stripe to accept
            payments
          </div>
          <Link
            aria-label="Back to cart"
            href="/cart"
            className={cn(
              buttonVariants({
                size: "sm",
              }),
            )}
          >
            Back to cart
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <section className="relative flex h-full min-h-[100dvh] flex-col items-start justify-center lg:h-[100dvh] lg:flex-row lg:overflow-hidden">
      <div className="w-full space-y-12 -mt-4 lg:mt-0 pb-8 lg:pt-16 lg:pb-0">
        <div className="fixed top-0 z-40 h-16 w-full bg-[#09090b] py-4 lg:static lg:top-auto lg:z-0 lg:h-0 lg:py-0">
          <div className="container flex max-w-xl items-center justify-between space-x-2 lg:ml-auto lg:mr-0 lg:pr-[4.5rem]">
            <Link
              aria-label="Back to cart"
              href="/cart"
              className="group flex w-28 items-center space-x-2 lg:flex-auto"
            >
              <ArrowLeftIcon
                className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
              <div className="block font-medium transition group-hover:hidden">
                {appName}
              </div>
              <div className="hidden font-medium transition group-hover:block">
                Back
              </div>
            </Link>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </DrawerTrigger>
              <DrawerContent className="flex h-[80%] flex-col space-y-5 bg-zinc-50 py-8 text-zinc-950">
                <CartLineItems
                  items={cartLineItems}
                  variant="minimal"
                  isEditable={false}
                  className="container max-w-6xl"
                />
                <div className="container flex max-w-6xl pr-6 font-medium">
                  <div className="flex-1">
                    Total (
                    {cartLineItems.reduce(
                      (acc, item) => acc + item.quantity,
                      0,
                    )}
                    )
                  </div>
                  <div>{formatPrice(total)}</div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <div className="container flex max-w-xl flex-col items-center space-y-1 lg:ml-auto lg:mr-0 lg:items-start lg:pr-[4.5rem]">
          <div className="text-sm font-semibold mb-4">
            {env.DEV_DEMO_NOTES === "true" &&
              "Test data can be used: 4242424242424242 | 12/34 | 567"}
          </div>
          <div className="line-clamp-1 font-semibold text-muted-foreground">
            Pay {store.name}
          </div>
          <div className="text-3xl font-bold">{formatPrice(total)}</div>
        </div>
        <CartLineItems
          items={cartLineItems}
          isEditable={false}
          className="container hidden w-full max-w-xl lg:ml-auto lg:mr-0 lg:flex lg:max-h-[580px] lg:pr-[4.5rem]"
        />
      </div>
      <CheckoutShell
        paymentIntent={paymentIntent}
        storeStripeAccountId={store.stripeAccountId}
        className="h-full w-full flex-1 bg-slate-50 pb-12 pt-10 lg:flex-initial lg:pl-12 lg:pt-16"
      >
        <ScrollArea className="h-full">
          <CheckoutForm
            storeId={store.id}
            className="container max-w-xl pr-6 lg:ml-0 lg:mr-auto"
          />
        </ScrollArea>
      </CheckoutShell>
    </section>
  );
}
