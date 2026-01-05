import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  private readonly homeMarker: Locator;

  constructor(page: Page) {
    super(page);

    // Use a simple marker that should exist on the page: the category link "Elektronika" exists in nav.
    this.homeMarker = this.page.getByRole("link", { name: /^Elektronika$/i }).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/");
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(): Promise<boolean> {
    try {
      return await this.homeMarker.isVisible({ timeout: 8000 });
    } catch {
      return false;
    }
  }
}
