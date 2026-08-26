/* eslint-disable react-perf/jsx-no-new-function-as-prop -- Popover callbacks stay local to this panel. */
import { useRef, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { parseRepositoryName, repositoryOptions } from "@/app/favorite-repositories";
import { viewerRepositoriesQueryOptions, type MessageSender } from "@/app/dashboard-queries";
import type { DashboardSnapshot } from "@/data/github";
import { sendOctobaseMessage } from "@/lib/messages";

const OPTION_LIMIT = 8;

export function AddPinnedRepository({
  accountLogin,
  dashboard,
  isFull,
  onAdd,
  pinned,
  sendMessage = sendOctobaseMessage,
}: {
  accountLogin: string;
  dashboard?: DashboardSnapshot;
  isFull: boolean;
  onAdd: (nameWithOwner: string) => void;
  pinned: readonly string[];
  sendMessage?: MessageSender;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string>();
  // Fetched when the popover first opens, then filtered locally on every keystroke.
  const repositories = useQuery({
    ...viewerRepositoriesQueryOptions(accountLogin, sendMessage),
    enabled: isOpen,
  });
  const options = repositoryOptions(
    dashboard,
    repositories.data ?? [],
    pinned,
    query,
    OPTION_LIMIT,
  );

  function add(nameWithOwner: string) {
    onAdd(nameWithOwner);
    setQuery("");
    setError(undefined);
    setIsOpen(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    // Enter takes the top match, so a partial name pins without typing the owner.
    const chosen = options[0]?.nameWithOwner ?? parseRepositoryName(query)?.nameWithOwner;
    if (!chosen) {
      setError("No repository matched. Type the full owner/name to pin any other repository.");
      return;
    }
    add(chosen);
  }

  return (
    <Popover
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setQuery("");
          setError(undefined);
        }
      }}
      open={isOpen}
    >
      <PopoverTrigger asChild>
        <Button
          aria-label="Pin a repository"
          className="h-6 px-2 text-xs"
          disabled={isFull}
          size="sm"
          type="button"
          variant="outline"
        >
          Pin
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-3"
        onOpenAutoFocus={(event) => {
          // Radix parks focus on the content itself, so opening the popover would still need a
          // click before typing. Send it straight to the field.
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <PopoverHeader>
          <PopoverTitle>Pin a repository</PopoverTitle>
          <PopoverDescription className="text-xs">
            Your repositories and the ones you contribute to.
          </PopoverDescription>
        </PopoverHeader>
        <form className="mt-3 flex gap-2" onSubmit={submit}>
          <Input
            aria-label="Repository to pin"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setError(undefined);
            }}
            placeholder="Filter by name"
            ref={inputRef}
            value={query}
          />
          <Button size="sm" type="submit">
            Pin
          </Button>
        </form>
        {error ? (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {options.length > 0 ? (
          <ul className="mt-3 grid grid-cols-1 gap-0.5">
            {options.map((option) => (
              <li className="min-w-0" key={option.nameWithOwner}>
                <Button
                  className="w-full justify-start font-normal"
                  onClick={() => add(option.nameWithOwner)}
                  size="sm"
                  title={option.nameWithOwner}
                  type="button"
                  variant="ghost"
                >
                  <span className="min-w-0 flex-1 truncate text-left">{option.nameWithOwner}</span>
                  {option.isPrivate ? (
                    <Badge className="ml-auto" variant="secondary">
                      Private
                    </Badge>
                  ) : null}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground" role="status">
            {repositories.isPending
              ? "Loading your repositories…"
              : repositories.isError
                ? "Could not load your repositories. Type owner/name to pin one anyway."
                : "No match. Type owner/name to pin any other repository."}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
