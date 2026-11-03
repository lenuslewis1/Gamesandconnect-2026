async (page) => {
    const checks = [];
    const check = (name, pass) => {checks.push({name, pass});if(!pass)throw new Error(name);};
    const user = {id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',aud:'authenticated',role:'authenticated',email:'gamesandconnectgh@gmail.com',app_metadata:{},user_metadata:{},created_at:'2026-11-03T10:00:00Z'};
    const now = Math.floor(Date.now()/1000);
    const token = [btoa(JSON.stringify({alg:'HS256',typ:'JWT'})),btoa(JSON.stringify({sub:user.id,email:user.email,role:'authenticated',aud:'authenticated',iat:now,exp:now+3600})),'mock-signature'].join('.');
    const session = {access_token:token,refresh_token:'mock-refresh',expires_in:3600,expires_at:now+3600,token_type:'bearer',user};
    const members = Array.from({length:123},(_,i)=>({id:`member-${i+1}`,first_name:`Demo${i+1}`,last_name:'Member',phone:`23324${String(i%105).padStart(7,'0')}`,email:`demo${i+1}@example.test`,source_filename:'example.csv',source_row:i+2,created_at:'2026-11-03T10:00:00Z'}));
    await page.context().route('**/*.supabase.co/**',async route=>{
        const request=route.request();const url=new URL(request.url());
        const respond=(data,headers={})=>route.fulfill({status:200,headers:{'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-expose-headers':'content-range',...headers},body:JSON.stringify(data)});
        if(request.method()==='OPTIONS')return respond({});
        if(url.pathname.endsWith('/auth/v1/user'))return respond(user);
        if(url.pathname.includes('/auth/v1/token'))return respond(session);
        if(url.pathname.endsWith('/rest/v1/community_members')){
            const filtered=url.searchParams.has('or')?members.filter(row=>row.first_name==='Demo123'):members;
            const offset=Number(url.searchParams.get('offset')||0);const limit=Number(url.searchParams.get('limit')||50);
            return respond(filtered.slice(offset,offset+limit),{'content-range':`${offset}-${Math.min(offset+limit,filtered.length)-1}/${filtered.length}`});
        }
        if(url.pathname.endsWith('/functions/v1/bulk-sms'))return respond({configured:false,sender:null});
        return respond([],{'content-range':'0-0/0'});
    });
    await page.addInitScript(({session})=>{localStorage.setItem('sb-fxqzihpsasuerpfjzwfr-auth-token',JSON.stringify(session));},{session});
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('http://127.0.0.1:5173/admin/community-members');
    await page.getByText('Demo1 Member',{exact:true}).waitFor();
    check('Community members route loads saved source records',await page.getByText('123 source records',{exact:true}).count()===1);
    check('First page shows 50 records',await page.locator('tbody tr').count()===50);
    await page.screenshot({path:'output/playwright/community-members-desktop.png',fullPage:false});
    await page.getByRole('button',{name:'Next members',exact:true}).click();
    await page.getByText('Demo51 Member',{exact:true}).waitFor();
    check('Next page loads the next 50 members',await page.locator('tbody tr').count()===50);
    await page.getByRole('button',{name:'Next members',exact:true}).click();
    await page.getByText('Demo101 Member',{exact:true}).waitFor();
    check('Final page has 23 records and disables Next',await page.locator('tbody tr').count()===23 && await page.getByRole('button',{name:'Next members',exact:true}).isDisabled());
    await page.getByRole('textbox',{name:'Search community members',exact:true}).fill('Demo123');
    await page.getByText('1 source records matching your search',{exact:true}).waitFor();
    check('Search resets pagination and filters members',await page.locator('tbody tr').count()===1 && await page.getByText('Demo123 Member',{exact:true}).count()===1);
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'output/playwright/community-members-mobile.png',fullPage:true});
    check('Community members page fits a phone viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    await page.getByRole('link',{name:'Open Contacts & SMS',exact:true}).click();
    await page.getByRole('heading',{name:'Bulk SMS',exact:true}).waitFor();
    check('SMS link selects the Community members audience',await page.getByRole('combobox',{name:'Contact source',exact:true}).inputValue()==='community_members');
    return checks;
}
