import type { getOrderLineItemsSchema } from "~/server/validations/deprecated/order";
import type { CartLineItem, CheckoutItem } from "~/types/store";
import type Stripe from "stripe";

import destr from "destr";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { carts, orders, payments, products } from "~/db/schema";
import { getCartId } from "~/server/helpers/cart";
import { checkoutItemSchema } from "~/server/validations/deprecated/cart";

export async function getOrderLineItemsAction(
  input: {
    paymentIntent?: null | Stripe.Response<Stripe.PaymentIntent>;
  } & z.infer<typeof getOrderLineItemsSchema>,
): Promise<CartLineItem[]> {
  try {
    const safeParsedItems = z
      .array(checkoutItemSchema)
      .safeParse(destr(input.items || "[]"));

    if (!safeParsedItems.success) {
      throw new Error("Could not parse items.");
    }

    const lineItems = await db
      .select({
        id: products.id,
        name: products.name,
        // @ts-expect-error disable ts error during migration
        category: products.category,
        images: products.images,
        inventory: products.inventory,
        price: products.price,
        storeId: products.storeId,
        // @ts-expect-error disable ts error during migration
        subcategory: products.subcategory,
      })
      .from(products)
      .where(
        // @ts-expect-error TODO: fix id type
        inArray(
          products.id,
          safeParsedItems.data.map((item) => item.productId),
        ),
      )
      .groupBy(products.id)
      .orderBy(desc(products.createdAt))
      .execute()
      .then((items) => {
        return items.map((item) => {
          const quantity =
            safeParsedItems.data.find(
              // @ts-expect-error TODO: fix
              (checkoutItem) => checkoutItem.productId === item.id,
            ) && // @ts-expect-error TODO: fix
            safeParsedItems.data.find(
              // @ts-expect-error TODO: fix
              (checkoutItem) => checkoutItem.productId === item.id,
            ).quantity;

          return {
            ...item,
            quantity: quantity || 0,
          };
        });
      });

    if (input.paymentIntent && input.paymentIntent.status === "succeeded") {
      const cartId = await getCartId();

      if (!cartId) {
        return lineItems;
      }

      const cart = await db.query.carts.findFirst({
        columns: {
          clientSecret: true,
          closed: true,
          paymentIntentId: true,
        },
        // @ts-expect-error TODO: fix id type
        where: eq(carts.id, Number(cartId)),
      });

      if (!cart || cart.closed) {
        return lineItems;
      }

      if (!cart.clientSecret || !cart.paymentIntentId) {
        return lineItems;
      }

      const payment = await db.query.payments.findFirst({
        columns: {
          storeId: true,
          stripeAccountId: true,
        },
        // @ts-expect-error disable ts error during migration
        where: eq(payments.storeId, input.storeId),
      });

      // @ts-expect-error TODO: fix
      if (!payment && payment.stripeAccountId) {
        return lineItems;
      }

      // TODO: FIX: Create new address in DB
      // const stripeAddress = input.paymentIntent.shipping?.address;
      // const newAddress = await db.insert(addresses).values({
      // line1: stripeAddress?.line1,
      // line2: stripeAddress?.line2,
      // city: stripeAddress?.city,
      // state: stripeAddress?.state,
      // country: stripeAddress?.country,
      // postalCode: stripeAddress?.postal_code,
      // });
      // if (!newAddress.insertId) throw new Error("No address created.");
      // Create new order in db
      await db.insert(orders).values({
        // @ts-expect-error disable ts error during migration
        amount: Number(input.paymentIntent.amount) / 100,
        email: input.paymentIntent.receipt_email,
        items: input.items as unknown as CheckoutItem[],

        // name: input.paymentIntent.shipping?.name,
        quantity: safeParsedItems.data.reduce(
          (accumulator, item) => accumulator + item.quantity,
          0,
        ),
        // @ts-expect-error TODO: fix
        storeId: payment.storeId,
        stripePaymentIntentId: input.paymentIntent.id,
        stripePaymentIntentStatus: input.paymentIntent.status,

        // addressId: Number(newAddress.insertId),
      });

      // Update product inventory in db
      for (const item of safeParsedItems.data) {
        const product = await db.query.products.findFirst({
          columns: {
            id: true,
            inventory: true,
          },
          // @ts-expect-error TODO: fix id type
          where: eq(products.id, item.productId),
        });

        if (!product) {
          return lineItems;
        }

        const inventory = product.inventory - item.quantity;

        if (inventory < 0) {
          return lineItems;
        }

        await db
          .update(products)
          .set({
            inventory: product.inventory - item.quantity,
          }) // @ts-expect-error TODO: fix id type
          .where(eq(products.id, item.productId));
      }

      await db
        .update(carts)
        .set({
          closed: true,
          items: [],
        })
        .where(eq(carts.paymentIntentId, cart.paymentIntentId));
    }

    return lineItems;
  } catch {
    return [];
  }
}
