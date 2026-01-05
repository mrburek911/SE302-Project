import { test, expect } from "@playwright/test";
import { HomePage } from "../../page-objects/HomePage";
import { CartPage } from "../../page-objects/CartPage";
import { OrderTrackingPage } from "../../page-objects/OrderTrackingPage";
import { CategoryPage } from "../../page-objects/CategoryPage";
import { ProductPage } from "../../page-objects/ProductPage";
import { FaqPage } from "../../page-objects/FaqPage";

test.describe("Smoke tests (ekupi.ba)", () => {
  test("SMK-001: Homepage loads and key header elements are visible", async ({ page }) => {
    const home = new HomePage(page);
    await home.open();

    expect(await home.isLoaded()).toBe(true);

    expect(await home.header.isLogoVisible()).toBe(true);
    expect(await home.header.isOrderTrackingVisible()).toBe(true);
    expect(await home.header.isLoginLinkVisible()).toBe(true);

    // Cart element can render differently; resolve among candidates (Header handles duplicates/hidden nodes).
    expect(await home.header.isCartVisible()).toBe(true);
  });

  test("SMK-002: Cart page opens and is empty for a fresh session", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.open();

    expect(await cart.isEmpty()).toBe(true);
  });

  test("SMK-003: Order tracking page opens", async ({ page }) => {
    const orderTracking = new OrderTrackingPage(page);
    await orderTracking.open();

    expect(await orderTracking.isLoaded()).toBe(true);
  });

  test("SMK-004: Category listing loads and shows products", async ({ page }) => {
    const category = new CategoryPage(page);
    await category.openElectricalPowerTools();

    const productLinkCount = await category.getProductLinkCount();
    expect(productLinkCount).toBeGreaterThan(0);
  });
test("SMK-005: FAQ page loads and shows customer support contacts", async ({ page }) => {
  const faq = new FaqPage(page);
  await faq.open();

  // Page should render the FAQ heading and show support contact details.
  expect(await faq.isLoaded()).toBe(true);
  expect(await faq.hasSupportContacts()).toBe(true);
});
});
