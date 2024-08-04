import Link from "next/link";

import { Badge } from "@/browser/reliverse/ui/Badge";
import { Github } from "lucide-react";

import { siteConfig } from "~/app";
import { getRepoStarsNumber } from "~/utils/github";

export async function GithubStarsBadge() {
  const repoGithubStarsNumber = await getRepoStarsNumber();

  return (
    <Link
      href={siteConfig.links.github}
      rel="noreferrer noopener"
      target="_blank"
    >
      <Badge
        className={`
          rounded-lg border-2 border-zinc-900/10 px-3.5 py-1.5 text-sm
          font-medium

          dark:border-zinc-800

          lg:text-base
        `}
        variant="outline"
      >
        <Github aria-label="GitHub" className="mr-2 size-3.5" />
        Star Relivator v1.2.6 on GitHub ⭐{" "}
        {repoGithubStarsNumber && `${repoGithubStarsNumber}/1,500`}
      </Badge>
    </Link>
  );
}
