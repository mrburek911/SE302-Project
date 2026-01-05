import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Search Results page.
 *
 * NOTE: The "Dostupno odmah" facet checkbox is rendered as a visually-hidden <input> (sr-only).
 * Clicking the input directly can fail with "Element is outside of the viewport".
 * Reliable approach: click the *label/row* that contains the text and then assert the input becomes checked.
 */
export class SearchResultsPage extends BasePage {
  private readonly resultsHeading: Locator;

  // Hidden input (sr-only). We will NOT click it directly.
  private readonly availableNowCheckbox: Locator;

  // Visible click target for the facet (label/row).
  private readonly availableNowClickTarget: Locator;

  private readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);

    this.resultsHeading = this.page.getByRole("heading", { level: 1 }).first();

    // This is the hidden checkbox input (sr-only) used by the facet component.
    this.availableNowCheckbox = this.page
      .locator("input[type='checkbox'].js-facet-checkbox")
      .filter({ has: this.page.locator("xpath=ancestor::*[contains(., 'Dostupno odmah')]") })
      .first();

    // Click on a visible target (label/row/spans) containing the facet text.
    // We prioritize label elements, then any element containing the text.
    const label = this.page.locator("label", { hasText: /dostupno odmah/i }).first();
    const anyText = this.page.getByText(/dostupno odmah/i).first();
    this.availableNowClickTarget = label.or(anyText);

    // "Potvrdi" applies facet changes (may trigger navigation or XHR).
    this.confirmButton = this.page.getByRole("button", { name: /^potvrdi$/i }).first().or(
      this.page.getByText(/^potvrdi$/i).first()
    );
  }

  async open(query: string): Promise<void> {
    await this.goto(`/bs/search/?text=${encodeURIComponent(query)}`);
    await this.acceptCookiesIfPresent();
  }

  async isLoaded(expectedQuery?: string): Promise<boolean> {
    try {
      await this.resultsHeading.waitFor({ state: "visible", timeout: 15_000 });
      if (expectedQuery) {
        const text = (await this.resultsHeading.innerText()).trim().toLowerCase();
        return text.includes(expectedQuery.toLowerCase());
      }
      return true;
    } catch {
      return false;
    }
  }

  async applyAvailableNowFilter(): Promise<void> {
    // Ensure the facet click target is in view and click it (do NOT click the hidden input).
    await this.availableNowClickTarget.scrollIntoViewIfNeeded();
    await this.availableNowClickTarget.click({ timeout: 15_000 });

    // Assert the underlying hidden checkbox is checked (works even if the input is sr-only).
    // If the input selector fails on some template, we fall back to validating that "Aktivni filteri"
    // contains "Dostupno odmah" after applying.
    const checkboxVisibleInDom = await this.availableNowCheckbox.count().catch(() => 0);

    // Click "Potvrdi" to apply the filter (some pages apply on change; this is the stable path).
    await this.confirmButton.scrollIntoViewIfNeeded();
    await Promise.all([
      // Navigation is not guaranteed; do not fail if it doesn't navigate.
      this.page.waitForLoadState("domcontentloaded").catch(() => {}),
      this.confirmButton.click({ timeout: 15_000 })
    ]);

    if (checkboxVisibleInDom > 0) {
      await expect(this.availableNowCheckbox).toBeChecked({ timeout: 10_000 });
      return;
    }

    // Fallback: validate active filter text is present.
    await expect(this.page.getByText(/aktivni filteri/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(this.page.getByText(/dostupno odmah/i).first()).toBeVisible({ timeout: 15_000 });
  }
}
