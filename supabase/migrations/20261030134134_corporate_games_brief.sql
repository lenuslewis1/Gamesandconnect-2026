-- Retain all four rounds of the corporate Games Day Brief in the existing inbox.
alter table public.corporate_enquiries
  drop constraint corporate_enquiries_requirements_check,
  add constraint corporate_enquiries_requirements_check check (length(requirements) <= 12000);
