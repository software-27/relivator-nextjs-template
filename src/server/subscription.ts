import type { Plan } from "~/types";

import { pricingConfig } from "~/config/pricing";

export function getPlanByPriceId({ priceId }: { priceId: string }) {
  return Object.values(pricingConfig.plans).find(
    (plan) => plan.stripePriceId === priceId,
  );
}

export function getPlanLimits({ planId }: { planId?: Plan["id"] }) {
  const { features } = pricingConfig.plans[planId ?? "free"];

  const [storeLimit, productLimit] = features.map((feature) => {
    const [value] = /\d+/.exec(feature) || [];
    return value ? parseInt(value, 10) : 0;
  });

  return { storeLimit: storeLimit ?? 0, productLimit: productLimit ?? 0 };
}
