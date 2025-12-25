create table seats_selections (
    id bigint generated always as identity primary key,
    trip_id bigint not null,
    seat_number varchar not null,
    created_at timestamp default now()
);

create unique index unique_seat_trip
    on seats_selections (trip_id, seat_number);

ALTER TABLE seats_selections REPLICA IDENTITY FULL;