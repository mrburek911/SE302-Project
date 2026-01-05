import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * "Narudžbe telefonom ili e-mailom" help page.
 * Stable content (no stock/cart) and includes support contacts.
 */
export class PhoneOrdersPage extends BasePage {
  private readonly heading: Locator;
  private readonly supportEmail: Locator;
  private readonly supportPhone: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = this.page.getByRole("heading", { name: /narudžbe telefonom ili e-mailom/i }).first();
    this.supportEmail = this.page.getByText(/podrska@ekupi\.ba/i).first();
    this.supportPhone = this.page.getByText(/033\s*755\s*911/).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/Narudzbe-telefonom-ili-e-mailom");
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(): Promise<boolean> {
    return this.heading.isVisible();
  }

  async hasSupportContacts(): Promise<boolean> {
    const emailOk = await this.supportEmail.isVisible().catch(() => false);
    const phoneOk = await this.supportPhone.isVisible().catch(() => false);
    return emailOk && phoneOk;
  }
}
