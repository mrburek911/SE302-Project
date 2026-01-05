import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Payment methods page (Načini plaćanja).
 * Stable content describing payment options.
 */
export class PaymentMethodsPage extends BasePage {
  private readonly heading: Locator;
  private readonly keywordsJednokratno: Locator;
  private readonly keywordsRate: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = this.page.getByRole("heading", { name: /načini plaćanja/i }).first();
    this.keywordsJednokratno = this.page.getByText(/jednokratno/i).first();
    this.keywordsRate = this.page.getByText(/na rate/i).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/Nacini-placanja");
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async hasPaymentOptionKeywords(): Promise<boolean> {
    const a = await this.keywordsJednokratno.isVisible().catch(() => false);
    const b = await this.keywordsRate.isVisible().catch(() => false);
    return a && b;
  }
}
