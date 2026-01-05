import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * /bs/login
 *
 * Contains two forms on the same page:
 * - Existing customer login ("Postojeći kupac")
 * - Registration ("Napravite profil")
 */
export class LoginPage extends BasePage {
  // Login form (existing customer)
  private readonly loginForm: Locator;
  private readonly loginEmail: Locator;
  private readonly loginPassword: Locator;
  private readonly loginSubmit: Locator;

  // Registration form
  private readonly registerForm: Locator;
  private readonly registerConsentCheckbox: Locator;
  private readonly termsLink: Locator;

  constructor(page: Page) {
    super(page);

    this.loginForm = page.locator("form", {
      has: page.getByRole("button", { name: /prijava/i })
    }).first();

    this.loginEmail = this.loginForm.locator("input[type='email']").first();
    this.loginPassword = this.loginForm.locator("input[type='password']").first();
    this.loginSubmit = this.loginForm.getByRole("button", { name: /prijava/i }).first();

    this.registerForm = page.locator("form", {
      has: page.getByRole("button", { name: /registriraj se/i })
    }).first();

    // The registration consent checkbox label begins with "Prihvatam ..."
    this.registerConsentCheckbox = this.registerForm.getByRole("checkbox", { name: /prihvatam/i }).first();

    // Link text varies by grammar ("Opće uslove..." / "Općim uslovima..."), so match loosely.
    this.termsLink = this.registerForm.getByRole("link", { name: /op[ćc].*uslov/i }).first();
  }

  async open(): Promise<void> {
    await this.goto("/bs/login");
    await this.acceptCookiesIfPresent();
    // Ensure both sections are present
    await this.page.getByText(/postoje[ćc]i kupac/i).first().waitFor({ state: "visible" });
    await this.page.getByText(/napravite profil/i).first().waitFor({ state: "visible" });
  }

  async fillLoginEmail(value: string): Promise<void> {
    await this.loginEmail.fill(value);
  }

  async fillLoginPassword(value: string): Promise<void> {
    await this.loginPassword.fill(value);
  }

  async clickLogin(): Promise<void> {
    await this.loginSubmit.click();
  }

  /**
   * Returns HTML5 validity of the login email field.
   * This is deterministic and does not hit the backend.
   */
  async isLoginEmailValid(): Promise<boolean> {
    return await this.loginEmail.evaluate((el) => (el as HTMLInputElement).validity.valid);
  }

  async isRegistrationConsentChecked(): Promise<boolean> {
    // If the checkbox is not found for any reason, fail fast with a clear error.
    await this.registerConsentCheckbox.waitFor({ state: "attached" });
    return await this.registerConsentCheckbox.isChecked();
  }

  async toggleRegistrationConsent(): Promise<void> {
    await this.registerConsentCheckbox.scrollIntoViewIfNeeded();
    await this.registerConsentCheckbox.click({ force: true });
  }

  /**
   * Opens "Opći uslovi poslovanja" from the registration consent line.
   * Returns the page that ended up showing the content (same tab or popup).
   */
  async openTermsAndConditions(): Promise<Page> {
    await this.termsLink.waitFor({ state: "visible" });

    const popupPromise = this.page.waitForEvent("popup").catch(() => null);
    const navPromise = this.page.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(() => null);

    await this.termsLink.click();

    const popup = await popupPromise;
    if (popup) {
      await popup.waitForLoadState("domcontentloaded");
      return popup;
    }

    await navPromise;
    return this.page;
  }
}
