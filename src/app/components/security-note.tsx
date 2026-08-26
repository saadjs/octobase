import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SecurityNote() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="How Octobase handles your GitHub access"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Info aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Your token stays on this device</PopoverTitle>
          <PopoverDescription className="text-xs">
            Octobase has no server and no account. However you connect, the token is stored in your
            browser’s extension storage and is only ever sent to github.com to read your work. It is
            never shown on the page, exposed to page scripts, or sent anywhere else — nobody behind
            Octobase can see it. Requests are read-only, and you can disconnect here or revoke
            access in GitHub at any time.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
