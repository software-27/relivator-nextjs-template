import type { Metadata } from "next";
import Link from "next/link";

import { getUniqueStoreIds } from "~/server/actions/cart";
import { cn } from "~/server/utils";
import { env } from "~/data/env";
import { fullURL } from "~/data/meta/builder";
import { CheckoutCard } from "~/islands/cards/checkout-card";
import { Icons } from "~/islands/icons";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading
} from "~/islands/page-header";
import { buttonVariants } from "~/islands/primitives/button";
import { Shell } from "~/islands/shells/shell";

export const metadata: Metadata = {
  metadataBase: fullURL(),
  title: "Checkout",
  description: "Checkout with your cart items"
};

export default async function CheckoutPage() {
  const uniqueStoreIds = await getUniqueStoreIds();

  return (
    <Shell>
      <PageHeader
        id="checkout-page-header"
        aria-labelledby="checkout-page-header-heading"
      >
        <PageHeaderHeading size="sm">Checkout</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Checkout with your cart items
        </PageHeaderDescription>
      </PageHeader>
      {uniqueStoreIds.length > 0 ? (
        uniqueStoreIds.map((storeId) => (
          <CheckoutCard key={storeId} storeId={storeId} />
        ))
      ) : (
        <section
          id="checkout-page-empty-cart"
          aria-labelledby="checkout-page-empty-cart-heading"
          className="flex h-full flex-col items-center justify-center space-y-1 pt-16"
        >
          <Icons.cart
            className="mb-4 h-16 w-16 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="text-xl font-medium text-muted-foreground">
            Your cart is empty
          </div>
          <Link
            aria-label="Add items to your cart to checkout"
            href="/products"
            className={cn(
              buttonVariants({
                variant: "link",
                size: "sm",
                className: "text-sm text-muted-foreground"
              })
            )}
          >
            Add items to your cart to checkout
          </Link>
        </section>
      )}
    </Shell>
  );
}
