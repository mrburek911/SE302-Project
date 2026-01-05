import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Complaints / returns page (Reklamacije).
 */
export class ComplaintsPage extends BasePage {
  private readonly heading: Locator;
  private readonly introText: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = this.page.getByRole("heading", { name: /reklamacije/i }).first();
    this.introText = this.page.getByText(/nezadovoljni ste proizvodom/i).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/Reklamacije");
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async hasIntroText(): Promise<boolean> {
    return this.introText.isVisible();
  }
}
