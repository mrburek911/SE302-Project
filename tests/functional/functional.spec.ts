import { test, expect } from "@playwright/test";
import { LoginPage } from "../../page-objects/LoginPage";
import { SearchResultsPage } from "../../page-objects/SearchResultsPage";
import { HelpCenterPage } from "../../page-objects/HelpCenterPage";
import { CategoryPage } from "../../page-objects/CategoryPage";
import { PhoneOrdersPage } from "../../page-objects/PhoneOrdersPage";
import { ContactPage } from "../../page-objects/ContactPage";
import { PaymentMethodsPage } from "../../page-objects/PaymentMethodsPage";
import { PaymentSecurityPage } from "../../page-objects/PaymentSecurityPage";
import { DeliveryInfoPage } from "../../page-objects/DeliveryInfoPage";
import { ComplaintsPage } from "../../page-objects/ComplaintsPage";

test.describe("Functional tests (ekupi.ba)", () => {
  test("FNC-001: Login form rejects invalid email format (HTML5 validation)", async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();

    await login.fillLoginEmail("not-an-email");
    expect(await login.isLoginEmailValid()).toBe(false);
  });

  test("FNC-002: Registration terms link opens 'Opći uslovi poslovanja'", async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();

    const termsPage = await login.openTermsAndConditions();

    await expect(termsPage).toHaveURL(/\/Opci-uslovi-poslovanja/i);
    await expect(termsPage.locator("main")).toContainText(/Op(ć|c)i uslovi poslovanja/i);
  });

  test("FNC-003: Help Center opens the 'Kako se registrovati' article", async ({ page }) => {
    const help = new HelpCenterPage(page);
    await help.open();
    await help.openHowToRegisterArticle();

    await expect(page).toHaveURL(/\/Kako-se-registrovati/i);
    await expect(page.locator("main")).toContainText(/Sam proces registracije/i);
  });

  test("FNC-004: 'Narudžbe telefonom ili e-mailom' page shows support phone and email", async ({ page }) => {
  const help = new PhoneOrdersPage(page);
  await help.open();

  expect(await help.isLoaded()).toBe(true);
  expect(await help.hasSupportContacts()).toBe(true);
});

  test("FNC-005: Category pagination navigates to the next page", async ({ page }) => {
    const category = new CategoryPage(page);
    await category.openElectricalPowerTools();
    await category.acceptCookiesIfPresent();

    // Navigate to visible page 2 (ekupi uses zero-based query param, so it becomes ?page=1)
    await category.goToListingPage(2);

    await expect(page).toHaveURL(/\/c\/10272.*[?&]page=1/i);
    await expect(page.locator("main")).toContainText(/pronađenih proizvoda/i);
  });

test("FNC-006: Contact page loads and shows support email and phone", async ({ page }) => {
  const contact = new ContactPage(page);
  await contact.open();

  expect(await contact.isLoaded()).toBe(true);
  expect(await contact.hasCoreContacts()).toBe(true);
});

test("FNC-007: Payment methods page loads and mentions key payment options", async ({ page }) => {
  const payments = new PaymentMethodsPage(page);
  await payments.open();

  expect(await payments.isLoaded()).toBe(true);
  expect(await payments.hasPaymentOptionKeywords()).toBe(true);
});

test("FNC-008: Payment security page loads and contains help block", async ({ page }) => {
  const security = new PaymentSecurityPage(page);
  await security.open();

  expect(await security.isLoaded()).toBe(true);
  expect(await security.hasHelpBlock()).toBe(true);
});

test("FNC-009: Delivery info page loads and mentions the 30 KM delivery-to-apartment price", async ({ page }) => {
  const delivery = new DeliveryInfoPage(page);
  await delivery.open();

  expect(await delivery.isLoaded()).toBe(true);
  expect(await delivery.mentionsDeliveryPrice()).toBe(true);
});

test("FNC-010: Complaints page loads and shows the intro guidance text", async ({ page }) => {
  const complaints = new ComplaintsPage(page);
  await complaints.open();

  expect(await complaints.isLoaded()).toBe(true);
  expect(await complaints.hasIntroText()).toBe(true);
});

});
