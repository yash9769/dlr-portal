create or replace function public.handle_new_user()
returns trigger as $$
declare
  faculty_photo text;
begin
  -- Try to find a matching photo in the faculty master list
  select photo_url into faculty_photo from public.faculty where email = new.email limit 1;

  insert into public.profiles (id, email, full_name, role, photo_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'faculty',
    faculty_photo -- Use the photo found in faculty list (or null)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop check to avoid error if exists (safe retry)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
