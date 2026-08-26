import { PersonalAccessTokenCard } from "@/app/components/personal-access-token-card";
import type { TokenSource } from "@/auth/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConnectPanelProps {
  isConnectingPersonalAccessToken: boolean;
  isStartingGitHubApp: boolean;
  onConnectGitHubApp: () => void;
  onConnectPersonalAccessToken: (
    accessToken: string,
    source: Exclude<TokenSource, "app">,
  ) => Promise<void>;
}

export function ConnectPanel({
  isConnectingPersonalAccessToken,
  isStartingGitHubApp,
  onConnectGitHubApp,
  onConnectPersonalAccessToken,
}: ConnectPanelProps) {
  return (
    <section className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-5 pb-16">
      <div className="flex flex-col gap-1.5 text-center">
        <h2 className="text-xl font-semibold">Connect Octobase to GitHub</h2>
        <p className="text-sm text-muted-foreground">
          Octobase reads your review requests and open work. Pick how it should get read-only
          access.
        </p>
      </div>

      <PersonalAccessTokenCard
        isConnecting={isConnectingPersonalAccessToken}
        onConnect={onConnectPersonalAccessToken}
      />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GitHubAppCard isStarting={isStartingGitHubApp} onConnect={onConnectGitHubApp} />
    </section>
  );
}

function GitHubAppCard({ isStarting, onConnect }: { isStarting: boolean; onConnect: () => void }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base">Install the Octobase GitHub App</CardTitle>
        <CardDescription>
          Authorize the app with a one-time device code — no token to manage, and access can be
          revoked from GitHub at any time. Private repositories need a second step, and some
          organizations require an owner to approve the app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button disabled={isStarting} onClick={onConnect} type="button" variant="outline">
          {isStarting ? "Starting…" : "Install GitHub App"}
        </Button>
      </CardContent>
    </Card>
  );
}
