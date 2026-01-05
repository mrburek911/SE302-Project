import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CartPage extends BasePage {
  private readonly emptyCartMessage: Locator;
  private readonly clearCartLink: Locator;

  constructor(page: Page) {
    super(page);

    this.emptyCartMessage = this.page.getByText(/vaša košarica je prazna/i).first();
    this.clearCartLink = this.page.getByRole("link", { name: /isprazni košaricu/i }).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/cart");
    await this.acceptCookiesIfPresent();
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyCartMessage.isVisible();
  }

  async clearCartBestEffort(): Promise<void> {
    // Attempt to clear cart; ignore if not present.
    try {
      if (await this.clearCartLink.isVisible({ timeout: 1500 })) {
        await this.clearCartLink.click();

        // Try common confirmation buttons.
        const confirmCandidates = [
          this.page.getByRole("button", { name: /da/i }),
          this.page.getByRole("button", { name: /potvrdi/i }),
          this.page.getByRole("button", { name: /isprazni/i }),
          this.page.getByRole("button", { name: /ok/i })
        ];

        for (const btn of confirmCandidates) {
          if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
            await btn.click();
            break;
          }
        }
      }
    } catch {
      // ignore
    }

    // Wait briefly for either empty message or stable DOM.
    await this.emptyCartMessage.isVisible({ timeout: 6000 }).catch(() => {});
  }

  async getCartItemTitles(): Promise<string[]> {
    const productLinks = this.page.locator("main a[href*='/p/']");
    const count = await productLinks.count();
    const titles: string[] = [];
    for (let i = 0; i < Math.min(count, 20); i++) {
      const t = (await productLinks.nth(i).innerText()).trim();
      if (t) titles.push(t);
    }
    return titles;
  }
}
