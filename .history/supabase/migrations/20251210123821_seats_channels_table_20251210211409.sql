create table seats_channels (
    id bigint generated always as identity primary key,
    trip_id bigint not null,
    seat_number varchar not null,
    device_id text not null,
    created_at timestamp default now()
);

create unique index unique_seat_device on seats_channels (seat_number, device_id);