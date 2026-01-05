import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class OrderTrackingPage extends BasePage {
  private readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = this.page.getByRole("heading", { name: /praćenje narudžbe/i }).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/order-tracking");
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }
}
