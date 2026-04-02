import test from "node:test";
import assert from "node:assert/strict";

import { mapSedifexProductToDisplay, normalizeProductImageUrl, PRODUCT_PLACEHOLDER_IMAGE } from "./productsNormalization.ts";

test("normalizeProductImageUrl uses placeholder for missing or invalid values", () => {
  assert.equal(normalizeProductImageUrl(undefined), PRODUCT_PLACEHOLDER_IMAGE);
  assert.equal(normalizeProductImageUrl(""), PRODUCT_PLACEHOLDER_IMAGE);
  assert.equal(normalizeProductImageUrl("ftp://example.com/image.jpg"), PRODUCT_PLACEHOLDER_IMAGE);
  assert.equal(normalizeProductImageUrl("https://cdn.example.com/image.jpg"), "https://cdn.example.com/image.jpg");
  assert.equal(normalizeProductImageUrl("/products/item.jpeg"), "/products/item.jpeg");
});

test("mapSedifexProductToDisplay maps stockCount/imageUrl and guards invalid numeric values", () => {
  const mapped = mapSedifexProductToDisplay({
    id: "p1",
    name: "Glow Serum",
    price: "55.5",
    stockCount: "4",
    itemType: "product",
    imageUrl: "",
  });

  assert.ok(mapped);
  assert.equal(mapped?.id, "p1");
  assert.equal(mapped?.name, "Glow Serum");
  assert.equal(mapped?.price, 55.5);
  assert.equal(mapped?.quantity, 4);
  assert.equal(mapped?.isService, false);
  assert.equal(mapped?.image, PRODUCT_PLACEHOLDER_IMAGE);

  const invalidNumbers = mapSedifexProductToDisplay({
    name: "Bad Numbers",
    price: Number.NaN,
    stockCount: "nope",
    itemType: "product",
  });

  assert.equal(invalidNumbers?.price, 0);
  assert.equal(invalidNumbers?.quantity, null);
});
