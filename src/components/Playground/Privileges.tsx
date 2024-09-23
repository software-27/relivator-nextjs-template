"use client";

import type { FormEvent } from "react";
import { startTransition } from "react";

import consola from "consola";
import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { changeUserPrivileges } from "~/core/adm/actions";
import { catchError } from "~/server/helpers/auth-error";

export default function ButtonSetPrivileges(
  userId: string,
  newRole: "admin" | "user",
) {
  const t = useTranslations();

  function onSubmit(event_: FormEvent<HTMLFormElement>) {
    event_.preventDefault();
    startTransition(async () => {
      async function changePrivileges() {
        try {
          const session = await changeUserPrivileges({
            role: newRole,
            userId,
          });

          if (session !== undefined) {
            consola.info(session.res);
          }
        } catch (error) {
          catchError(error);
        }
      }

      await changePrivileges();
    });
  }

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <Button variant="secondary">{t("Privileges.switchUserRole")}</Button>
    </form>
  );
}
