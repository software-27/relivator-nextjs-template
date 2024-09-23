"use client";

import type { getNotification } from "~/server/helpers/notification";
import type { UpdateNotificationSchema } from "~/server/validations/deprecated/notification";

import { use, useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import consola from "consola";
import { useTranslations } from "next-intl";

import { SpinnerSVG } from "~/components/Common/Icons/SVG";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { updateNotification } from "~/server/actions/deprecated/notification";
import { updateNotificationSchema } from "~/server/validations/deprecated/notification";

type UpdateNotificationFormProps = {
  notificationPromise: ReturnType<typeof getNotification>;
};

export function UpdateNotificationForm({
  notificationPromise,
}: UpdateNotificationFormProps) {
  const t = useTranslations();

  const notification = use(notificationPromise);
  const [loading, setLoading] = useState(false);

  const form = useForm<UpdateNotificationSchema>({
    defaultValues: {
      marketing: notification?.marketing,
      newsletter: notification?.newsletter,
      token: notification?.token,
    },
    resolver: zodResolver(updateNotificationSchema),
  });

  async function onSubmit(input: UpdateNotificationSchema) {
    setLoading(true);
    const { error } = await updateNotification({
      communication: input.communication,
      marketing: input.marketing,
      newsletter: input.newsletter,
      token: input.token,
    });

    if (error) {
      consola.error(error);

      return;
    }

    consola.success("Preferences updated");
    setLoading(false);
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          name="communication"
          control={form.control}
          render={({ field }) => (
            <FormItem
              className={`
                flex w-full items-center justify-between space-x-2 rounded-lg
                border p-4
              `}
            >
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Communication emails
                </FormLabel>
                <FormDescription>
                  Receive transactional emails, such as order confirmations and
                  shipping updates.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="newsletter"
          control={form.control}
          render={({ field }) => (
            <FormItem
              className={`
                flex w-full flex-row items-center justify-between space-x-2
                rounded-lg border p-4
              `}
            >
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("UpdateNotificationForm.newsletterEmails")}
                </FormLabel>
                <FormDescription>
                  Receive our monthly newsletter with the latest news and
                  updates.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="marketing"
          control={form.control}
          render={({ field }) => (
            <FormItem
              className={`
                flex w-full flex-row items-center justify-between space-x-2
                rounded-lg border p-4
              `}
            >
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("UpdateNotificationForm.marketingEmails")}
                </FormLabel>
                <FormDescription>
                  Receive marketing emails, including promotions, discounts, and
                  more.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-fit" disabled={loading} size="sm">
          {loading && (
            <SpinnerSVG
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Save preferences
          <span className="sr-only">
            {t("UpdateNotificationForm.savePreferences")}
          </span>
        </Button>
      </form>
    </Form>
  );
}
