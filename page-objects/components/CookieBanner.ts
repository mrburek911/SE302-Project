import type { Locator, Page } from "@playwright/test";

/**
 * Handles the cookie consent banner on ekupi.ba.
 * The banner includes buttons like "PRIHVATAM SVE" / "AŽURIRAJ POSTAVKE" / "Prihvati".
 */
export class CookieBanner {
  private readonly page: Page;

  private readonly acceptAllCandidates: Locator[];

  constructor(page: Page) {
    this.page = page;

    // Be permissive: exact markup/roles can vary. Try role-based selectors first, then text-based.
    this.acceptAllCandidates = [
      this.page.getByRole("button", { name: /prihvatam\s*sve/i }),
      this.page.getByRole("button", { name: /^prihvati$/i }),
      this.page.getByRole("button", { name: /accept/i }),
      this.page.getByText(/prihvatam\s*sve/i).first(),
      this.page.getByText(/^prihvati$/i).first()
    ];
  }

  async acceptIfPresent(): Promise<void> {
    for (const candidate of this.acceptAllCandidates) {
      try {
        if (await candidate.isVisible({ timeout: 1500 })) {
          await candidate.click({ timeout: 5000 });
          await this.page.waitForTimeout(250);
          return;
        }
      } catch {
        // Ignore and try next locator.
      }
    }
  }
}
