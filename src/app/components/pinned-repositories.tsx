/* eslint-disable react-perf/jsx-no-new-function-as-prop -- Pin actions carry a repository name and do not cross memoized boundaries. */
import { useState } from "react";
import { AddPinnedRepository } from "@/app/components/add-pinned-repository";
import {
  favoriteRepositories,
  MAX_FAVORITE_REPOSITORIES,
  type FavoriteRepository,
} from "@/app/favorite-repositories";
import { Button } from "@/components/ui/button";
import type { MessageSender } from "@/app/dashboard-queries";
import type { DashboardSnapshot } from "@/data/github";

export function PinnedRepositories({
  accountLogin,
  dashboard,
  onAdd,
  onMove,
  onRemove,
  pinned,
  sendMessage,
}: {
  accountLogin: string;
  dashboard?: DashboardSnapshot;
  onAdd: (nameWithOwner: string) => void;
  onMove: (nameWithOwner: string, offset: number) => void;
  onRemove: (nameWithOwner: string) => void;
  pinned: readonly string[];
  sendMessage?: MessageSender;
}) {
  const [isEditRequested, setIsEditRequested] = useState(false);
  const repositories = favoriteRepositories(pinned);
  // Unpinning the last row leaves nothing to edit, so edit mode ends with it.
  const isEditing = isEditRequested && repositories.length > 0;

  return (
    <aside
      aria-labelledby="pinned-repositories-heading"
      className="lg:sticky lg:top-20 lg:self-start"
    >
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h2
          className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase"
          id="pinned-repositories-heading"
        >
          Pinned
        </h2>
        <AddPinnedRepository
          accountLogin={accountLogin}
          dashboard={dashboard}
          isFull={repositories.length >= MAX_FAVORITE_REPOSITORIES}
          onAdd={onAdd}
          pinned={pinned}
          sendMessage={sendMessage}
        />
      </div>
      {repositories.length === 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">Pin the repos for faster access.</p>
      ) : (
        <>
          <ul className="mt-1 grid grid-cols-1 gap-0.5">
            {repositories.map((repository, index) => (
              <li className="min-w-0" key={repository.nameWithOwner}>
                <PinnedRepositoryRow
                  index={index}
                  isEditing={isEditing}
                  isFirst={index === 0}
                  isLast={index === repositories.length - 1}
                  onMove={onMove}
                  onRemove={onRemove}
                  repository={repository}
                />
              </li>
            ))}
          </ul>
          <div className="mt-1.5 flex items-center justify-between gap-2 border-t pt-1.5">
            <p className="text-xs text-muted-foreground">{jumpHint(repositories.length)}</p>
            <Button
              aria-pressed={isEditing}
              className="h-6 px-2 text-xs"
              onClick={() => setIsEditRequested(!isEditing)}
              size="sm"
              type="button"
              variant={isEditing ? "secondary" : "ghost"}
            >
              {isEditing ? "Done" : "Edit pins"}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}

function PinnedRepositoryRow({
  index,
  isEditing,
  isFirst,
  isLast,
  onMove,
  onRemove,
  repository,
}: {
  index: number;
  isEditing: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMove: (nameWithOwner: string, offset: number) => void;
  onRemove: (nameWithOwner: string) => void;
  repository: FavoriteRepository;
}) {
  return (
    <div className="group relative rounded-(--borderRadius-medium) px-2 py-1.5 transition-colors hover:bg-accent">
      <div className="flex items-center gap-2">
        <PinKey>{index + 1}</PinKey>
        <span className="min-w-0 flex-1 truncate text-sm">
          <span className="text-muted-foreground">{repository.owner}/</span>
          {isEditing ? (
            <span className="font-medium text-foreground">{repository.name}</span>
          ) : (
            <PinnedLink
              className="font-medium text-foreground after:absolute after:inset-0"
              href={repository.url}
              title={repository.nameWithOwner}
            >
              {repository.name}
            </PinnedLink>
          )}
        </span>
      </div>
      {isEditing ? (
        <div className="relative z-10 mt-1 flex items-center gap-1 pl-6.5">
          <Button
            aria-label={`Move ${repository.nameWithOwner} earlier`}
            className="size-5 p-0 text-xs"
            disabled={isFirst}
            onClick={() => onMove(repository.nameWithOwner, -1)}
            size="sm"
            type="button"
            variant="outline"
          >
            <span aria-hidden>↑</span>
          </Button>
          <Button
            aria-label={`Move ${repository.nameWithOwner} later`}
            className="size-5 p-0 text-xs"
            disabled={isLast}
            onClick={() => onMove(repository.nameWithOwner, 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            <span aria-hidden>↓</span>
          </Button>
          <Button
            className="ml-auto h-5 px-1.5 text-xs"
            onClick={() => onRemove(repository.nameWithOwner)}
            size="sm"
            type="button"
            variant="ghost"
          >
            Unpin
          </Button>
        </div>
      ) : (
        <p className="relative z-10 mt-0.5 flex items-center gap-1.5 pl-6.5 text-xs text-muted-foreground">
          <PinnedLink href={`${repository.url}/pulls`}>Pull requests</PinnedLink>
          <span aria-hidden>·</span>
          <PinnedLink href={`${repository.url}/issues`}>Issues</PinnedLink>
        </p>
      )}
    </div>
  );
}

function PinnedLink({
  children,
  className = "",
  href,
  title,
}: {
  children: string;
  className?: string;
  href: string;
  title?: string;
}) {
  return (
    <a
      className={`hover:text-(--fgColor-accent) hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-(--focus-outlineColor) ${className}`}
      href={href}
      rel="noreferrer"
      target="_blank"
      title={title}
    >
      {children}
    </a>
  );
}

function PinKey({ children }: { children: number }) {
  return (
    <kbd className="inline-flex size-4.5 shrink-0 items-center justify-center rounded-[3px] border bg-muted font-mono text-[10px] leading-none text-muted-foreground transition-colors group-hover:border-(--fgColor-accent) group-hover:text-(--fgColor-accent)">
      {children}
    </kbd>
  );
}

function jumpHint(count: number): string {
  return count === 1 ? "Press 1 to jump" : `Press 1–${count} to jump`;
}
