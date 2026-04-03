import type { DisplayProduct } from "@/lib/productsData";

export function buildProductsItemListJsonLd(products: DisplayProduct[]) {
  const offers = products.slice(0, 30).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: product.name,
      image: product.image.startsWith("http") ? product.image : `https://www.glitteringmedspa.com${product.image}`,
      offers: {
        "@type": "Offer",
        priceCurrency: "GHS",
        price: product.price.toFixed(2),
        availability: product.quantity !== null && product.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: "https://www.glitteringmedspa.com/products",
      },
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Glittering Med Spa products",
    itemListElement: offers,
  };
}
