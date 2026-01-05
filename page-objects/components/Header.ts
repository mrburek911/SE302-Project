import type { Locator, Page } from "@playwright/test";

/**
 * Common header actions/reads (cart, navigation links).
 *
 * Note on ekupi.ba:
 * The cart entry can appear multiple times in DOM (e.g., header + menu) and the first match may be hidden.
 * We therefore resolve the first *visible* match from a set of candidate locators.
 */
export class Header {
  private readonly page: Page;

  private readonly cartCandidates: Locator[];
  private readonly loginLink: Locator;
  private readonly orderTrackingLink: Locator;
  private readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;

    // Candidates for cart trigger.
    // 1) Accessible link/button containing "košaric"
    // 2) Anchor to /bs/cart or /cart
    // 3) Text match "Artikli u košarici" (role may not be link in some variants)
    // 4) Header-scoped fallback
    this.cartCandidates = [
      this.page.getByRole("link", { name: /košaric/i }),
      this.page.getByRole("button", { name: /košaric/i }),
      this.page.locator("a[href*='/bs/cart'], a[href*='/cart']"),
      this.page.getByText(/artikli\s+u\s+košarici/i),
      this.page.locator("header").locator("a,button").filter({ hasText: /košaric/i })
    ];

    this.loginLink = this.page.getByRole("link", { name: /prijava\s*\/\s*registracija/i }).first();
    this.orderTrackingLink = this.page.getByRole("link", { name: /praćenje narudžbe/i }).first();

    this.logo = this.page.getByRole("img", { name: /ekupi/i }).first();
  }

  private async firstVisible(locator: Locator, maxScan = 6): Promise<Locator | null> {
    let count = 0;
    try {
      count = await locator.count();
    } catch {
      count = 0;
    }
    const limit = Math.min(count, maxScan);
    for (let i = 0; i < limit; i++) {
      const candidate = locator.nth(i);
      const visible = await candidate.isVisible({ timeout: 1500 }).catch(() => false);
      if (visible) return candidate;
    }
    return null;
  }

  private async resolveCartTrigger(): Promise<Locator | null> {
    for (const loc of this.cartCandidates) {
      const visible = await this.firstVisible(loc);
      if (visible) return visible;
    }
    return null;
  }

  async isLogoVisible(): Promise<boolean> {
    return this.logo.isVisible();
  }

  async isLoginLinkVisible(): Promise<boolean> {
    return this.loginLink.isVisible();
  }

  async isOrderTrackingVisible(): Promise<boolean> {
    return this.orderTrackingLink.isVisible();
  }

  async isCartVisible(): Promise<boolean> {
    return (await this.resolveCartTrigger()) !== null;
  }

  async getCartItemsCount(): Promise<number> {
    // Best-effort parsing from visible cart element (if it includes a number).
    const cart = await this.resolveCartTrigger();
    if (!cart) return 0;

    const text = (await cart.innerText().catch(() => "")).trim();
    const match = text.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  async goToCart(): Promise<void> {
    const cart = await this.resolveCartTrigger();
    if (!cart) throw new Error("Cart trigger not found in header.");
    await cart.click();
  }

  async goToOrderTracking(): Promise<void> {
    await this.orderTrackingLink.click();
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }
}
