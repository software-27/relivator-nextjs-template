/* eslint-disable @stylistic/max-len */
"use client";

import { authProvider } from "~/auth/provider";
import { Button } from "~/components/ui/button";
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/hooks/use-toast";

// Used as a placeholder when environment variables are not specified
export function ButtonPlaceholder() {
  const { toast } = useToast();

  const handleTryAgainClick = () => {
    window.open(
      "https://github.com/blefnk/relivator-nextjs-template#readme",
      "_blank",
    );
  };

  return (
    <Button
      className="whitespace-nowrap px-3 text-sm"
      variant="secondary"
      onClick={() => {
        toast({
          action: (
            <ToastAction
              altText="Button which opens Relivator's README.md in the browser"
              onClick={handleTryAgainClick}
            >
              README.md
            </ToastAction>
          ),
          description:
            authProvider === "authjs"
              ? "Please specify Google, Discord, or GitHub environment variables in your .env file or in Vercel dashboard to unlock NextAuth.js (authjs) features. Or use Clerk instead. Refer to .env.example for more information."
              : "Please specify Clerk environment variables in your .env file or Vercel dashboard. You may also need to specify some NextAuth.js (auth) variables currently. Or just use NextAuth.js (auth) instead. Refer to .env.example for more information.",
          title: "Environment Variables",
        });
      }}
    >
      Sign In
    </Button>
  );
}
