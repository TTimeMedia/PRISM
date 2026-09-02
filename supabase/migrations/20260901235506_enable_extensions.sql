-- PRISM — Foundation migration 1/8
-- Enables the extensions PRISM's schema depends on.
-- pgcrypto provides gen_random_uuid(), used for every table's primary key
-- (docs/MASTER_BUILD_SPEC.md §18: "UUID primary keys").

create extension if not exists pgcrypto with schema extensions;
