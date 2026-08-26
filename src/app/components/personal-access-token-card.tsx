import { useCallback, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { TokenSource } from "@/auth/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SecurityNote } from "@/app/components/security-note";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FINE_GRAINED_TOKEN_URL =
  "https://github.com/settings/personal-access-tokens/new?name=Octobase&description=Read-only%20dashboard%20access&expires_in=90&issues=read&pull_requests=read&checks=read&statuses=read";
const CLASSIC_TOKEN_URL =
  "https://github.com/settings/tokens/new?description=Octobase%20dashboard%20access&scopes=repo";

type PersonalAccessTokenSource = Exclude<TokenSource, "app">;

interface PersonalAccessTokenCardProps {
  isConnecting: boolean;
  onConnect: (accessToken: string, source: PersonalAccessTokenSource) => Promise<void>;
}

export function PersonalAccessTokenCard({ isConnecting, onConnect }: PersonalAccessTokenCardProps) {
  const [accessToken, setAccessToken] = useState("");
  const [validationError, setValidationError] = useState<string>();

  const updateAccessToken = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setAccessToken(event.target.value);
    setValidationError(undefined);
  }, []);
  const connect = useCallback(async (): Promise<void> => {
    const token = accessToken.trim();
    const source = personalAccessTokenSource(token);
    if (!source) {
      setValidationError("Paste a fine-grained token (github_pat_) or token (classic, ghp_).");
      return;
    }
    await onConnect(token, source);
    setAccessToken("");
  }, [accessToken, onConnect]);
  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      event.preventDefault();
      if (isConnecting || !accessToken.trim()) return;
      void connect();
    },
    [accessToken, connect, isConnecting],
  );

  return (
    <Card className="gap-4 border-(--borderColor-accent-muted)">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Use a personal access token</CardTitle>
          <Badge variant="success">Fastest</Badge>
        </div>
        <CardAction>
          <SecurityNote />
        </CardAction>
        <CardDescription>
          Two steps, no admin approval. The token is handed to the extension’s background worker on
          this device and is never shown on this page again.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ol className="flex flex-col gap-3">
          <SetupStep
            number={1}
            title="Create a read-only token on GitHub"
            hint="Fine-grained tokens are recommended. Pick All repositories (or just the ones you need); Issues, Pull requests, Checks, and Commit statuses are preselected as read-only."
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={FINE_GRAINED_TOKEN_URL} rel="noreferrer" target="_blank">
                  Create a fine-grained token on GitHub
                  <ExternalLink aria-hidden="true" />
                </a>
              </Button>
              <Button asChild className="px-0 text-muted-foreground" size="sm" variant="link">
                <a href={CLASSIC_TOKEN_URL} rel="noreferrer" target="_blank">
                  Create a token (classic) on GitHub
                </a>
              </Button>
            </div>
          </SetupStep>
          <SetupStep
            number={2}
            title="Paste it here"
            hint="A token (classic) needs the repo scope for private repositories, which also grants write access."
          >
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
              <Input
                aria-describedby={validationError ? "personal-access-token-error" : undefined}
                aria-invalid={Boolean(validationError)}
                aria-label="Personal access token"
                autoComplete="off"
                className="sm:flex-1"
                id="octobase-personal-access-token"
                onChange={updateAccessToken}
                placeholder="github_pat_… or ghp_…"
                spellCheck={false}
                type="password"
                value={accessToken}
              />
              <Button
                className="sm:shrink-0"
                disabled={isConnecting || !accessToken.trim()}
                type="submit"
              >
                {isConnecting ? "Connecting…" : "Connect token"}
              </Button>
            </form>
            {validationError ? (
              <p className="text-sm text-destructive" id="personal-access-token-error" role="alert">
                {validationError}
              </p>
            ) : null}
          </SetupStep>
        </ol>
      </CardContent>
    </Card>
  );
}

function SetupStep({
  children,
  hint,
  number,
  title,
}: {
  children: ReactNode;
  hint: string;
  number: number;
  title: string;
}) {
  return (
    <li className="grid grid-cols-[1.5rem_1fr] gap-x-3 gap-y-2">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
      >
        {number}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="col-start-2 flex flex-col gap-2">{children}</div>
    </li>
  );
}

function personalAccessTokenSource(token: string): PersonalAccessTokenSource | undefined {
  if (token.startsWith("github_pat_")) return "fine-grained";
  if (token.startsWith("ghp_")) return "classic";
  return undefined;
}
