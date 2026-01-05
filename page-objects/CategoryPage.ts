import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ProductPage } from "./ProductPage";

export class CategoryPage extends BasePage {
  private readonly productLinkCandidates: Locator;

  constructor(page: Page) {
    super(page);

    // On category listings, product titles are typically links to /p/<SKU>.
    // Scope to main to avoid header/footer links.
    this.productLinkCandidates = this.page.locator("main a[href*='/p/']");
  }

  async openElectricalPowerTools(): Promise<void> {
    await this.goto("/bs/alati-i-masine/elektricni-rucni-alati/c/10272");
    await this.acceptCookiesIfPresent();
  }

  async getProductLinkCount(): Promise<number> {
    return this.productLinkCandidates.count();
  }

  /**
   * Tries to open a product that has an "Add to cart" capability.
   * This avoids flakiness when the first product is out-of-stock.
   */
  async openFirstPurchasableProduct(maxAttempts = 10): Promise<ProductPage> {
    const total = await this.productLinkCandidates.count();
    const attempts = Math.min(total, maxAttempts);

    for (let i = 0; i < attempts; i++) {
      const href = await this.productLinkCandidates.nth(i).getAttribute("href");
      if (!href) continue;

      await this.page.goto(href.startsWith("http") ? href : `https://www.ekupi.ba${href}`, {
        waitUntil: "domcontentloaded"
      });
      await this.acceptCookiesIfPresent();

      const product = new ProductPage(this.page);

      // Ensure we are on a proper PDP (title present) before CTA checks.
      try {
        await product.waitForTitle();
      } catch {
        await this.page.goBack({ waitUntil: "domcontentloaded" });
        await this.acceptCookiesIfPresent();
        continue;
      }

      if (await product.hasAddToCartButton()) {
        return product;
      }

      await this.page.goBack({ waitUntil: "domcontentloaded" });
      await this.acceptCookiesIfPresent();
    }

    const firstHref = await this.productLinkCandidates.first().getAttribute("href");
    if (!firstHref) throw new Error("No product links found on category page.");
    await this.page.goto(firstHref.startsWith("http") ? firstHref : `https://www.ekupi.ba${firstHref}`, {
      waitUntil: "domcontentloaded"
    });
    await this.acceptCookiesIfPresent();
    return new ProductPage(this.page);
  }


  /**
   * Navigates pagination by clicking the visible page number (e.g., 2, 3, 4...).
   *
   * Note: On ekupi listing pages the query parameter is zero-based:
   * visible page 2 => ?page=1, visible page 3 => ?page=2, etc.
   */
  async goToListingPage(visiblePageNumber: number): Promise<void> {
    if (visiblePageNumber < 2) {
      throw new Error("goToListingPage expects a visible page number >= 2.");
    }

    const pageParam = visiblePageNumber - 1;
    const link = this.page.locator("main").getByRole("link", { name: new RegExp(`^${visiblePageNumber}$`) }).first();
    await link.waitFor({ state: "visible" });

    await Promise.all([
      this.page.waitForURL(new RegExp(`[?&]page=${pageParam}(?:&|$)`), { timeout: 30_000 }),
      link.click()
    ]);

    await this.acceptCookiesIfPresent();
  }

}
