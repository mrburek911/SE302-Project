import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Delivery information page (Brza i pouzdana dostava).
 */
export class DeliveryInfoPage extends BasePage {
  private readonly heading: Locator;
  private readonly price30km: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = this.page.getByRole("heading", { name: /brza i pouzdana dostava/i }).first();
    this.price30km = this.page.getByText(/30\s*KM/i).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/Brza-i-pouzdana-dostava");
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async mentionsDeliveryPrice(): Promise<boolean> {
    return this.price30km.isVisible();
  }
}
