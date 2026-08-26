import { expect, test } from "./fixtures/extension";

test.describe("pinned repositories", () => {
  test("pins from open work, from typed input, and jumps with a digit key", async ({
    context,
    connectAccount,
  }) => {
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();

    const trigger = page.getByRole("button", { name: "Pin a repository" });
    const popover = page.getByRole("dialog");

    await trigger.click();
    // Opening the popover is enough to start typing.
    await expect(popover.getByLabel("Repository to pin")).toBeFocused();
    await popover.getByRole("button", { name: "octo/repo" }).click();
    await expect(popover).toBeHidden();

    // The list reaches repositories the dashboard snapshot never mentions.
    await trigger.click();
    await popover.getByLabel("Repository to pin").fill("secret");
    const listed = popover.getByRole("button", { name: /octo\/secret-plans/ });
    await expect(listed).toBeVisible();
    await expect(listed.getByText("Private")).toBeVisible();
    await listed.click();
    await expect(popover).toBeHidden();

    // Repositories this account contributes to are offered before anything is typed.
    await trigger.click();
    await expect(popover.getByRole("button", { name: /vercel\/next\.js/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(popover).toBeHidden();

    async function pinByName(name: string): Promise<void> {
      await trigger.click();
      await popover.getByLabel("Repository to pin").fill(name);
      await popover.getByRole("button", { name: "Pin", exact: true }).click();
      await expect(popover).toBeHidden();
    }

    await pinByName("vercel/next.js");
    await pinByName("https://github.com/facebook/react");

    const pinned = page.getByRole("complementary", { name: "Pinned" });
    await expect(pinned.getByRole("link", { name: "next.js" })).toBeVisible();
    await expect(pinned.getByRole("link", { name: "react" })).toHaveAttribute(
      "href",
      "https://github.com/facebook/react",
    );

    await page.getByRole("button", { name: "Edit pins" }).click();
    await page.getByRole("button", { name: "Move vercel/next.js earlier" }).click();
    await expect(pinned.getByRole("listitem").nth(1)).toContainText("next.js");
    await page.getByRole("button", { name: "Done" }).click();

    // The pins survive a remount, and each digit opens its repository in a new tab.
    await page.reload();
    await expect(pinned.getByRole("listitem").nth(1)).toContainText("next.js");
    const opened = context.waitForEvent("page");
    await page.keyboard.press("2");
    await expect(await opened).toHaveURL("https://github.com/vercel/next.js");
    await expect(page).toHaveURL("https://github.com/");
  });

  test("keeps a long repository name inside its container", async ({
    context,
    connectAccount,
    github,
  }) => {
    const longName = "saadjs/chatgpt-sites-simple-workout-tracker";
    github.setViewerRepositories({
      rateLimit: null,
      viewer: {
        login: "octocat",
        repositories: {
          nodes: [
            {
              id: "long",
              nameWithOwner: longName,
              url: `https://github.com/${longName}`,
              isPrivate: true,
            },
          ],
        },
        repositoriesContributedTo: { nodes: [] },
      },
    });
    await connectAccount();
    const page = await context.newPage();
    await page.goto("https://github.com/");
    await expect(page.getByRole("tab", { name: /Needs your attention/ })).toBeVisible();

    const popover = page.getByRole("dialog");
    await page.getByRole("button", { name: "Pin a repository" }).click();
    const option = popover.getByRole("button", { name: new RegExp("workout-tracker") });
    await expect(option).toBeVisible();

    const popoverBox = await popover.boundingBox();
    const optionBox = await option.boundingBox();
    const badgeBox = await popover.getByText("Private").boundingBox();
    expect(optionBox!.x + optionBox!.width).toBeLessThanOrEqual(popoverBox!.x + popoverBox!.width);
    expect(badgeBox!.x + badgeBox!.width).toBeLessThanOrEqual(popoverBox!.x + popoverBox!.width);
    // The full name stays reachable once the visible text is cut.
    await expect(option).toHaveAttribute("title", longName);

    await option.click();
    await expect(popover).toBeHidden();
    const aside = page.getByRole("complementary", { name: "Pinned" });
    const overflow = await aside.evaluate((node) => node.scrollWidth - node.clientWidth);
    expect(overflow).toBe(0);
  });
});
