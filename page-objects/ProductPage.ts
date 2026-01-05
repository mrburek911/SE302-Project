import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Product Details Page (PDP) abstraction.
 *
 * Important: Some ekupi PDP templates do not expose a semantic <h1> reliably.
 * For smoke stability, we treat the PDP as "ready" when either:
 *  - "Dodaj u košaricu" CTA is visible, OR
 *  - an out-of-stock message is visible, OR
 *  - the "Cijena" label is visible.
 */
export class ProductPage extends BasePage {
  private readonly addToCartCta: Locator;
  private readonly addedToCartToast: Locator;
  private readonly outOfStockText: Locator;
  private readonly priceLabel: Locator;

  constructor(page: Page) {
    super(page);

    const btn = this.page.getByRole("button", { name: /dodaj u košaricu/i });
    const lnk = this.page.getByRole("link", { name: /dodaj u košaricu/i });
    const txt = this.page.getByText(/dodaj u košaricu/i);

    // OR chain keeps this flexible across templates.
    this.addToCartCta = btn.or(lnk).or(txt).first();

    this.addedToCartToast = this.page.getByText(/vaš proizvod je dodan u košaricu/i).first();
    this.outOfStockText = this.page.getByText(/proizvod je nedostupan/i).first();
    this.priceLabel = this.page.getByText(/^cijena$/i).first();
  }

  async open(path: string): Promise<void> {
    await this.goto(path);
    await this.acceptCookiesIfPresent();
  }

  async waitForReady(timeoutMs = 20_000): Promise<void> {
    // Race between the most stable PDP signals.
    await Promise.race([
      this.addToCartCta.waitFor({ state: "visible", timeout: timeoutMs }),
      this.outOfStockText.waitFor({ state: "visible", timeout: timeoutMs }),
      this.priceLabel.waitFor({ state: "visible", timeout: timeoutMs })
    ]);
  }

  async isPurchasable(): Promise<boolean> {
    const out = await this.outOfStockText.isVisible().catch(() => false);
    if (out) return false;

    const ctaVisible = await this.addToCartCta.isVisible().catch(() => false);
    return ctaVisible;
  }

  async addToCart(): Promise<void> {
    await this.addToCartCta.click();
    await this.addedToCartToast.waitFor({ state: "visible", timeout: 20_000 });
  }

  async isAddedToCartConfirmationVisible(): Promise<boolean> {
    return this.addedToCartToast.isVisible();
  }
}
