create table seats (
    id bigint generated always as identity primary key,
    trip_id bigint not null,
    seat_number varchar not null,
    event_type varchar not null,
    created_at timestamp default now()
);

create unique index unique_seat_trip
    on seats (trip_id, seat_number);

ALTER TABLE seats REPLICA IDENTITY FULL;