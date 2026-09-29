-- Stan magazynowy osobno dla każdego rozmiaru.
-- Istniejące produkty z rozmiarami nie dostają automatycznego podziału:
-- ilości wpisuje się ręcznie w panelu.

CREATE TABLE "product_size_stocks" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_size_stocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_size_stocks_product_id_size_key" ON "product_size_stocks"("product_id", "size");

ALTER TABLE "product_size_stocks" ADD CONSTRAINT "product_size_stocks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD COLUMN "size" TEXT;
