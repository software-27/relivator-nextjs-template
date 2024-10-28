"use client";

import * as React from "react";
import { toast } from "sonner";

import { createAccountLink } from "~/lib/actions/stripe";
import { cn } from "~/lib/utils";
import { Button, type ButtonProps } from "~/components/ui/button";
import { Icons } from "~/components/icons";

interface ConnectToStripeButtonProps extends ButtonProps {
  storeId: string;
}

export function ConnectStoreToStripeButton({
  storeId,
  className,
  ...props
}: ConnectToStripeButtonProps) {
  const [loading, setLoading] = React.useState(false);

  return (
    <Button
      aria-label="Connect to Stripe"
      className={cn(className)}
      onClick={async () => {
        setLoading(true);

        try {
          const { data, error } = await createAccountLink({ storeId });

          if (error) {
            toast.error(error);
            return;
          }

          if (data) {
            window.location.href = data.url;
          }
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      {...props}
    >
      {loading && (
        <Icons.spinner
          className="mr-2 size-4 animate-spin"
          aria-hidden="true"
        />
      )}
      Connect to Stripe
    </Button>
  );
}
