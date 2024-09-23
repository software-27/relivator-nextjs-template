import { Balancer } from "react-wrap-balancer";

import PageLayout from "~/components/Wrappers/PageLayout";

export default function BlockedPage() {
  return (
    <PageLayout title="😢 Access Denied">
      <Balancer
        className={`
          mx-auto mt-4 !block leading-normal text-muted-foreground

          sm:text-lg sm:leading-7
        `}
        as="p"
      >
        Our servers have put you on the naughty list. You will need to wait a
        bit before being able to access our services.
      </Balancer>
    </PageLayout>
  );
}
