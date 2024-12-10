import type { Metadata } from "next";

import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { env } from "~/env.js";
import { getCategories, getSubcategories } from "~/server/queries/product";
import { getCachedUser } from "~/server/queries/user";

import { CreateProductForm } from "./_components/create-product-form";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "New Product",
  description: "Add a new product",
};

type NewProductPageProps = {
  params: {
    storeId: string;
  };
};

export default async function NewProductPage({ params }: NewProductPageProps) {
  const storeId = decodeURIComponent(params.storeId);

  const user = await getCachedUser();

  if (!user) {
    redirect("/sigin");
  }

  const promises = Promise.all([getCategories(), getSubcategories()]).then(
    ([categories, subcategories]) => ({ categories, subcategories }),
  );

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Add product</CardTitle>
        <CardDescription>Add a new product to your store</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateProductForm storeId={storeId} promises={promises} />
      </CardContent>
    </Card>
  );
}
