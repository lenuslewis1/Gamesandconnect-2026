async (page) => {
    const checks = [];
    const check = (name, pass) => { checks.push({name, pass}); if (!pass) throw new Error(name); };
    const user = {id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',aud:'authenticated',role:'authenticated',email:'gamesandconnectgh@gmail.com',app_metadata:{},user_metadata:{},created_at:'2026-11-03T10:00:00Z'};
    const now = Math.floor(Date.now()/1000);
    const token = [btoa(JSON.stringify({alg:'HS256',typ:'JWT'})),btoa(JSON.stringify({sub:user.id,email:user.email,role:'authenticated',aud:'authenticated',iat:now,exp:now+3600})),'mock-signature'].join('.');
    const session = {access_token:token,refresh_token:'mock-refresh',expires_in:3600,expires_at:now+3600,token_type:'bearer',user};
    let contacts = [
        {id:'11111111-1111-4111-8111-111111111111',name:'Ama Demo',email:'ama@example.test',phone:'0241234567',normalized_phone:'233241234567',sources:['registrations','event_registrations'],sms_opt_out:false,last_seen_at:'2026-11-03T10:00:00Z'},
        {id:'22222222-2222-4222-8222-222222222222',name:'Kojo Demo',email:'kojo@example.test',phone:'+233201234567',normalized_phone:'233201234567',sources:['corporate_enquiries'],sms_opt_out:false,last_seen_at:'2026-11-03T09:00:00Z'},
        {id:'33333333-3333-4333-8333-333333333333',name:'Email only',email:'hello@example.test',phone:'',normalized_phone:null,sources:['contact_messages'],sms_opt_out:false,last_seen_at:'2026-11-03T08:00:00Z'},
        {id:'44444444-4444-4444-8444-444444444444',name:'Excluded guest',email:'guest@example.test',phone:'0271234567',normalized_phone:'233271234567',sources:['team_registrations'],sms_opt_out:true,last_seen_at:'2026-11-03T07:00:00Z'},
    ];
    let campaigns = []; let sends = 0; let submittedContact = null;
    await page.context().route('**/*.supabase.co/**', async route => {
        const url = new URL(route.request().url()); const method = route.request().method();
        const payload = route.request().postDataJSON();
        const headers = {'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-expose-headers':'content-range','content-type':'application/json'};
        const respond = (data,extra={}) => route.fulfill({status:200,headers:{...headers,...extra},body:JSON.stringify(data)});
        if (method === 'OPTIONS') return respond({});
        if (url.pathname.endsWith('/auth/v1/user')) return respond(user);
        if (url.pathname.includes('/auth/v1/token')) return respond(session);
        if (url.pathname.endsWith('/functions/v1/bulk-sms')) {
            if (payload.action === 'status') return respond({configured:true,sender:'GamesConect'});
            sends++;
            const campaign = {id:payload.campaign_id,created_at:new Date().toISOString(),message:payload.message,recipient_count:payload.contact_ids.length,accepted_count:payload.contact_ids.length,status:'accepted',provider_campaign_id:'mock-bms-campaign'};
            campaigns.unshift(campaign); return respond({campaign});
        }
        if (url.pathname.endsWith('/rest/v1/website_contacts')) {
            if (method === 'PATCH') { const id=url.searchParams.get('id').slice(3); contacts=contacts.map(c=>c.id===id?{...c,...payload}:c);return respond({id}); }
            let rows = contacts;
            if (url.searchParams.has('or')) rows=rows.filter(c=>c.name==='Ama Demo');
            if (url.searchParams.has('sources')) rows=rows.filter(c=>c.sources.includes('corporate_enquiries'));
            if (url.searchParams.get('sms_opt_out') === 'eq.false') rows=rows.filter(c=>c.normalized_phone&&!c.sms_opt_out);
            if (url.searchParams.get('sms_opt_out') === 'eq.true') rows=rows.filter(c=>c.sms_opt_out);
            return respond(rows,{'content-range':`0-${Math.max(0,rows.length-1)}/${rows.length}`});
        }
        if (url.pathname.endsWith('/rest/v1/sms_campaigns')) {
            if (url.searchParams.has('id')) return respond(campaigns.find(c=>`eq.${c.id}`===url.searchParams.get('id'))||null);
            return respond(campaigns,{'content-range':`0-${Math.max(0,campaigns.length-1)}/${campaigns.length}`});
        }
        if (url.pathname.endsWith('/rest/v1/contact_messages') && method === 'POST') {submittedContact=payload;return respond({});}
        return respond([]);
    });
    await page.addInitScript(({session}) => { localStorage.setItem('sb-fxqzihpsasuerpfjzwfr-auth-token',JSON.stringify(session)); },{session});
    await page.setViewportSize({width:1440,height:1050});
    await page.goto('http://127.0.0.1:5173/admin/sms');
    await page.getByRole('heading',{name:'Bulk SMS',exact:true}).waitFor();
    await page.getByText('Ama Demo',{exact:true}).waitFor();
    check('Saved contacts and BMS connection load',await page.getByText(/BMS Africa configured/).count()===1);
    check('Email-only and excluded contacts cannot be selected',await page.getByRole('checkbox',{name:'Select Email only',exact:true}).isDisabled() && await page.getByRole('checkbox',{name:'Select Excluded guest',exact:true}).isDisabled());
    await page.getByRole('button',{name:'Select this page',exact:true}).click();
    check('Page selection includes only two eligible recipients',await page.getByRole('checkbox',{checked:true}).count()===2);
    await page.getByLabel('SMS text',{exact:true}).fill('Games and Connect: join us for our next games day. Reply to our team for details.');
    await page.screenshot({path:'output/playwright/bulk-sms-desktop.png',fullPage:true});
    await page.getByRole('button',{name:'Review SMS',exact:true}).click();
    await page.getByRole('dialog').waitFor();
    check('Review names recipient count before sending',await page.getByRole('heading',{name:'Send to 2 phone numbers?',exact:true}).count()===1 && sends===0);
    await page.getByRole('button',{name:'Back to editing',exact:true}).click();
    check('Cancelling review does not send',sends===0);
    await page.getByRole('button',{name:'Review SMS',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'Send SMS',exact:true}).click();
    await page.getByRole('button',{name:'New message',exact:true}).waitFor();
    check('Mock send records acceptance and history once',sends===1 && await page.getByText('2 of 2 numbers accepted.',{exact:true}).count()===1);
    await page.getByRole('button',{name:'New message',exact:true}).click();
    await page.getByRole('checkbox',{name:'Select Ama Demo',exact:true}).check();
    await page.getByRole('row').filter({hasText:'Ama Demo'}).getByRole('button',{name:'Exclude from SMS',exact:true}).click();
    await page.waitForFunction(() => document.querySelector('input[aria-label="Select Ama Demo"]')?.disabled);
    check('Excluding contact updates selection and prevents sending',await page.getByRole('checkbox',{name:'Select Ama Demo',exact:true}).isDisabled());
    await page.getByRole('combobox',{name:'Contact source',exact:true}).selectOption('corporate_enquiries');
    await page.getByText('Ama Demo',{exact:true}).waitFor({state:'hidden'});
    await page.getByText('Kojo Demo',{exact:true}).waitFor();
    check('Contact source filter narrows recipients',await page.getByText('Kojo Demo',{exact:true}).count()===1);
    await page.getByRole('combobox',{name:'Contact source',exact:true}).selectOption('all');
    await page.getByText('Ama Demo',{exact:true}).waitFor();
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'output/playwright/bulk-sms-mobile.png',fullPage:true});
    check('Admin SMS page fits mobile viewport',await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth));
    await page.goto('http://127.0.0.1:5173/contact');
    await page.getByLabel('First Name',{exact:true}).fill('Demo');
    await page.getByLabel('Last Name',{exact:true}).fill('Customer');
    await page.getByLabel('Email Address',{exact:true}).fill('demo@example.test');
    await page.getByLabel(/Phone number/).fill('0241234567');
    await page.getByLabel('Message',{exact:true}).fill('A local test contact message.');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByText('Your message has been submitted',{exact:true}).waitFor();
    check('Contact form saves optional phone with enquiry',submittedContact?.phone==='0241234567');
    return checks;
}
