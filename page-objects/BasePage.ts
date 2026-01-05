import type { Page } from "@playwright/test";
import { CookieBanner } from "./components/CookieBanner";
import { Header } from "./components/Header";

export class BasePage {
  protected readonly page: Page;
  readonly cookieBanner: CookieBanner;
  readonly header: Header;

  constructor(page: Page) {
    this.page = page;
    this.cookieBanner = new CookieBanner(page);
    this.header = new Header(page);
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async acceptCookiesIfPresent(): Promise<void> {
    await this.cookieBanner.acceptIfPresent();
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
