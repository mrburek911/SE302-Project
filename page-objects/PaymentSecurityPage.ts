import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Payment security page (Sigurnost plaćanja).
 */
export class PaymentSecurityPage extends BasePage {
  private readonly heading: Locator;
  private readonly helpBlock: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = this.page.getByRole("heading", { name: /sigurnost plaćanja/i }).first();
    // The page typically includes "Trebate pomoć?" block with help links.
    this.helpBlock = this.page.getByText(/trebate pomoć/i).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/Sigurnost-placanja");
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async hasHelpBlock(): Promise<boolean> {
    return this.helpBlock.isVisible();
  }
}
