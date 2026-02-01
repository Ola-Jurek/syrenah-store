-- Wstawienie kategorii 'Sukienki'
INSERT INTO categories (id, name_pl, name_en, slug, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,  -- Generuje unikalne ID (PostgreSQL/Supabase)
  'Sukienki',
  'Dresses',
  'sukienki',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Wstawienie produktu testowego 'Sukienka Testowa'
-- UWAGA: Musisz najpierw uzyskać ID kategorii z powyższego zapytania
-- Lub użyj tego zapytania, które automatycznie znajdzie ID kategorii:

INSERT INTO products (
  id,
  name_pl,
  name_en,
  description_pl,
  price_pln,
  price_eur,
  stock,
  slug,
  category_id,
  sizes,
  colors,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid()::text,
  'Sukienka Testowa',
  'Test Dress',
  'To jest produkt testowy do sprawdzenia funkcjonalności wariantów.',
  299.99,
  69.99,
  10,
  'sukienka-testowa',
  c.id,  -- Używa ID kategorii 'sukienki'
  '["S", "M", "L"]'::jsonb,  -- Rozmiary jako JSON
  '[]'::jsonb,  -- Kolory jako pusty JSON array
  NOW(),
  NOW()
FROM categories c
WHERE c.slug = 'sukienki'
ON CONFLICT (slug) DO NOTHING;

