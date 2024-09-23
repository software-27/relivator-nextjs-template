"use client";

import type { VariantProps } from "class-variance-authority";

import type { ComponentPropsWithoutRef, ElementRef, ReactElement } from "react";
import { forwardRef } from "react";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "~/utils/cn";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = forwardRef<
  ElementRef<typeof ToastPrimitives.Viewport>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    className={cn(
      `
        fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4

        md:max-w-[420px]

        sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col
      `,
      className,
    )}
    ref={ref}
    {...props}
  />
));

ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  `
    group pointer-events-auto relative flex w-full items-center justify-between
    space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg
    transition-all

    data-[state=closed]:animate-out data-[state=closed]:fade-out-80
    data-[state=closed]:slide-out-to-right-full

    data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full
    data-[state=open]:sm:slide-in-from-bottom-full

    data-[swipe=cancel]:translate-x-0

    data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]
    data-[swipe=end]:animate-out

    data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
    data-[swipe=move]:transition-none
  `,
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: `
          destructive group border-destructive bg-destructive
          text-destructive-foreground
        `,
      },
    },
  },
);

const Toast = forwardRef<
  ElementRef<typeof ToastPrimitives.Root>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  );
});

Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = forwardRef<
  ElementRef<typeof ToastPrimitives.Action>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    className={cn(
      `
        inline-flex h-8 shrink-0 items-center justify-center rounded-md border
        bg-transparent px-3 text-sm font-medium ring-offset-background
        transition-colors

        disabled:pointer-events-none disabled:opacity-50

        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2

        group-[.destructive]:border-muted/40
        group-[.destructive]:hover:border-destructive/30
        group-[.destructive]:hover:bg-destructive
        group-[.destructive]:hover:text-destructive-foreground
        group-[.destructive]:focus:ring-destructive

        hover:bg-secondary
      `,
      className,
    )}
    ref={ref}
    {...props}
  />
));

ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = forwardRef<
  ElementRef<typeof ToastPrimitives.Close>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    className={cn(
      `
        absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0
        transition-opacity

        focus:opacity-100 focus:outline-none focus:ring-2

        group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50
        group-[.destructive]:focus:ring-red-400
        group-[.destructive]:focus:ring-offset-red-600

        group-hover:opacity-100

        hover:text-foreground
      `,
      className,
    )}
    ref={ref}
    toast-close=""
    {...props}
  >
    <X className="size-4" />
  </ToastPrimitives.Close>
));

ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = forwardRef<
  ElementRef<typeof ToastPrimitives.Title>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    className={cn("text-sm font-semibold", className)}
    ref={ref}
    {...props}
  />
));

ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = forwardRef<
  ElementRef<typeof ToastPrimitives.Description>,
  ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    className={cn("text-sm opacity-90", className)}
    ref={ref}
    {...props}
  />
));

ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastAction,
  type ToastActionElement,
  ToastClose,
  ToastDescription,
  type ToastProps,
  ToastProvider,
  ToastTitle,
  ToastViewport,
};
