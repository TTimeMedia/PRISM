-- Prism — add 'feedback' to support_requests.kind
-- A dedicated Feedback entry in the side menu, for beta testers to send
-- general impressions rather than a specific question or bug. Reuses the
-- existing support_requests table and submit-support Edge Function.

alter table public.support_requests
  drop constraint support_requests_kind_check;

alter table public.support_requests
  add constraint support_requests_kind_check
  check (kind in ('contact', 'problem', 'privacy', 'feedback'));
