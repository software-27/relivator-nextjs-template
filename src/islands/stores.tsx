"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PaginationButton } from "~/islands/common/pager/pagination-button";
import { Button } from "~/islands/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "~/islands/primitives/dropdown-menu";
import { Icons } from "~/islands/primitives/icons";
import { StoreCard } from "~/islands/store-card";
import { sortOptions } from "~/utils/appts/stores";
import { cn } from "~/utils/server/fmt";
import type { CuratedStore } from "~/utils/types/store-main";

interface StoresProps extends React.HTMLAttributes<HTMLDivElement> {
  stores: CuratedStore[];
  pageCount: number;
}

export function Stores({ stores, pageCount, ...props }: StoresProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  // Search params
  const page = searchParams?.get("page") ?? "1";
  const per_page = searchParams?.get("per_page") ?? "8";
  const sort = searchParams?.get("sort") ?? "productCount.desc";

  // Create query string
  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  return (
    <section className="flex flex-col space-y-6" {...props}>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Sort stores" size="sm" disabled={isPending}>
              Sort
              <Icons.chevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.label}
                className={cn(option.value === sort && "font-bold")}
                onClick={() => {
                  startTransition(() => {
                    router.push(
                      `${pathname}?${createQueryString({
                        sort: option.value
                      })}`,
                      {
                        scroll: false
                      }
                    );
                  });
                }}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {!isPending && !stores.length ? (
        <div className="mx-auto flex max-w-xs flex-col space-y-1.5">
          <h1 className="text-center text-2xl font-bold">No stores found</h1>
          <p className="text-center text-muted-foreground">
            Try changing your filters, or check back later for new stores
          </p>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            href={`/products?store_ids=${store.id}`}
            store={store}
          />
        ))}
      </div>
      {stores.length ? (
        <PaginationButton
          pageCount={pageCount}
          page={page}
          per_page={per_page}
          sort={sort}
          createQueryString={createQueryString}
          router={router}
          pathname={pathname}
          isPending={isPending}
          startTransition={startTransition}
        />
      ) : null}
    </section>
  );
}
