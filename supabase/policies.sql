create policy "Allow security and admin to read vehicles"
on vehicles
for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role in ('admin','security')
  )
);

create policy "Allow admin to modify vehicles"
on vehicles
for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Allow logging"
on activity_logs
for insert
with check (auth.uid() is not null);
