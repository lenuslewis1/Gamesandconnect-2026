import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { communityImport, parseCsv } from '../scripts/lib/community-import.mjs';

const options = { filename: 'test.csv', hash: 'a'.repeat(64) };
const csv = 'firstname,lastname,phone,email,date_of_birth\r\nAma,,0241234567,ama@example.test,\r\nAma,Demo,+233241234567,other@example.test,\r\n"Kojo, Jr","O\'Neil",201234567,kojo@example.test,\r\n';

test('CSV import preserves original records and standardizes numbers without discarding duplicate details', () => {
    const result = communityImport('\uFEFF' + csv, options);
    assert.equal(result.members.length, 3);
    assert.equal(result.summary.unique_phone_numbers, 2);
    assert.equal(result.summary.repeated_phone_rows, 1);
    assert.equal(result.summary.conflict_groups, 1);
    assert.equal(result.members[0].phone, '233241234567');
    assert.equal(result.members[0].source_record.phone, '0241234567');
    assert.equal(result.members[2].first_name, 'Kojo, Jr');
    assert.equal(result.members[2].last_name, "O'Neil");
});

test('quoted CSV text remains data and malformed files are rejected', () => {
    const rows = parseCsv('firstname,lastname,phone,email,date_of_birth\n"A ""quote""\nline",Last,0241234567,,\n');
    assert.equal(rows[0].record.firstname, 'A "quote"\nline');
    assert.throws(() => parseCsv('firstname,phone\nAma,0241234567'), /Missing CSV column/);
    assert.throws(() => parseCsv('firstname,lastname,phone,email,date_of_birth\n"unfinished'), /Unclosed/);
    assert.throws(() => communityImport(csv.replace('0241234567', 'invalid'), options), /row 2/);
});

test('community migration and import retain all rows, are repeatable, preserve exclusions and enforce admin access', async () => {
    const db = new PGlite();
    try {
        await db.exec(`create role anon; create role authenticated; create role service_role;
            create schema auth; create schema private;
            create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
            grant usage on schema auth to authenticated;
            create function public.sms_ghana_phone(value text) returns text language sql immutable as $$
              select case when value ~ '^233[0-9]{9}$' then value when value ~ '^0[0-9]{9}$' then '233'||substr(value,2) when value ~ '^[0-9]{9}$' then '233'||value end $$;
            create table public.website_contacts(id uuid default gen_random_uuid(),contact_key text unique,name text default '',email text default '',phone text,
              sources text[],sms_opt_out boolean default false,normalized_phone text generated always as (public.sms_ghana_phone(phone)) stored);
            insert into website_contacts(contact_key,name,email,phone,sources,sms_opt_out)
              values('phone:233241234567','Existing name','existing@example.test','233241234567',array['registrations'],true);`);
        await db.exec(await readFile(new URL('../supabase/migrations/20261103163352_community_members_import.sql', import.meta.url), 'utf8'));
        const { sql } = communityImport(csv, options);
        await db.exec(sql);
        await db.exec(sql);
        assert.equal((await db.query('select count(*)::int as n from community_members')).rows[0].n, 3);
        const contacts = (await db.query('select * from website_contacts')).rows;
        assert.equal(contacts.length, 2);
        const existing = contacts.find(row => row.phone === '233241234567');
        assert.equal(existing.name, 'Existing name');
        assert.equal(existing.email, 'existing@example.test');
        assert.equal(existing.sms_opt_out, true);
        assert.ok(existing.sources.includes('community_members'));
        const raw = (await db.query('select source_record from community_members where source_row=4')).rows[0].source_record;
        assert.equal(raw.lastname, "O'Neil");
        await db.exec(`set role authenticated; select set_config('request.jwt.claims','{"email":"member@example.test"}',false);`);
        assert.equal((await db.query('select * from community_members')).rows.length, 0);
        await assert.rejects(db.exec('delete from community_members'), /permission denied/);
        await db.exec(`select set_config('request.jwt.claims','{"email":"gamesandconnectgh@gmail.com"}',false);`);
        assert.equal((await db.query('select * from community_members')).rows.length, 3);
        await db.exec('reset role; set role anon;');
        await assert.rejects(db.exec('select * from community_members'), /permission denied/);
    } finally { await db.close(); }
});
