import Link from "next/link";

import { CartLineItems } from "~/components/Checkout/CartLineItems";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getCartAction } from "~/server/actions/deprecated/cart";
import { cn } from "~/utils/cn";
import { formatPrice } from "~/utils/number";

type CheckoutCardProps = {
  storeId: string;
};

export async function CheckoutCard({ storeId }: CheckoutCardProps) {
  // @ts-expect-error TODO: fix id type
  const cartLineItems = await getCartAction(storeId);

  let totalQuantity = 0;
  let totalPrice = 0;

  try {
    totalQuantity = cartLineItems.reduce(
      (accumulator, item) => accumulator + item.quantity || 0,
      0,
    );
  } catch (error) {
    if (error instanceof Error) {
      totalQuantity = 0;
    }
  }

  // Set default variable value in case of an error
  try {
    totalPrice = cartLineItems.reduce(
      (accumulator, item) =>
        accumulator + Number(item.price || 0) * item.quantity || 0,
      0,
    );
  } catch (error) {
    if (error instanceof Error) {
      totalPrice = 0;
    }
  }

  // Set default variable value in case of an error
  // If totalQuantity is 0, don't render the card
  if (!totalQuantity) {
    return null;
  }

  return (
    <Card
      id={`checkout-store-${storeId}`}
      key={storeId}
      className={cn(
        cartLineItems[0]?.storeStripeAccountId
          ? "border-green-500"
          : "border-neutral-700",
      )}
      aria-labelledby={`checkout-store-${storeId}-heading`}
    >
      <CardHeader className="flex flex-row items-center space-x-4 py-4">
        <CardTitle className="line-clamp-1 flex-1">
          {cartLineItems[0]?.storeName}
        </CardTitle>
        <Link
          className={cn(
            buttonVariants({
              size: "sm",
            }),
          )}
          aria-label="Checkout"
          href={`/checkout/${storeId}`}
        >
          Checkout
        </Link>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="pb-6 pl-6 pr-0">
        <CartLineItems className="max-h-[280px]" items={cartLineItems} />
      </CardContent>
      <Separator className="mb-4" />
      <CardFooter className="space-x-4">
        <span className="flex-1">Total ({totalQuantity})</span>
        <span>{formatPrice(totalPrice)}</span>
      </CardFooter>
    </Card>
  );
}
