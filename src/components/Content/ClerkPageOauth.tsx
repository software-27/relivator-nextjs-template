"use client";

import type { OAuthStrategy } from "@clerk/types";

import { useState } from "react";

import { useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import consola from "consola";

import { oauthProvidersClerk } from "~/app";
import {
  GithubSVG,
  GoogleSVG,
  SpinnerSVG,
} from "~/components/Common/Icons/SVG";
import { Button } from "~/components/ui/button";

// @see https://github.com/clerk/javascript/blob/main/packages/clerk-js/src/ui/components/SignIn/SignInStart.tsx
export function OAuthSignInClerk() {
  const [isLoading, setIsLoading] = useState<null | OAuthStrategy>(null);
  const { isLoaded: signInLoaded, signIn } = useSignIn();

  async function oauthSignIn(provider: OAuthStrategy) {
    if (!signInLoaded) {
      return null;
    }

    try {
      setIsLoading(provider);
      await signIn.authenticateWithRedirect({
        redirectUrl: "/auth/sign-sso",
        redirectUrlComplete: "/auth",
        strategy: provider,
      });
    } catch (error) {
      setIsLoading(null);

      const unknownError = "Something went wrong, please try again.";

      isClerkAPIResponseError(error)
        ? consola.error(error)
        : consola.error(unknownError);
    }
  }

  const getColumnClass = (count: number) => {
    return !(count % 3) ? "sm:grid-cols-3" : "sm:grid-cols-2";
  };

  const iconMap = {
    discord: DiscordLogoIcon,
    github: GithubSVG,
    google: GoogleSVG,
  };

  return (
    <div className="flex justify-center">
      <div
        className={`
          grid grid-cols-1 gap-2

          ${getColumnClass(oauthProvidersClerk.length)}

          sm:gap-4
        `}
      >
        {oauthProvidersClerk.map((provider) => {
          const Icon =
            iconMap[provider.icon as keyof typeof iconMap] || SpinnerSVG; // Fallback to SpinnerSVG if icon not found

          return (
            <div key={provider.strategy} className="flex justify-center">
              <Button
                className={`
                  w-full bg-background

                  sm:w-auto
                `}
                aria-label={`Sign in with ${provider.name}`}
                disabled={isLoading !== null}
                variant="outline"
                onClick={async () =>
                  void (await oauthSignIn(provider.strategy))
                }
              >
                {isLoading === provider.strategy ? (
                  <SpinnerSVG
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon className="mr-2 size-4" aria-hidden="true" />
                )}
                {provider.name}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
