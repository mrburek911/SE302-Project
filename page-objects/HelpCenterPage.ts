import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * /bs/cesta-pitanja
 */
export class HelpCenterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto("/bs/cesta-pitanja");
    await this.acceptCookiesIfPresent();
    // The page title is not guaranteed to be in an H1, so use the visible page text.
    await this.page.getByText(/česta pitanja/i).first().waitFor({ state: "visible" });
  }

  async openHowToRegisterArticle(): Promise<void> {
    const link = this.page.getByRole("link", { name: /kako se registrovati/i }).first();
    await link.waitFor({ state: "visible" });

    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      link.click()
    ]);

    await this.acceptCookiesIfPresent();
  }
}
