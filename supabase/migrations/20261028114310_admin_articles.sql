alter table public.blog_posts enable row level security;
alter table public.blog_posts drop constraint if exists blog_posts_category_check;
alter table public.blog_posts add constraint blog_posts_category_check check (length(trim(category)) between 1 and 80);
drop policy if exists "Authenticated users can delete blog posts" on public.blog_posts;
drop policy if exists "Authenticated users can insert blog posts" on public.blog_posts;
drop policy if exists "Authenticated users can update blog posts" on public.blog_posts;
drop policy if exists "Authenticated users can view all blog posts" on public.blog_posts;
drop policy if exists "Anyone can view published blog posts" on public.blog_posts;
revoke all on public.blog_posts from anon;
grant select on public.blog_posts to anon;
grant select, insert, update on public.blog_posts to authenticated;
revoke delete on public.blog_posts from authenticated;
create policy "Published articles are public" on public.blog_posts for select to anon, authenticated using (status = 'published');
create policy "Article administrators" on public.blog_posts for all to authenticated
using (lower(auth.jwt()->>'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'))
with check (lower(auth.jwt()->>'email') in ('mariame@ryamchouu.com','tunde@ryamchouu.com','gamesandconnectgh@gmail.com'));
