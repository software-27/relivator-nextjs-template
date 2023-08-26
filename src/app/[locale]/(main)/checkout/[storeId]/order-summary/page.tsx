import type { Metadata } from "next";
import { CheckoutItem } from "~/types";

import { getOrderedProducts } from "~/server/actions/order";
import { getPaymentIntentAction } from "~/server/actions/stripe";
import { env } from "~/data/env";
import { fullURL } from "~/data/meta/builder";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading
} from "~/islands/page-header";
import { Shell } from "~/islands/shells/shell";

export const metadata: Metadata = {
  metadataBase: fullURL(),
  title: "Order Summary",
  description: "Order Summary for your purchase"
};

interface OrderSummaryPageProps {
  params: {
    storeId: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function OrderSummaryPage({
  params,
  searchParams
}: OrderSummaryPageProps) {
  const storeId = Number(params.storeId);
  const {
    payment_intent,
    payment_intent_client_secret,
    redirect_status,
    delivery_postal_code
  } = searchParams ?? {};

  const { isVerified, paymentIntent } = await getPaymentIntentAction({
    storeId,
    paymentIntentId: typeof payment_intent === "string" ? payment_intent : "",
    deliveryPostalCode:
      typeof delivery_postal_code === "string" ? delivery_postal_code : ""
  });

  const checkoutItems = JSON.parse(
    paymentIntent?.metadata?.items ?? ""
  ) as unknown as CheckoutItem[];

  if (isVerified) {
    const { orderedProducts, storeName } = await getOrderedProducts({
      checkoutItems,
      storeId
    });

    return (
      <Shell>
        <PageHeader>
          <PageHeaderHeading size="sm">Order Summary</PageHeaderHeading>
          <PageHeaderDescription size="sm">
            Order Summary for your purchase
          </PageHeaderDescription>
        </PageHeader>
        <div>
          <h2>Order Summary</h2>
          <h3>{storeName}</h3>
          <ul>
            {orderedProducts.map((product) => (
              <li key={product.id}>
                <h4>{product.name}</h4>
                <p>{product.price}</p>
                <p>{product.quantity}</p>
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">Order Summary</PageHeaderHeading>
        <PageHeaderDescription size="sm">
          Order Summary for your purchase
        </PageHeaderDescription>
      </PageHeader>
    </Shell>
  );
}
