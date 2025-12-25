-- Seed Moroccan Universities
INSERT INTO "University" ("id", "name", "slug", "city", "createdAt", "updatedAt") 
VALUES 
  (gen_random_uuid()::text, 'Ibn Zohr University', 'ibn-zohr', 'Agadir', NOW(), NOW()),
  (gen_random_uuid()::text, 'Qadi Ayyad University', 'qadi-ayyad', 'Marrakech', NOW(), NOW()),
  (gen_random_uuid()::text, 'University of Fez', 'fez', 'Fez', NOW(), NOW()),
  (gen_random_uuid()::text, 'Hassan II University', 'hassan-ii', 'Casablanca', NOW(), NOW()),
  (gen_random_uuid()::text, 'Al Akhawayn University', 'al-akhawayn', 'Ifrane', NOW(), NOW()),
  (gen_random_uuid()::text, 'University of Rabat', 'rabat', 'Rabat', NOW(), NOW()),
  (gen_random_uuid()::text, 'Sultan Moulay Slimane University', 'sultan-moulay', 'Beni Mellal', NOW(), NOW()),
  (gen_random_uuid()::text, 'University of Tangier', 'tangier', 'Tangier', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
