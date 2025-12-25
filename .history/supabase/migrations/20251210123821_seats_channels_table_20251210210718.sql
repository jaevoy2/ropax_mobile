create table seats_channels (
    id bigint generated always as identity primary key,
    trip_id bigint not null,
    seat_number varchar not null,
    device_id text not null,
    created_at timestamp default now()
);

create unique index unique_seat_device on seats_channels (seat_number, device_id);

create policy "Allow read" on seats_channels
for select using (true);

create policy "Allow insert" on seats_channels
for insert with check (true);

create policy "Allow delete own lock" on seats_channels
for delete using (locked_by = auth.uid()::text);