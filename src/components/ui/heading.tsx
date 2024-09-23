import type { ReactNode } from "react";
import Balancer from "react-wrap-balancer";

import { cva } from "class-variance-authority";

import { cn } from "~/utils/cn";

const headingVariants = cva("font-bold transition-colors", {
  defaultVariants: {
    size: "md",
    variant: "h2",
  },
  variants: {
    size: {
      lg: "text-lg",
      md: "text-base",
      sm: "text-sm",
    },
    variant: {
      h1: "scroll-m-20 border-b pb-2 text-3xl font-extrabold tracking-tight",
      h2: `
        scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight
        transition-colors

        first:mt-0
      `,
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
    },
  },
});

// TODO: do we need something like this? 🤔
// import type { VariantProps } from "class-variance-authority";
// export type HeadingVariantsProps = VariantProps<typeof headingVariants>;
// export { headingVariants };

type HeadingProps = {
  as?: "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
  className?: string;
};

export function Heading({ as = "h2", children, className = "" }: HeadingProps) {
  return (
    <Balancer
      className={cn(
        headingVariants({
          size: "lg",
          variant: as,
        }),
        className,
      )}
      as={as}
    >
      {children}
    </Balancer>
  );
}
