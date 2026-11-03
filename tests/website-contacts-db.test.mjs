import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('migration backfills and captures contacts, deduplicates Ghana numbers, preserves exclusions and enforces admin RLS', async () => {
    const db = new PGlite();
    try {
        await db.exec(`
            create role anon; create role authenticated; create role service_role;
            create schema auth;
            create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
            grant usage on schema auth to authenticated, anon;
            grant execute on function auth.jwt() to authenticated, anon;
            create table auth.users(id uuid primary key);
            create table public.contact_messages(id uuid default gen_random_uuid(),name text,email text,created_at timestamptz default now());
            create table public.registrations(id serial,full_name text,email text,phone_number text,created_at timestamptz default now());
            create table public.event_registrations(id serial,full_name text,email text,phone text,created_at timestamptz default now());
            create table public.team_registrations(id uuid default gen_random_uuid(),full_name text,email text,phone text,created_at timestamptz default now());
            create table public.corporate_enquiries(id uuid default gen_random_uuid(),contact_name text,email text,phone text,created_at timestamptz default now());
            create table public.profiles(id uuid default gen_random_uuid(),email text,created_at timestamptz default now());
            insert into registrations(full_name,email,phone_number) values('Ama','ama@example.test','0241234567');
            insert into event_registrations(full_name,email,phone) values('Ama','ama@example.test','+233 24 123 4567');
            insert into profiles(email) values('emailonly@example.test');
        `);
        const migration = await readFile(new URL('../supabase/migrations/20261103161618_website_contacts_bulk_sms.sql', import.meta.url), 'utf8');
        await db.exec(migration);
        let { rows } = await db.query('select * from website_contacts order by phone desc');
        assert.equal(rows.length, 2);
        const contact = rows.find(row => row.normalized_phone);
        assert.equal(contact.normalized_phone, '233241234567');
        assert.deepEqual([...contact.sources].sort(), ['event_registrations', 'registrations']);
        await db.query('update website_contacts set sms_opt_out=true where id=$1', [contact.id]);
        await db.exec(`insert into contact_messages(name,email,phone) values('Ama','ama@example.test','233241234567');`);
        const updated = (await db.query('select * from website_contacts where id=$1', [contact.id])).rows[0];
        assert.equal(updated.sms_opt_out, true);
        assert.ok(updated.sources.includes('contact_messages'));
        assert.equal((await db.query('select count(*)::integer as n from website_contacts')).rows[0].n, 2);
        await db.exec(`
            insert into corporate_enquiries(contact_name,email,phone) values('Kojo','kojo@example.test','0201234567');
            insert into team_registrations(full_name,email,phone) values('Team guest','team@example.test','0271234567');
            insert into contact_messages(name,email,phone) values('Foreign','foreign@example.test','+447123456789');
        `);
        assert.equal((await db.query('select count(*)::integer as n from website_contacts')).rows[0].n, 5);
        assert.equal((await db.query("select normalized_phone from website_contacts where email='foreign@example.test'")).rows[0].normalized_phone, null);
        await db.exec(`set role authenticated; select set_config('request.jwt.claims','{"email":"member@example.test"}',false);`);
        assert.equal((await db.query('select * from website_contacts')).rows.length, 0);
        assert.equal((await db.query('select * from sms_campaigns')).rows.length, 0);
        await assert.rejects(db.exec("insert into website_contacts(contact_key) values('injected')"), /permission denied/);
        await assert.rejects(db.exec("update website_contacts set phone='0249999999'"), /permission denied/);
        await db.exec(`select set_config('request.jwt.claims','{"email":"gamesandconnectgh@gmail.com"}',false);`);
        assert.equal((await db.query('select * from website_contacts')).rows.length, 5);
        await db.query('update website_contacts set sms_opt_out=false where id=$1', [contact.id]);
        assert.equal((await db.query('select sms_opt_out from website_contacts where id=$1', [contact.id])).rows[0].sms_opt_out, false);
        await assert.rejects(db.exec(`insert into sms_campaigns(id,created_by,message,recipient_ids,recipient_count) values(gen_random_uuid(),gen_random_uuid(),'test','{}',1)`), /permission denied/);
        await db.exec('reset role; set role anon;');
        await assert.rejects(db.exec('select * from website_contacts'), /permission denied/);
        await assert.rejects(db.exec('select * from sms_campaigns'), /permission denied/);
        await assert.rejects(db.exec("select private.save_website_contact('{}','profiles')"), /permission denied/);
    } finally { await db.close(); }
});
