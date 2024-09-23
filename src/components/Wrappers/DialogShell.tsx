"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { cn } from "~/utils/cn";

type DialogShellProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function DialogShell({
  children,
  className,
  ...props
}: DialogShellProps) {
  const t = useTranslations();

  const router = useRouter();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [router]);

  return (
    <div className={cn(className)} {...props}>
      <Button
        className={`
          absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background
          transition-opacity

          hover:opacity-100
        `}
        onClick={() => {
          router.back();
        }}
      >
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">{t("DialogShell.close")}</span>
      </Button>
      {children}
    </div>
  );
}
