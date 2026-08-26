import { useCallback } from "react";
import { RefreshCwIcon } from "lucide-react";
import type { TokenSource } from "@/auth/types";
import type {
  GitHubAppRepositoryAccess,
  PersonalTokenRepositoryAccess,
  RepositoryAccess,
  RepositoryInstallationAccess,
} from "@/data/repository-access";
import { formatRelativeTime } from "@/app/presentation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function RepositoryAccessSheet({
  access,
  error,
  isLoading,
  onLoad,
  source,
}: {
  access?: RepositoryAccess;
  error?: string;
  isLoading: boolean;
  onLoad: () => void;
  source: TokenSource;
}) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open && !access && !isLoading) onLoad();
    },
    [access, isLoading, onLoad],
  );

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="h-auto p-0 text-xs" type="button" variant="link">
          Access details
        </Button>
      </SheetTrigger>
      <SheetContent className="h-dvh max-h-dvh w-[min(92vw,36rem)] gap-0 sm:max-w-xl">
        <SheetHeader className="z-10 shrink-0 border-b bg-background pr-12">
          <SheetTitle>{credentialName(source)}</SheetTitle>
          <SheetDescription>What Octobase can read with this credential.</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {isLoading && !access ? <AccessSkeleton /> : null}
          {error ? (
            <div className="flex flex-wrap items-center gap-3" role="alert">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={onLoad} size="sm" type="button" variant="outline">
                Try again
              </Button>
            </div>
          ) : null}
          {access?.kind === "app" ? (
            <GitHubAppAccess access={access} isLoading={isLoading} onLoad={onLoad} />
          ) : null}
          {access?.kind === "personal-token" ? (
            <PersonalTokenAccess access={access} isLoading={isLoading} onLoad={onLoad} />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GitHubAppAccess({
  access,
  isLoading,
  onLoad,
}: {
  access: GitHubAppRepositoryAccess;
  isLoading: boolean;
  onLoad: () => void;
}) {
  const installationCount = access.installations.length;
  return (
    <>
      <AccessOverview
        count={access.repositoryCount}
        detail={
          installationCount > 0
            ? `across ${installationCount} ${installationLabel(installationCount)}`
            : undefined
        }
        fetchedAt={access.fetchedAt}
        isLoading={isLoading}
        onLoad={onLoad}
        status="GitHub App connected"
      />
      {installationCount > 0 ? (
        <div className="mt-5 grid items-start gap-3">
          {access.installations.map((installation) => (
            <InstallationCard installation={installation} key={installation.id} />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          No repositories are installed yet. Public work still reaches the dashboard; private and
          organization work will not.
        </p>
      )}
    </>
  );
}

function InstallationCard({ installation }: { installation: RepositoryInstallationAccess }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="!flex items-center justify-between px-4 py-2.5">
        <CardTitle className="text-sm">
          <a
            className="hover:text-(--fgColor-accent) hover:underline"
            href={`https://github.com/${installation.accountLogin}`}
            rel="noreferrer"
            target="_blank"
          >
            @{installation.accountLogin}
          </a>
        </CardTitle>
        <CardAction className="flex items-center gap-2 self-center">
          <Badge variant="secondary">{installation.repositoryCount}</Badge>
          <Button asChild size="sm" variant="ghost">
            <a href={installation.manageUrl} rel="noreferrer" target="_blank">
              Manage
            </a>
          </Button>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="px-0">
        <p className="px-4 py-2 text-xs text-muted-foreground">
          {installation.repositorySelection === "all"
            ? "All repositories, including new ones"
            : "Selected repositories only"}
        </p>
        {installation.permissions.length > 0 ? (
          <dl className="border-t">
            {installation.permissions.map((permission) => (
              <div
                className="flex items-baseline justify-between gap-4 px-4 py-1.5 text-xs"
                key={permission.name}
              >
                <dt className="min-w-0 truncate">{formatPermission(permission.name)}</dt>
                <dd className="shrink-0 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {permission.level}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            No permissions reported.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function PersonalTokenAccess({
  access,
  isLoading,
  onLoad,
}: {
  access: PersonalTokenRepositoryAccess;
  isLoading: boolean;
  onLoad: () => void;
}) {
  const isFineGrained = access.source === "fine-grained";
  return (
    <>
      <AccessOverview
        count={access.repositoryCount}
        fetchedAt={access.fetchedAt}
        isLoading={isLoading}
        onLoad={onLoad}
        status={`${credentialName(access.source)} connected`}
      />
      <Card className="mt-5 gap-0 overflow-hidden py-0">
        <CardHeader className="!flex items-center justify-between px-4 py-2.5">
          <CardTitle className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {isFineGrained ? "Permissions" : "Scopes"}
          </CardTitle>
          <CardAction className="self-center">
            <Button asChild size="sm" variant="ghost">
              <a href={tokenSettingsUrl(access.source)} rel="noreferrer" target="_blank">
                Manage
              </a>
            </Button>
          </CardAction>
        </CardHeader>
        <Separator />
        <CardContent className="px-4 py-3">
          {isFineGrained ? (
            <p className="text-sm text-muted-foreground">
              GitHub&apos;s API does not expose this token&apos;s permissions or repository
              selection. Public repositories stay readable either way.
            </p>
          ) : access.scopes.length > 0 ? (
            <div aria-label="Granted token scopes" className="flex flex-wrap gap-1.5">
              {access.scopes.map((scope) => (
                <Badge className="font-mono font-normal" key={scope} variant="outline">
                  {scope}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No scopes granted. Public repositories stay readable.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function AccessOverview({
  count,
  detail,
  fetchedAt,
  isLoading,
  onLoad,
  status,
}: {
  count: number;
  detail?: string;
  fetchedAt: string;
  isLoading: boolean;
  onLoad: () => void;
  status: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--fgColor-success)" />
          <span className="truncate">{status}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <span>Checked {formatRelativeTime(fetchedAt)}</span>
          <Button
            aria-label="Refresh access details"
            disabled={isLoading}
            onClick={onLoad}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <RefreshCwIcon className={isLoading ? "animate-spin motion-reduce:animate-none" : ""} />
          </Button>
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          aria-label={`${count} ${repositoryLabel(count)}`}
          className="text-4xl leading-none font-semibold tracking-tight tabular-nums"
        >
          {count}
        </span>
        <span className="text-sm text-muted-foreground">
          {repositoryLabel(count)} visible{detail ? ` ${detail}` : ""}
        </span>
      </p>
    </section>
  );
}

function AccessSkeleton() {
  return (
    <section aria-label="Loading access details">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-3 h-9 w-32" />
      <Skeleton className="mt-5 h-28 w-full" />
    </section>
  );
}

function credentialName(source: TokenSource): string {
  if (source === "app") return "GitHub App";
  return source === "fine-grained" ? "Fine-grained token" : "Token (classic)";
}

function tokenSettingsUrl(source: Exclude<TokenSource, "app">): string {
  return source === "fine-grained"
    ? "https://github.com/settings/personal-access-tokens"
    : "https://github.com/settings/tokens";
}

function formatPermission(permission: string): string {
  return permission.replaceAll("_", " ");
}

function repositoryLabel(count: number): string {
  return count === 1 ? "repository" : "repositories";
}

function installationLabel(count: number): string {
  return count === 1 ? "installation" : "installations";
}
