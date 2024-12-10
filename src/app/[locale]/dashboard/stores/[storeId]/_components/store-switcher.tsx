"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import {
  CaretSortIcon,
  CheckIcon,
  FrameIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { RateLimitAlert } from "~/components/rate-limit-alert";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import { Dialog, DialogContent, DialogHeader } from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type getStoresByUserId } from "~/server/queries/store";
import { type getUserPlanMetrics } from "~/server/queries/user";
import { cn } from "~/server/utils";

import { CreateStoreDialog } from "./create-store-dialog";
import { updateCurrentStore } from "./storeSwitcherActions";

type StoreSwitcherProps = {
  userId: string;
  storesPromise: ReturnType<typeof getStoresByUserId>;
  planMetricsPromise: ReturnType<typeof getUserPlanMetrics>;
  currentStoreId?: string;
} & React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

export function StoreSwitcher({
  userId,
  storesPromise,
  planMetricsPromise,
  currentStoreId,
  className,
  ...props
}: StoreSwitcherProps) {
  const { storeId } = useParams<{ storeId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [showNewStoreDialog, setShowNewStoreDialog] = React.useState(false);
  const [showRateLimitDialog, setShowRateLimitDialog] = React.useState(false);

  const stores = React.use(storesPromise);
  const planMetrics = React.use(planMetricsPromise);
  const rateLimitExceeded =
    planMetrics.storeLimitExceeded || planMetrics.productLimitExceeded;

  const selectedStore = stores.find((store) => store.id === storeId);
  const currentStore = stores.find((store) => store.id === currentStoreId);
  const currentStoreName = currentStore?.name;

  return (
    <>
      <CreateStoreDialog
        userId={userId}
        planMetricsPromise={planMetricsPromise}
        open={showNewStoreDialog}
        onOpenChange={setShowNewStoreDialog}
      />
      <Dialog open={showRateLimitDialog} onOpenChange={setShowRateLimitDialog}>
        <DialogContent className="gap-0">
          <DialogHeader className="text-left">
            <DialogTitle>Store limit exceeded</DialogTitle>
          </DialogHeader>
          {/* TODO: fix Stripe's error show in the toast */}
          {/* <RateLimitAlert planMetrics={planMetrics} /> */}{" "}
          <Link href="/dashboard/billing" className="mt-4">
            <Button>Upgrade</Button>
          </Link>
        </DialogContent>
      </Dialog>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a store"
            className={cn("w-full justify-between", className)}
            {...props}
          >
            {selectedStore?.name ?? currentStoreName ?? "Select a store"}
            <CaretSortIcon
              className="ml-auto size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search store..." />
              <CommandEmpty>No store found.</CommandEmpty>
              <CommandGroup>
                {stores.map((store) => (
                  <CommandItem
                    key={store.id}
                    onSelect={async () => {
                      setOpen(false);
                      await updateCurrentStore(userId, store.id);
                      pathname.includes(store.id)
                        ? router.replace(pathname.replace(storeId, store.id))
                        : router.push(`/dashboard/stores/${store.id}`);
                    }}
                    className="text-sm"
                  >
                    <FrameIcon
                      className="mr-2 size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    {store.name}
                    <CheckIcon
                      className={cn(
                        "ml-auto size-4",
                        selectedStore?.id === store.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                      aria-hidden="true"
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    if (rateLimitExceeded) {
                      setShowRateLimitDialog(true);
                      return;
                    }

                    setOpen(false);
                    setShowNewStoreDialog(true);
                  }}
                >
                  <PlusCircledIcon className="mr-2 size-4" aria-hidden="true" />
                  Create store
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
