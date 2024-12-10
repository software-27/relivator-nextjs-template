import { type Metadata } from "next";

import { Shell } from "~/components/shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { VerifyEmailForm } from "~/components/verify-email-form";
import { env } from "~/env.js";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Verify Email",
  description: "Verify your email address to continue with your sign up",
};

export default function VerifyEmailPage() {
  return (
    <Shell className="max-w-lg">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verify email</CardTitle>
          <CardDescription>
            Verify your email address to complete your account creation
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <VerifyEmailForm />
        </CardContent>
      </Card>
    </Shell>
  );
}
