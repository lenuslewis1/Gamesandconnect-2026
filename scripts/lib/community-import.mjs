export function parseCsv(text) {
    const rows = []; let row = []; let cell = ''; let quoted = false;
    const input = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < input.length; i++) {
        const char = input[i];
        if (char === '"') {
            if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
            else if (quoted || cell === '') quoted = !quoted;
            else throw new Error('Unexpected quote in CSV');
        } else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
        else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && input[i + 1] === '\n') i++;
            row.push(cell); if (row.some(value => value !== '')) rows.push(row);
            row = []; cell = '';
        } else cell += char;
    }
    if (quoted) throw new Error('Unclosed quoted CSV field');
    row.push(cell); if (row.some(value => value !== '')) rows.push(row);
    const headers = rows.shift()?.map(value => value.trim().toLowerCase()) || [];
    for (const key of ['firstname','lastname','phone','email','date_of_birth']) if (!headers.includes(key)) throw new Error(`Missing CSV column: ${key}`);
    if (new Set(headers).size !== headers.length) throw new Error('Duplicate CSV column names');
    return rows.map((values, index) => {
        if (values.length !== headers.length) throw new Error(`CSV row ${index + 2} has an unexpected number of fields`);
        return { source_row: index + 2, record: Object.fromEntries(headers.map((key, i) => [key, values[i]])) };
    });
}

export function normalizeImportPhone(value) {
    const digits = value.replace(/\D/g, '');
    if (/^233\d{9}$/.test(digits)) return digits;
    if (/^0\d{9}$/.test(digits)) return `233${digits.slice(1)}`;
    if (/^\d{9}$/.test(digits)) return `233${digits}`;
    throw new Error('Unsupported Ghana phone number');
}

const literal = value => `'${String(value).replaceAll("'", "''")}'`;
export function communityImport(csv, { filename, hash }) {
    if (!/^[a-f0-9]{64}$/.test(hash)) throw new Error('Invalid file fingerprint');
    const parsed = parseCsv(csv);
    if (!parsed.length) throw new Error('CSV contains no member records');
    const members = parsed.map(({ source_row, record }) => {
        let phone;
        try { phone = normalizeImportPhone(record.phone); }
        catch { throw new Error(`CSV row ${source_row} has an unsupported phone number`); }
        return {
            first_name: record.firstname.trim(), last_name: record.lastname.trim(),
            phone, email: record.email.trim(), source_filename: filename,
            import_file_hash: hash, source_row, source_record: record,
        };
    });
    const groups = new Map();
    for (const row of members) groups.set(row.phone, [...(groups.get(row.phone) || []), row]);
    const summary = {
        source_file: filename, sha256: hash, source_rows: members.length,
        unique_phone_numbers: groups.size, repeated_phone_rows: members.length - groups.size,
        repeated_phone_groups: [...groups.values()].filter(rows => rows.length > 1).length,
        rows_with_email: members.filter(row => row.email).length,
        rows_with_date_of_birth: members.filter(row => row.source_record.date_of_birth.trim()).length,
        conflict_groups: [...groups.values()].filter(rows => new Set(rows.map(row => row.email.toLowerCase()).filter(Boolean)).size > 1).length,
    };
    // The full source record is retained. Richer names seed otherwise-empty SMS contacts first.
    const sql = `begin;
set local standard_conforming_strings = on;
with imported as (
  insert into public.community_members(first_name,last_name,phone,email,source_filename,import_file_hash,source_row,source_record)
  select first_name,last_name,phone,email,source_filename,import_file_hash,source_row,source_record
  from jsonb_to_recordset(${literal(JSON.stringify(members))}::jsonb)
  as r(first_name text,last_name text,phone text,email text,source_filename text,import_file_hash text,source_row integer,source_record jsonb)
  order by length(trim(first_name || ' ' || last_name)) desc,source_row
  on conflict (import_file_hash,source_row) do nothing
  returning id
)
select count(*) as new_source_records from imported;
do $$
begin
  if (select count(*) from public.community_members where import_file_hash=${literal(hash)}) <> ${members.length} then
    raise exception 'Community member source count does not match the import';
  end if;
  if (select count(*) from public.website_contacts c where 'community_members'=any(c.sources)
    and c.normalized_phone in (select normalized_phone from public.community_members where import_file_hash=${literal(hash)})) <> ${groups.size} then
    raise exception 'Community SMS contact count does not match the import';
  end if;
end;
$$;
select count(*) as imported_source_rows,count(distinct normalized_phone) as unique_phone_numbers
from public.community_members where import_file_hash=${literal(hash)};
commit;
`;
    return { members, summary, sql };
}
