import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPathWithLangBeforeHash,
  getLangFromHref,
  getLangFromNavigator,
  resolvePreferredLang,
} from "../src/i18n/language-utils.js";

test("getLangFromHref supports query before hash", () => {
  const href = "https://example.com/Patatos/?lang=nl#/planning";
  assert.equal(getLangFromHref(href), "nl");
});

test("getLangFromHref supports query inside hash route", () => {
  const href = "https://example.com/Patatos/#/planning?lang=nl";
  assert.equal(getLangFromHref(href), "nl");
});

test("resolvePreferredLang uses URL > storage > navigator > default", () => {
  assert.equal(
    resolvePreferredLang({
      href: "https://example.com/Patatos/?lang=nl#/planning",
      storedLang: "fr",
      navigatorLanguages: ["fr-BE"],
    }),
    "nl"
  );

  assert.equal(
    resolvePreferredLang({
      href: "https://example.com/Patatos/#/planning",
      storedLang: "nl",
      navigatorLanguages: ["fr-BE"],
    }),
    "nl"
  );

  assert.equal(
    resolvePreferredLang({
      href: "https://example.com/Patatos/#/planning",
      storedLang: "",
      navigatorLanguages: ["nl-BE"],
    }),
    "nl"
  );

  assert.equal(
    resolvePreferredLang({
      href: "https://example.com/Patatos/#/planning",
      storedLang: "",
      navigatorLanguages: ["en-US"],
    }),
    "fr"
  );
});

test("buildPathWithLangBeforeHash keeps hash untouched and writes lang before hash", () => {
  const href = "https://example.com/Patatos/#/planning?focus=recap";
  assert.equal(
    buildPathWithLangBeforeHash(href, "nl"),
    "/Patatos/?lang=nl#/planning?focus=recap"
  );
});

test("getLangFromNavigator normalizes locale variants", () => {
  assert.equal(getLangFromNavigator(["nl-BE"]), "nl");
  assert.equal(getLangFromNavigator(["fr_BE"]), "fr");
  assert.equal(getLangFromNavigator(["en-US"]), "");
});
