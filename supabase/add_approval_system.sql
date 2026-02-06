-- Create table for daily report approvals
create table if not exists report_approvals (
    id uuid default uuid_generate_v4() primary key,
    report_date date not null unique,
    approved_by text not null, -- Name of HOD/Admin
    approver_id uuid references auth.users(id),
    approved_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'approved'
);

-- RLS
alter table report_approvals enable row level security;

create policy "Everyone can view approvals"
    on report_approvals for select
    to authenticated
    using (true);

create policy "Only Admins/HODs can insert approvals"
    on report_approvals for insert
    to authenticated
    with check (
        exists (
            select 1 from profiles
            where id = auth.uid()
            and role in ('admin', 'hod')
        )
    );
