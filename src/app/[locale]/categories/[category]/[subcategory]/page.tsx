import type { Product } from "~/db/schema";

import type { Metadata } from "next";

import { titleCase } from "string-ts";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/Navigation/PageNavMenu";
import { Shell } from "~/components/Wrappers/ShellVariants";
import { unslugify } from "~/utils/string";

type SubcategoryPageProps = {
  params: {
    // @ts-expect-error TODO: Fix ts
    category: Product["category"];
    subcategory: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
};

export function generateMetadata({ params }: SubcategoryPageProps): Metadata {
  const subcategory = unslugify(params.subcategory);

  return {
    description: `Buy the best ${subcategory}`,

    title: titleCase(subcategory),
  };
}

export default async function SubcategoryPage() {
  return (
    <Shell>
      <PageHeader>
        <PageHeaderHeading size="sm">
          Oops... Subcategory page is temporarily disabled...
        </PageHeaderHeading>
        <PageHeaderDescription size="sm">
          We are working on this page. It will be live again soon. Stay tuned
          for updates.
        </PageHeaderDescription>
      </PageHeader>
    </Shell>
  );
}
