create table students (
  id uuid default gen_random_uuid() primary key,
  register_number text unique not null,
  full_name text not null,
  department text not null,
  year integer,
  phone text not null,
  created_at timestamp default now()
);

create table vehicles (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade,
  plate_number text unique not null,
  vehicle_type text,
  vehicle_color text,
  created_at timestamp default now()
);

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin','security')),
  created_at timestamp default now()
);

create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references vehicles(id),
  plate_number text,
  accessed_by uuid references auth.users(id),
  status text,
  created_at timestamp default now()
);

alter table students enable row level security;
alter table vehicles enable row level security;
alter table activity_logs enable row level security;
