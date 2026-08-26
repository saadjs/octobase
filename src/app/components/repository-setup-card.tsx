import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RepositorySetupCard({
  isChecking,
  isOpening,
  isWaiting,
  onCheck,
  onInstall,
}: {
  isChecking: boolean;
  isOpening: boolean;
  isWaiting: boolean;
  onCheck: () => void;
  onInstall: () => void;
}) {
  return (
    <Card className="mt-6 max-w-xl border-(--borderColor-accent-muted)">
      <CardHeader>
        <CardTitle>Add private repository access</CardTitle>
        <CardDescription>
          Your GitHub account is connected for public work. Install the read-only GitHub App on your
          personal account to include private repositories. GitHub opens with all current and future
          repositories preselected; you can narrow the selection before confirming.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button disabled={isOpening} onClick={onInstall} type="button">
          {isOpening ? "Opening GitHub…" : "Enable repository access"}
        </Button>
        <Button disabled={isChecking} onClick={onCheck} type="button" variant="outline">
          {isChecking ? "Checking access…" : "Check access"}
        </Button>
        {isWaiting ? (
          <p className="text-xs text-muted-foreground">
            Finish installation in GitHub, then return here. You can check access manually.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
