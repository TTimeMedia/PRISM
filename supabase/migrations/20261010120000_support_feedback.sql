-- Prism — feedback as a kind of support request
-- "Send feedback" in the side menu and on the Support screen uses the same
-- form, table and submit-support email as the other three kinds.

alter table public.support_requests drop constraint support_requests_kind_check;
alter table public.support_requests
  add constraint support_requests_kind_check
  check (kind in ('contact', 'problem', 'privacy', 'feedback'));
