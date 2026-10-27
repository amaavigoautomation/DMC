/* DMC24 shared JavaScript. Each page runs only its original modules, in original order. */
(()=>{
const hiddenDestinations=new Set(JSON.parse(document.querySelector('#destination-visibility')?.textContent||'[]'));
function removeHiddenDestinations(){if(!hiddenDestinations.size)return;document.querySelectorAll('a[href]').forEach(a=>{try{const u=new URL(a.getAttribute('href'),location.href);if(u.origin!==location.origin)return;let slug=u.pathname.replace(/^\//,'').replace(/\.html$/,'').replace(/\/$/,'');if(slug.startsWith('api/brochures/'))slug=slug.slice(14).replace(/\.pdf$/,'');if(slug==='destinations'&&u.hash)slug=u.hash.slice(1);if(slug==='uae')slug='dubai';if(slug==='kenya-users-review')slug='kenya';if(hiddenDestinations.has(slug))a.remove();}catch{}});}
const modules={
  "destination-search":function(){
    const form = document.querySelector('[data-destination-search]');
    if (!form) return;
    const input = form.querySelector('.destination-search-input');
    const popup = form.querySelector('.destination-search-popup');
    const options = [...form.querySelectorAll('.destination-search-option')];
    const empty = form.querySelector('.destination-search-empty');
    const status = form.querySelector('.destination-search-status');
    const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    let matches = options, active = -1;
    const label = option => option.textContent.trim();
    const setActive = index => {
      active = index;
      options.forEach(option => option.setAttribute('aria-selected', String(option === matches[active])));
      if (matches[active]) {
        input.setAttribute('aria-activedescendant', matches[active].id);
        matches[active].scrollIntoView({block:'nearest'});
      } else input.removeAttribute('aria-activedescendant');
    };
    const open = () => { popup.hidden = false; input.setAttribute('aria-expanded', 'true'); };
    const close = () => { popup.hidden = true; input.setAttribute('aria-expanded', 'false'); setActive(-1); };
    const filter = () => {
      const query = normalize(input.value);
      matches = options.filter(option => {
        const haystack = normalize(label(option) + ' ' + option.dataset.searchAliases);
        const match = !query || query.split(' ').every(word => haystack.includes(word));
        option.hidden = !match;
        return match;
      });
      setActive(-1);
      empty.hidden = matches.length > 0;
      status.textContent = matches.length + (matches.length === 1 ? ' destination' : ' destinations') + (query ? ' found' : ' available');
      open();
    };
    const choose = option => { input.value = label(option); close(); window.location.assign(option.getAttribute('href')); };
    input.addEventListener('focus', filter);
    input.addEventListener('click', () => { if (popup.hidden) filter(); });
    input.addEventListener('input', filter);
    input.addEventListener('keydown', event => {
      if (event.isComposing) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (popup.hidden) filter();
        if (!matches.length) return;
        setActive(event.key === 'ArrowDown' ? (active + 1) % matches.length : (active < 0 ? matches.length - 1 : (active - 1 + matches.length) % matches.length));
      }
      if (event.key === 'Enter' && !popup.hidden && active >= 0) { event.preventDefault(); choose(matches[active]); }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const query = normalize(input.value);
      const exact = options.find(option => normalize(label(option)) === query);
      if (query && (exact || matches.length === 1)) choose(exact || matches[0]);
      else { input.focus(); filter(); if (matches.length) status.textContent = 'Choose a destination below · ' + matches.length + ' available'; }
    });
    form.addEventListener('focusout', event => { if (!form.contains(event.relatedTarget)) close(); });
    document.addEventListener('pointerdown', event => { if (!form.contains(event.target)) close(); });
  },

  "benefits-command-design":function(){
    const main=document.querySelector('main');
    const sections=[...main.querySelectorAll(':scope > section')];
    sections.forEach((section,i)=>{if(!section.id)section.id='benefit-detail-'+i;section.classList.add('outcome-section')});
    const items=[
      ['Respond faster','Keep enquiries, rates and follow-ups connected so your team can move proposals forward.','Response performance'],
      ['Reduce repeated work','Carry information from the confirmed quote into reservations, operations and finance.','Operational efficiency'],
      ['Understand conversion','See where enquiries turn into bookings and why opportunities are lost.','Sales conversion'],
      ['Protect expected margins','Review selling prices, supplier costs, tax and exchange rates before committing.','Profitability control'],
      ['Know the final profit','Compare provisional and final GP to reveal the actual outcome of each file.','Profitability control'],
      ['Focus your sales effort','Understand which markets and agents contribute business and gross profit.','Market intelligence'],
      ['Make follow-ups accountable','Give employees visibility into actions, ownership and performance.','Sales conversion'],
      ['Coordinate service delivery','Keep reservations and operations working from connected travel-file information.','Operational efficiency'],
      ['Keep cash obligations visible','Track receivables, supplier payables and overdue balances.','Performance scorecard'],
      ['Manage with clearer evidence','Use dashboards, trends and KPIs to review improvement across the business.','Performance scorecard']
    ];
    const target=k=>sections.find(x=>x.querySelector('.bnf-kicker')?.textContent.trim()===k)?.id||'performance';
    const highlights=document.createElement('section');highlights.id='top-benefits';highlights.className='command-section';highlights.innerHTML='<div class="command-wrap"><div class="command-section-heading"><div><div class="command-eyebrow">THE TOP 10 BUSINESS BENEFITS</div><h2>Less friction.<br>More control. Better decisions.</h2></div><p>Ten ways connected information can strengthen your DMC. Explore each benefit, then see the workflows and measures behind it.</p></div><div class="benefit-spotlights">'+items.map((x,i)=>'<a class="benefit-spotlight'+(i<3?' benefit-spotlight--priority':'')+'" href="#'+target(x[2])+'"><span>'+String(i+1).padStart(2,'0')+'</span><h3>'+x[0]+'</h3><p>'+x[1]+'</p><small>Explore the business impact</small></a>').join('')+'</div></div>';
    sections[0].after(highlights);
    const modifiers={'bnf-hero':'bnf-hero--command','bnf-command':'bnf-command--dark','bnf-chart':'bnf-chart--editorial','bnf-outcome':'bnf-outcome--editorial','bnf-problem':'bnf-problem--editorial','bnf-process':'bnf-process--editorial','bnf-team':'bnf-team--editorial','bnf-final':'bnf-final--command'};
    for(const [base,modifier] of Object.entries(modifiers))main.querySelectorAll('.'+base).forEach(e=>e.classList.add(modifier));
    const link=main.querySelector('.bnf-hero .bnf-actions a');link.href='#top-benefits';
    if(document.body.dataset.page==='benefits-preview') main.insertAdjacentHTML('beforebegin','<div class="concept-notice">BENEFITS PAGE CONCEPT <span>Top 10 benefits · Full detail retained</span><a href="benefits.html">View current page</a></div>');
  },

  "features-command-design":function(){
    const modifiers={'fc-hero':'fc-hero--command','fc-console':'fc-console--command','fc-strip':'fc-strip--command','fc-head':'fc-head--editorial','fc-group':'fc-group--editorial','fc-diff':'fc-diff--editorial','fc-workflow':'fc-workflow--command','fc-tabs':'fc-tabs--editorial','fc-scenario':'fc-scenario--command','fc-matrix':'fc-matrix--editorial','fc-dest':'fc-dest--editorial','fc-small':'fc-small--editorial','fc-discovery':'fc-discovery--command'};
    for(const [base,modifier] of Object.entries(modifiers))document.querySelectorAll('.'+base).forEach(el=>el.classList.add(modifier));
    if(document.body.dataset.page==='features-preview') document.querySelector('main').insertAdjacentHTML('beforebegin','<div class="concept-notice">FEATURES PAGE CONCEPT <span>Complete content · New presentation</span><a href="features.html">View current page</a></div>');
  },

  "product-lifecycle":function(){
    const views={
      enquiry:['SALES & CRM','Give every opportunity a clear next step.','Capture the agent or customer enquiry, assign responsibility and keep follow-ups visible to your sales team.',['Customer and agent relationships','Lead ownership and follow-ups','Enquiry and conversion visibility'],'dmc24-sales-overview-dashboard.webp','sales-crm.html','Sales & CRM'],
      quote:['SALES & CONTRACTING','Turn the brief into a complete proposal.','Use supplier contracts, service costs and market markups to build a FIT or group quotation and present the itinerary.',['Contracted products and rates','FIT and group costing','AI-assisted, digital and PDF itineraries'],'dmc24-costing-quotations-dashboard.webp','costing-quotations.html','Costing & Quotations'],
      book:['BOOKINGS & RESERVATIONS','Carry confirmed business into delivery.','Convert accepted quotations into booking files and coordinate the supplier reservations required for the programme.',['Confirmed travel files','Supplier requests and confirmations','Booking amendments and vouchers'],'dmc24-bookings-reservations-dashboard.webp','bookings-reservations.html','Bookings & Reservations'],
      operate:['OPERATIONS & LOGISTICS','Put every service in the right hands.','Coordinate arrivals, transport, drivers, guides and daily services using the details of the confirmed booking.',['Guest and service movements','Vehicle, driver and guide allocation','Pre-tour and post-tour expenses'],'dmc24-operations-logistics-dashboard.webp','operations-logistics.html','Operations & Logistics'],
      profit:['FINANCE & MANAGEMENT','Understand what the booking earns.','Follow invoices, collections and supplier liabilities through to file profitability and management reporting.',['Receivables and payables','File-wise profit and loss','Monthly gross profit and MIS'],'dmc24-finance-profitability-dashboard.webp','finance-profitability.html','Finance & Profitability']
    };
    const tabs=[...document.querySelectorAll('[data-life]')];const activate=b=>{const v=views[b.dataset.life];tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===b));t.tabIndex=t===b?0:-1});document.getElementById('life-panel').setAttribute('aria-labelledby',b.id);['team','title','description'].forEach((id,i)=>document.getElementById('life-'+id).textContent=v[i]);document.getElementById('life-list').replaceChildren(...v[3].map(text=>{const li=document.createElement('li');li.textContent=text;return li}));const img=document.getElementById('life-image');img.src='img/'+v[4];img.alt='DMC24 '+v[6]+' workspace';const link=document.getElementById('life-link');link.href=v[5];link.textContent='Explore '+v[6];};tabs.forEach((b,i)=>{b.addEventListener('click',()=>activate(b));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();tabs[n].focus();activate(tabs[n]);}})});
  },

  "command-preview":function(){
    const views={
      sales:{title:'Turn destination expertise into business.',description:'Bring agent relationships, supplier contracts and FIT or group quotations into one connected sales process.',items:['CRM, enquiries and follow-ups','Multi-market supplier contracting','FIT & GIT quotation builder','AI-assisted, digital and PDF itineraries'],image:'dmc24-costing-quotations-dashboard.webp',alt:'DMC24 costing and quotations workspace',href:'costing-quotations.html',link:'Explore sales & quotations',label:'FROM OPPORTUNITY TO CONFIRMATION'},
      operations:{title:'Keep every service moving together.',description:'Connect bookings and supplier reservations with the people and services that bring each journey to life.',items:['Supplier confirmations and vouchers','Arrival and departure movements','Driver and guide duty slips','Transport, logistics and tour expenses'],image:'dmc24-operations-logistics-dashboard.webp',alt:'DMC24 operations and logistics workspace',href:'operations-logistics.html',link:'Explore operations & logistics',label:'FROM CONFIRMATION TO DELIVERY'},
      finance:{title:'See the business behind every booking.',description:'Bring financial follow-through into the same workflow, from invoices and collections to supplier payments and file profitability.',items:['Receivables and payables','Proforma and tax invoices','File-wise profit and loss','Monthly gross profit and MIS'],image:'dmc24-finance-profitability-dashboard.webp',alt:'DMC24 finance and profitability workspace',href:'finance-profitability.html',link:'Explore finance & profitability',label:'FROM DELIVERY TO PROFITABILITY'}
    };
    const tabs=[...document.querySelectorAll('[data-command-tab]')];
    const activate=button=>{const v=views[button.dataset.commandTab];tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===button));t.tabIndex=t===button?0:-1});document.getElementById('command-panel').setAttribute('aria-labelledby',button.id);document.getElementById('command-product-title').textContent=v.title;document.getElementById('command-product-description').textContent=v.description;document.getElementById('command-product-list').replaceChildren(...v.items.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));const img=document.getElementById('command-product-image');img.src='img/'+v.image;img.alt=v.alt;const link=document.getElementById('command-product-link');link.href=v.href;link.textContent=v.link;document.querySelector('.command-pill').textContent=v.label;};
    tabs.forEach((button,index)=>{button.addEventListener('click',()=>activate(button));button.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs[next].focus();activate(tabs[next]);}})});
  },
  "29d0a53ed969cf62":function(){
(function(){
  const main=document.querySelector('main');
  if(!main) return;

  /* Styles are maintained in css/main.css. */

  main.className='bnf-page';
  main.innerHTML=`
    <section class="bnf-hero"><div class="container bnf-hero-grid"><div><div class="bnf-kicker">Measurable business outcomes</div><h1 class="heading--compact">The Benefits of Running Your Business with DMC24</h1><p class="bnf-lead">DMC24 helps destination management companies respond faster, reduce operational effort, protect margins and make better decisions—from the first enquiry to final profitability.</p><div class="bnf-actions"><a class="btn btn-primary btn-primary--raised" href="#performance">See the Business Impact →</a><a class="btn btn-outline" href="request-demo.html">Request a Demo</a></div></div><aside class="bnf-command" aria-label="Illustrative DMC performance dashboard"><div class="bnf-command-top"><div><span class="bnf-live">Performance view</span><h2 class="heading--compact heading--card-scale">Your DMC at a glance</h2></div><small>Illustrative</small></div><div class="bnf-kpis"><div class="bnf-kpi"><span>Enquiries awaiting action</span><b>12</b><small>3 need attention today</small></div><div class="bnf-kpi"><span>Quote turnaround</span><b>3h 24m</b><small>Improving this month</small></div><div class="bnf-kpi"><span>Active conversion</span><b>31.8%</b><small>By selected period</small></div><div class="bnf-kpi"><span>Provisional GP</span><b>14.6%</b><small>Across open files</small></div></div></aside></div></section>

    <section><div class="container"><div class="bnf-kicker">Business outcomes</div><h2 class="heading--large">Turn Everyday Improvements into Visible Results.</h2><div class="bnf-outcomes"><article class="bnf-outcome"><b>Faster Response</b><span>Measure acknowledgement and quotation turnaround.</span></article><article class="bnf-outcome"><b>Stronger Conversion</b><span>See which markets, agents and salespeople convert.</span></article><article class="bnf-outcome"><b>Less Repetition</b><span>Carry information from enquiry through finance.</span></article><article class="bnf-outcome"><b>Margin Control</b><span>Compare expected and final profit by file.</span></article><article class="bnf-outcome"><b>Cash Visibility</b><span>Track collections, payables and overdue amounts.</span></article><article class="bnf-outcome"><b>Management Insight</b><span>Turn live operational data into decisions.</span></article></div></div></section>

    <section class="soft"><div class="container"><div class="bnf-kicker">Practical problems</div><h2 class="heading--large">Most DMCs Do Not Lack Effort.<br>They Lack Connected Information.</h2><p class="bnf-lead">When teams work across spreadsheets, inboxes and messages, routine work becomes slower and management loses visibility.</p><div class="bnf-problem-grid"><article class="bnf-problem"><span class="tag">Sales delay</span><h3 class="heading--compact">Enquiries Wait Too Long</h3><p>Rates and service details must be collected before a professional proposal can be returned.</p></article><article class="bnf-problem"><span class="tag">Commercial risk</span><h3 class="heading--compact">Costing Is Difficult to Verify</h3><p>Supplier costs, taxes, exchange rates and markups are often calculated separately.</p></article><article class="bnf-problem"><span class="tag">Lost opportunity</span><h3 class="heading--compact">Follow-Ups Depend on Individuals</h3><p>Important enquiries can be missed without shared reminders and priorities.</p></article><article class="bnf-problem"><span class="tag">Reservation risk</span><h3 class="heading--compact">Confirmations Need Chasing</h3><p>Teams lack one view of requested, confirmed, amended and pending services.</p></article><article class="bnf-problem"><span class="tag">Operational effort</span><h3 class="heading--compact">Every Team Builds Another List</h3><p>Guest movements, vehicles, guides and vouchers are repeatedly reorganised.</p></article><article class="bnf-problem"><span class="tag">Management gap</span><h3 class="heading--compact">Profit Is Known Too Late</h3><p>Final supplier costs and operational expenses are not always visible at file level.</p></article></div></div></section>

    <section id="performance"><div class="container bnf-split"><div><div class="bnf-kicker">Response performance</div><h2 class="heading--large">Turn Enquiry Speed into a Measurable KPI.</h2><p class="bnf-lead">Connect requirements, contracted products, costing, quotations and follow-ups so teams spend less time searching and more time responding.</p><div class="bnf-metric-list"><div class="bnf-metric">First-response time</div><div class="bnf-metric">Quotation turnaround</div><div class="bnf-metric">Replies within SLA</div><div class="bnf-metric">Ageing enquiries</div><div class="bnf-metric">Follow-ups due today</div><div class="bnf-metric">Performance by employee</div></div></div><figure class="bnf-chart"><div class="bnf-chart-head"><div><h3 class="heading--compact">Quotation Turnaround Trend</h3><span>Average hours from enquiry to first quote</span></div><span>Illustrative data</span></div><svg class="bnf-line-chart" viewBox="0 0 560 240" role="img" aria-label="Illustrative quotation turnaround reducing across six months"><g stroke="#e7e9ee" stroke-width="1"><path d="M35 35H535M35 85H535M35 135H535M35 185H535"/></g><path d="M40 55 C95 66 115 82 145 92 S220 118 250 126 S330 147 355 155 S440 172 525 184" fill="none" stroke="#d71962" stroke-width="5" stroke-linecap="round"/><path d="M40 55 C95 66 115 82 145 92 S220 118 250 126 S330 147 355 155 S440 172 525 184 L525 205 L40 205Z" fill="rgba(215,25,98,.08)"/><g fill="#d71962"><circle cx="40" cy="55" r="5"/><circle cx="145" cy="92" r="5"/><circle cx="250" cy="126" r="5"/><circle cx="355" cy="155" r="5"/><circle cx="440" cy="172" r="5"/><circle cx="525" cy="184" r="5"/></g></svg><div class="bnf-axis"><span>Month 1</span><span>Month 2</span><span>Month 3</span><span>Month 4</span><span>Month 5</span><span>Month 6</span></div><figcaption class="bnf-chart-note">Use live filters for market, employee, enquiry type and travel period.</figcaption></figure></div></section>

    <section class="soft"><div class="container"><div class="bnf-kicker">Operational efficiency</div><h2 class="heading--large">Enter Information Once. Use It Across the Business.</h2><p class="bnf-lead">The confirmed quotation continues into reservations, operations, finance and reporting instead of being recreated by every department.</p><div class="bnf-before-after"><article class="bnf-process"><h3 class="heading--compact">Without a Connected Platform</h3><ol><li>Copy requirements into a spreadsheet</li><li>Search multiple files for rates</li><li>Calculate costing separately</li><li>Prepare the quotation again</li><li>Re-enter confirmed services</li><li>Build another operations sheet</li><li>Recreate information for finance</li></ol></article><article class="bnf-process after"><h3 class="heading--compact">With DMC24</h3><ol><li>Capture the enquiry once</li><li>Use structured products and rates</li><li>Build and approve the quotation</li><li>Convert it into a travel file</li><li>Send supplier requests and vouchers</li><li>Operate from shared service data</li><li>Review invoices, cash flow and profit</li></ol></article></div></div></section>

    <section><div class="container bnf-split"><div><div class="bnf-kicker">Sales conversion</div><h2 class="heading--large">Know Where Enquiries Convert—and Where They Are Lost.</h2><p class="bnf-lead">Analyse the sales funnel by source market, agent, employee, enquiry type, destination, travel month and lost reason.</p><div class="bnf-metric-list"><div class="bnf-metric">Market conversion</div><div class="bnf-metric">Agent performance</div><div class="bnf-metric">Employee follow-up</div><div class="bnf-metric">Lost-reason analysis</div></div></div><figure class="bnf-chart"><div class="bnf-chart-head"><div><h3 class="heading--compact">Enquiry-to-Booking Funnel</h3><span>Where action is required</span></div><span>Illustrative data</span></div><div class="bnf-funnel"><div class="bnf-funnel-step"><span>Enquiries received</span><small>100%</small></div><div class="bnf-funnel-step"><span>Qualified</span><small>82%</small></div><div class="bnf-funnel-step"><span>Quoted</span><small>68%</small></div><div class="bnf-funnel-step"><span>Active follow-up</span><small>51%</small></div><div class="bnf-funnel-step"><span>Confirmed</span><small>32%</small></div></div><figcaption class="bnf-chart-note">Identify whether business is being lost through response time, pricing, availability, follow-up or product fit.</figcaption></figure></div></section>

    <section class="soft"><div class="container bnf-split"><figure class="bnf-chart"><div class="bnf-chart-head"><div><h3 class="heading--compact">Provisional GP vs Final GP</h3><span>Profitability by selected month</span></div><span>Illustrative data</span></div><div class="bnf-profit-bars"><div class="bnf-profit-row"><span>January · Expected</span><div class="bnf-track"><div class="bnf-fill" style="width:82%"></div></div><b>16.4%</b></div><div class="bnf-profit-row final"><span>January · Final</span><div class="bnf-track"><div class="bnf-fill" style="width:74%"></div></div><b>14.8%</b></div><div class="bnf-profit-row"><span>February · Expected</span><div class="bnf-track"><div class="bnf-fill" style="width:76%"></div></div><b>15.2%</b></div><div class="bnf-profit-row final"><span>February · Final</span><div class="bnf-track"><div class="bnf-fill" style="width:78%"></div></div><b>15.6%</b></div><div class="bnf-profit-row"><span>March · Expected</span><div class="bnf-track"><div class="bnf-fill" style="width:88%"></div></div><b>17.6%</b></div><div class="bnf-profit-row final"><span>March · Final</span><div class="bnf-track"><div class="bnf-fill" style="width:81%"></div></div><b>16.2%</b></div></div><figcaption class="bnf-chart-note">Compare original margin with confirmed supplier costs and operational expenses.</figcaption></figure><div><div class="bnf-kicker">Profitability control</div><h2 class="heading--large">Know What You Expect to Earn—and What You Actually Earned.</h2><p class="bnf-lead">Separate supplier costs, taxes, exchange rates, markup and selling price before sending a quotation. After travel, compare provisional GP with final GP and identify margin leakage.</p><div class="bnf-metric-list"><div class="bnf-metric">Selling value</div><div class="bnf-metric">Confirmed costs</div><div class="bnf-metric">Operational expenses</div><div class="bnf-metric">GP variance</div></div></div></div></section>

    <section><div class="container bnf-split"><div><div class="bnf-kicker">Market intelligence</div><h2 class="heading--large">Turn Market Data into Sales Decisions.</h2><p class="bnf-lead">Compare enquiry volume, conversion, sales value, average booking value, response time and gross profit by market.</p><div class="bnf-metric-list"><div class="bnf-metric">Top agents by market</div><div class="bnf-metric">Most requested products</div><div class="bnf-metric">Travel-month demand</div><div class="bnf-metric">Market-wise GP</div></div></div><figure class="bnf-chart"><div class="bnf-chart-head"><div><h3 class="heading--compact">Market Performance Comparison</h3><span>Conversion rate by source market</span></div><span>Illustrative data</span></div><div class="bnf-market"><div class="bnf-market-row"><span>Market A</span><div class="bnf-track"><div class="bnf-fill" style="width:78%"></div></div><b>39%</b></div><div class="bnf-market-row"><span>Market B</span><div class="bnf-track"><div class="bnf-fill" style="width:64%"></div></div><b>32%</b></div><div class="bnf-market-row"><span>Market C</span><div class="bnf-track"><div class="bnf-fill" style="width:52%"></div></div><b>26%</b></div><div class="bnf-market-row"><span>Market D</span><div class="bnf-track"><div class="bnf-fill" style="width:42%"></div></div><b>21%</b></div><div class="bnf-market-row"><span>Market E</span><div class="bnf-track"><div class="bnf-fill" style="width:34%"></div></div><b>17%</b></div></div><figcaption class="bnf-chart-note">Use live business data to focus sales and contracting effort.</figcaption></figure></div></section>

    <section class="soft"><div class="container bnf-split"><figure class="bnf-chart"><div class="bnf-chart-head"><div><h3 class="heading--compact">Supplier Confirmation Status</h3><span>Confirmed services and exceptions</span></div><span>Illustrative data</span></div><div class="bnf-confirm-grid"><div class="bnf-donut"><strong>62%</strong></div><div class="bnf-legend"><div><span><i style="background:#229a74"></i>Confirmed</span><b>62%</b></div><div><span><i style="background:#e99b25"></i>Requested</span><b>20%</b></div><div><span><i style="background:#d71962"></i>Needs action</span><b>11%</b></div><div><span><i style="background:#d9dde4"></i>Amended/other</span><b>7%</b></div></div></div><figcaption class="bnf-chart-note">Focus reservation teams on exceptions instead of checking every service manually.</figcaption></figure><div><div class="bnf-kicker">Reservation and operations</div><h2 class="heading--large">Know What Is Confirmed and What Still Needs Action.</h2><p class="bnf-lead">Follow each service from request to confirmation, voucher, allocation and operational completion.</p><div class="bnf-metric-list"><div class="bnf-metric">Pending confirmations</div><div class="bnf-metric">Supplier deadlines</div><div class="bnf-metric">Missing vouchers</div><div class="bnf-metric">Unallocated services</div><div class="bnf-metric">Daily movements</div><div class="bnf-metric">Operational exceptions</div></div></div></div></section>

    <section><div class="container"><div class="bnf-kicker">Performance scorecard</div><h2 class="heading--large">Measure Improvement Instead of Assuming It.</h2><p class="bnf-lead">Establish a baseline, compare the current period and monitor the trend month by month.</p><div class="bnf-scorecard"><table><thead><tr><th>Business Area</th><th>KPI</th><th>Management Question</th><th>Desired Direction</th></tr></thead><tbody><tr><td>Sales</td><td>First-response time</td><td>How quickly are new opportunities acknowledged?</td><td>Faster ↓</td></tr><tr><td>Sales</td><td>Quotation turnaround</td><td>How long does a customer wait for a proposal?</td><td>Faster ↓</td></tr><tr><td>Sales</td><td>Enquiry conversion</td><td>Which markets and agents produce confirmed business?</td><td>Higher ↑</td></tr><tr><td>Reservations</td><td>Confirmation turnaround</td><td>Which suppliers or services create delays?</td><td>Faster ↓</td></tr><tr><td>Operations</td><td>Exceptions per file</td><td>Where is delivery risk accumulating?</td><td>Lower ↓</td></tr><tr><td>Finance</td><td>Receivable ageing</td><td>Which collections require action?</td><td>Lower ↓</td></tr><tr><td>Profitability</td><td>Provisional vs final GP</td><td>Where is margin being lost?</td><td>Variance ↓</td></tr></tbody></table></div></div></section>

    <section class="soft"><div class="container"><div class="bnf-kicker">Benefits by department</div><h2 class="heading--large">Give Every Team a Clearer Way to Perform.</h2><div class="bnf-team-grid"><article class="bnf-team"><h3 class="heading--compact">Sales</h3><ul><li>Faster quotations</li><li>Structured follow-ups</li><li>Conversion visibility</li><li>Expected margin control</li></ul></article><article class="bnf-team"><h3 class="heading--compact">Contracting</h3><ul><li>Usable digital contracts</li><li>Market-specific rates</li><li>Offer and validity control</li><li>Contract-expiry visibility</li></ul></article><article class="bnf-team"><h3 class="heading--compact">Reservations</h3><ul><li>Supplier request tracking</li><li>Confirmation status</li><li>Amendment control</li><li>Voucher generation</li></ul></article><article class="bnf-team"><h3 class="heading--compact">Operations</h3><ul><li>Daily movements</li><li>Vehicle and guide allocation</li><li>Guest-service visibility</li><li>Exception management</li></ul></article><article class="bnf-team"><h3 class="heading--compact">Finance</h3><ul><li>Receivable and payable control</li><li>Due-date visibility</li><li>Expense reconciliation</li><li>File-wise P&amp;L</li></ul></article><article class="bnf-team"><h3 class="heading--compact">Management</h3><ul><li>Market analysis</li><li>Employee productivity</li><li>Revenue and GP</li><li>Current operational status</li></ul></article></div></div></section>

    <section class="bnf-final"><div class="container bnf-final-grid"><div><div class="bnf-kicker">From activity to accountability</div><h2 class="heading--large">See What Better Operational Control Could Look Like for Your DMC.</h2><p class="bnf-lead">Tell us how your teams currently manage enquiries, quotations, reservations, operations and finance. We will show you how DMC24 can connect those workflows and make performance visible.</p></div><div class="bnf-actions"><a class="btn btn-primary btn-primary--raised" href="request-demo.html">Request a DMC24 Demo →</a><a class="btn btn-outline" style="color:#fff;border-color:#777" href="mid-office.html">Explore Mid Office</a></div></div></section>
  `;
})();

},
  "2d292e7eaa536c10":function(){
if(document.querySelector('.dmc-master-header')){const btn=document.getElementById('dmcMasterMenuBtn'),menu=document.getElementById('dmcMasterMobile');btn?.addEventListener('click',()=>menu?.classList.toggle('open'));return;}

(()=>{const drop=(label,href,items)=>`<div class="dmc-master-item dmc-master-item--focusable"><a class="dmc-master-link" href="${href}">${label} ▾</a><div class="dmc-master-drop dmc-master-drop--inherited-type">${items.map(i=>`<a href="${i[0]}"><strong>${i[1]}</strong>${i[2]?`<small>${i[2]}</small>`:''}</a>`).join('')}</div></div>`;document.body.insertAdjacentHTML('afterbegin',`<header class="dmc-master-header dmc-master-header--compact"><div class="dmc-master-wrap dmc-master-nav"><a class="dmc-master-brand" href="index.html"><img class="image--intrinsic-ratio" src="img/dmc24-logo.png" alt="DMC24" loading="eager" decoding="async" width="449" height="128"></a><nav class="dmc-master-links" aria-label="Primary navigation">${drop('Product','what-is-dmc24.html',[['what-is-dmc24.html','What is DMC24?','Complete DMC operating platform'],['mid-office.html','Mid Office','Connected operational foundation'],['features.html','Features','Explore platform capability'],['benefits.html','Benefits','Measurable business outcomes'],['multi-dmc.html','Multi-DMC','One network, multiple destinations'],['integrations.html','API Integrations','Connect the wider ecosystem']])}${drop('Solutions','b2b.html',[['b2b.html','B2B Booking Platform','Sell through travel partners'],['b2c.html','B2C Booking Platform','Sell directly to travellers'],['local-sales.html','Local Sales','Capture in-destination revenue']])}${drop('Destinations','destinations.html',[['mauritius.html','Mauritius','Island operations'],['sri-lanka.html','Sri Lanka','Multi-city inbound operations'],['dubai.html','UAE','Hotels, offers and VAT'],['kenya.html','Kenya','Safari operations'],['egypt.html','Egypt','Cultural and Nile programmes'],['saudi-arabia.html','Saudi Arabia','Religious, heritage and leisure']])}<a class="dmc-master-link" href="pricing.html">Pricing</a>${drop('Resources','resources.html',[['how-to-adopt-dmc24.html','How to Adopt DMC24?','A practical adoption roadmap'],['case-studies.html','Case Studies','Transformation scenarios'],['blogs.html','Blogs & Insights','DMC technology and growth'],['brochures.html','Brochures','Product material'],['faqs.html','FAQs','Common questions']])}${drop('Company','about.html',[['about.html','About DMC24',''],['why-dmc24.html','Why DMC24?',''],['contact.html','Contact','']])}</nav><div class="dmc-master-actions"><a class="dmc-master-btn dmc-master-btn--compact" href="request-demo.html">Request a Demo →</a><button class="dmc-master-menu-btn" id="dmcMasterMenuBtn" aria-label="Open menu">☰</button></div></div><nav class="dmc-master-mobile dmc-master-mobile--compact" id="dmcMasterMobile" aria-label="Mobile navigation"><a href="index.html">Home</a><a href="what-is-dmc24.html">What is DMC24?</a><a href="mid-office.html">Mid Office</a><a href="features.html">Features</a><a href="benefits.html">Benefits</a><a href="b2b.html">B2B Booking Platform</a><a href="b2c.html">B2C Booking Platform</a><a href="local-sales.html">Local Sales</a><a href="destinations.html">All Destinations</a><a href="pricing.html">Pricing</a><a href="how-to-adopt-dmc24.html">How to Adopt DMC24?</a><a href="case-studies.html">Case Studies</a><a href="blogs.html">Blogs & Insights</a><a href="brochures.html">Brochures</a><a href="faqs.html">FAQs</a><a href="about.html">About DMC24</a><a href="contact.html">Contact</a></nav></header><main></main><section class="dmc-master-cta ${document.currentScript.dataset.ctaStyle === "hidden" ? "dmc-master-cta--hidden" : "dmc-master-cta--compact"}"><div class="dmc-master-wrap dmc-master-cta-grid"><div><div class="dmc-master-kicker dmc-master-kicker--compact">Run your DMC today. Build for tomorrow.</div><h2>Your Destination Expertise Deserves Better Technology.</h2><p>Tell us how your DMC operates today. We’ll show you how DMC24 can help you scale tomorrow.</p></div><div class="dmc-master-cta-actions"><a class="dmc-master-btn dmc-master-btn--compact" href="request-demo.html">Request a Demo →</a><a class="dmc-master-outline dmc-master-outline--compact" href="features.html">Explore Features</a></div></div></section><footer class="dmc-master-footer dmc-master-footer--compact"><div class="dmc-master-wrap"><div class="dmc-master-footer-top"><img class="image--intrinsic-ratio" src="img/dmc24-logo.png" alt="DMC24" loading="lazy" decoding="async" width="449" height="128"><nav class="dmc-master-footer-links dmc-master-footer-links--compact" aria-label="Footer navigation"><a href="what-is-dmc24.html">Product</a><a href="b2b.html">Solutions</a><a href="destinations.html">Destinations</a><a href="pricing.html">Pricing</a><a href="resources.html">Resources</a><a href="about.html">Company</a><a href="contact.html">Contact</a></nav></div><div class="dmc-master-copy">© 2026 DMC24. Your Destination Our Solution.</div></div></footer>`);const btn=document.getElementById('dmcMasterMenuBtn'),menu=document.getElementById('dmcMasterMobile');btn?.addEventListener('click',()=>menu.classList.toggle('open'));})();

},
  "73e346e53996f6c9":function(){

(function(){
  const btn=document.getElementById('dmcMasterMenuBtn');
  const menu=document.getElementById('dmcMasterMobile');
  if(btn && menu){
    btn.addEventListener('click',()=>menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));
  }
})();

},
  "8de0f2fcfd32c6e1":function(){
(() => {
  const root=document.getElementById('adoption-root');
  if(!root)return;
  const drop=(title,href,items)=>`<div class="ad-shell-item"><a class="ad-shell-link" href="${href}">${title} ▾</a><div class="ad-shell-drop">${items.map(i=>`<a href="${i[0]}"><strong>${i[1]}</strong>${i[2]?`<small>${i[2]}</small>`:''}</a>`).join('')}</div></div>`;
  const resources=[['how-to-adopt-dmc24.html','How to Adopt DMC24?','A practical roadmap for successful technology adoption'],['case-studies.html','Case Studies','Transformation and implementation scenarios'],['blogs.html','Blogs & Insights','DMC technology, operations and growth'],['brochures.html','Brochures','Product and module material'],['faqs.html','FAQs','Common DMC24 questions']];
  const challenges=[['HAB','Familiar Habits','Spreadsheets and email feel easier during the first weeks because teams already know them.'],['FLOW','Different Processes','Sales, contracting, reservations, operations and finance may each follow their own methods.'],['DATA','Unstructured Data','Contracts, rates and supplier conditions must be cleaned before becoming useful digital inventory.'],['TIME','Limited Training Time','Operational teams need protected time to learn while continuing to serve customers.'],['EXP','Immediate Expectations','Not every product, report and exception can be configured perfectly on day one.'],['OWN','Lack of Ownership','Adoption slows when implementation is treated only as an IT responsibility.'],['DEST','Destination Complexity','Local taxes, contracts, logistics and product rules require thoughtful configuration.'],['PAR','Parallel Systems','Permanent use of unofficial spreadsheets prevents one reliable source of information.']];
  const phases=[
    ['Phase 1','Understand Operations','Document how enquiries, contracting, reservations, operations, finance and reporting currently work.',['Process discovery','Scope and priorities','Agreed workflows']],
    ['Phase 2','Prepare the Foundation','Clean users, agents, suppliers, products, currencies, taxes and commercial rules.',['Data templates','Master setup','Configuration decisions']],
    ['Phase 3','Train by Department','Teach each team the capabilities and responsibilities relevant to its daily role.',['Role-based sessions','Practice transactions','Department super users']],
    ['Phase 4','Pilot with Real Business','Start with a controlled group of live enquiries, suppliers or one source market.',['Real transactions','Gap identification','Workflow correction']],
    ['Phase 5','Controlled Go-Live','Move new enquiries, bookings, confirmations, vouchers and financial activity into DMC24.',['Primary system','Daily monitoring','Management discipline']],
    ['Phase 6','Optimise & Expand','Add advanced reports, integrations, extensions, companies and destinations after the core is stable.',['Advanced MIS','B2B / B2C / Local Sales','Multi-DMC and APIs']]
  ];
  const questions=['An internal implementation owner has been nominated.','Department heads are involved in workflow decisions.','Supplier contracts and rates are accessible.','Employees can dedicate protected time to training.','Management is willing to review existing processes.','A controlled pilot can be started with real business.','Management will enforce the agreed workflow.','Essential go-live reports have been identified.','The team is willing to phase advanced capabilities.','Parallel spreadsheets will be retired after transition.'];
  root.innerHTML=`<div class="ad-page">
  <header class="ad-shell-header"><div class="container ad-shell-nav"><a class="ad-shell-brand" href="index.html"><img class="image--intrinsic-ratio" src="img/dmc24-logo.png" alt="DMC24" loading="eager" decoding="async" width="449" height="128"></a><nav class="ad-shell-links" aria-label="Primary navigation">${drop('Product','what-is-dmc24.html',[['what-is-dmc24.html','What is DMC24?','Complete DMC operating platform'],['mid-office.html','Overall Mid-Office Features','Connected operational foundation'],['features.html','Features','Explore platform capability'],['benefits.html','Benefits','Measurable business outcomes'],['multi-dmc.html','Multi-DMC','One network, multiple destinations'],['integrations.html','API Integrations','Connect the wider ecosystem']])}${drop('Solutions','b2b.html',[['b2b.html','B2B Booking Platform','Sell through travel partners'],['b2c.html','B2C Booking Platform','Sell directly to travellers'],['local-sales.html','Local Sales','Capture in-destination revenue']])}<a class="ad-shell-link" href="destinations.html">Destinations</a><a class="ad-shell-link" href="pricing.html">Pricing</a>${drop('Resources','resources.html',resources)}${drop('Company','about.html',[['about.html','About DMC24',''],['why-dmc24.html','Why DMC24?',''],['contact.html','Contact','']])}</nav><div class="ad-shell-actions"><a class="btn btn-primary" href="request-demo.html">Request a Demo →</a><button class="ad-menu-btn" id="adMenu" aria-label="Open menu">☰</button></div></div><nav class="ad-mobile" id="adMobile" aria-label="Mobile navigation"><a href="index.html">Home</a><a href="what-is-dmc24.html">What is DMC24?</a><a href="features.html">Features</a><a href="benefits.html">Benefits</a><a href="destinations.html">Destinations</a><a href="pricing.html">Pricing</a>${resources.map(i=>`<a href="${i[0]}">${i[1]}</a>`).join('')}<a href="about.html">About DMC24</a><a href="contact.html">Contact</a></nav></header>
  <main>
  <section class="ad-hero ad-hero--command"><div class="container ad-hero-grid module-command-grid"><div><div class="ad-eyebrow">DMC24 Adoption Guide</div><h1>How to Adopt DMC24 in Your Business</h1><p class="ad-lead">Adopting DMC24 involves preparing supplier and product data, agreeing departmental workflows, training teams by role and rolling out in stages. A clear implementation owner and regular reviews help the business track adoption and resolve operational gaps.</p><div class="author-bio" aria-label="About the author"><p class="author-bio-name">By <a href="/vishal-shah">Vishal Shah</a></p><p>Published <time datetime="2026-09-25">25 September 2026</time> · Updated <time datetime="2026-10-11">11 October 2026</time></p><p>Empowering process and people | Technology entrepreneur and consultant | 20+ years of experience | Business process expert | Travel technology consultant | Banking solutions</p><a href="https://www.linkedin.com/in/vishalcshah/" target="_blank" rel="noopener noreferrer">Author profile</a></div><div class="ad-actions"><a class="btn btn-primary" href="#roadmap">See the Adoption Roadmap →</a><a class="btn btn-outline" href="request-demo.html">Discuss Your Implementation</a></div></div><aside class="ad-summary ad-summary--command"><div class="ad-eyebrow" style="color:#ff8bb5">The adoption equation</div><h2 class="heading--card-scale">Technology + Process + People + Discipline</h2><p>A successful implementation brings all four together. Software alone cannot create operational change.</p><div class="ad-summary-grid"><div class="ad-summary-card"><b>Structured Data</b><span>Products, rates and rules</span></div><div class="ad-summary-card"><b>Shared Workflow</b><span>Connected departments</span></div><div class="ad-summary-card"><b>Role Training</b><span>Relevant daily practice</span></div><div class="ad-summary-card"><b>Management Support</b><span>Ownership and follow-through</span></div></div></aside></div></section>
  <section><div class="container"><div class="ad-truth ad-truth--editorial">DMC24 implementation is not a one-time software installation. It is a structured transition toward connected, measurable and scalable DMC operations.</div></div></section>
  <section class="ad-soft"><div class="container"><header class="ad-head ad-head--editorial"><div class="ad-eyebrow">Why adoption takes time</div><h2>Destination Management Is Operationally Complex.</h2><p class="ad-lead">A single enquiry may include multiple cities, hotels, transfers, activities, guides, taxes, currencies, revisions, confirmations, movements and financial obligations. Converting that knowledge into a connected workflow needs structure.</p></header><div class="ad-challenge-grid">${challenges.map(c=>`<article class="ad-card module-card2--editorial"><div class="ad-icon">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p></article>`).join('')}</div></div></section>
  <section id="roadmap"><div class="container"><header class="ad-head ad-head--editorial center"><div class="ad-eyebrow">The adoption journey</div><h2>A Practical, Phased Transition.</h2><p class="ad-lead">Begin with operational clarity, prove the workflow with real business and expand only after the foundation is stable.</p></header><div class="ad-roadmap">${phases.map(p=>`<article class="ad-phase ad-phase--editorial"><b>${p[0]}</b><h3>${p[1]}</h3><p>${p[2]}</p><ul>${p[3].map(x=>`<li>${x}</li>`).join('')}</ul></article>`).join('')}</div></div></section>
  <section class="ad-soft"><div class="container"><header class="ad-head ad-head--editorial"><div class="ad-eyebrow">Shared responsibility</div><h2>Successful Adoption Needs Both Teams.</h2></header><div class="ad-responsibility"><article class="ad-owner ad-owner--editorial dmc"><h3>DMC24 Provides</h3><ul><li>Implementation planning</li><li>System configuration</li><li>Department training</li><li>Workflow guidance</li><li>Data templates</li><li>Technical assistance</li><li>Issue resolution</li><li>Ongoing support</li></ul></article><article class="ad-owner ad-owner--editorial"><h3>The DMC Provides</h3><ul><li>Management sponsor</li><li>Implementation owner</li><li>Department representatives</li><li>Accurate product data</li><li>Timely decisions</li><li>Employee participation</li><li>Real pilot transactions</li><li>Process discipline</li></ul></article></div><div class="ad-champion ad-champion--editorial"><h3>The DMC24 Champion</h3><p>Nominate one internal owner to coordinate departments, consolidate decisions, monitor data and training, support users and work with the DMC24 team. Larger DMCs should also nominate a super user in each department.</p></div></div></section>
  <section><div class="container"><header class="ad-head ad-head--editorial"><div class="ad-eyebrow">Role-based learning</div><h2>Train Each Team for the Work It Performs.</h2></header><div class="ad-table-wrap"><table class="ad-training ad-training--editorial"><thead><tr><th>Team</th><th>Training focus</th><th>Early success indicator</th></tr></thead><tbody><tr><td>Management</td><td>Dashboards, approvals, controls and MIS</td><td>Weekly management review begins</td></tr><tr><td>Sales</td><td>CRM, enquiries, follow-ups and conversion</td><td>New enquiries are recorded consistently</td></tr><tr><td>Contracting</td><td>Products, rates, seasons, offers and policies</td><td>Priority inventory becomes quote-ready</td></tr><tr><td>Costing</td><td>FIT, GIT, options, markup and quotations</td><td>First live quotations are generated</td></tr><tr><td>Reservations</td><td>Supplier requests, confirmations and vouchers</td><td>Pending actions become visible</td></tr><tr><td>Operations</td><td>Movements, vehicles, guides and service delivery</td><td>Operational lists are produced</td></tr><tr><td>Finance</td><td>Invoices, receivables, payables, expenses and P&amp;L</td><td>First files reach profitability review</td></tr></tbody></table></div></div></section>
  <section class="ad-soft"><div class="container"><header class="ad-head ad-head--editorial center"><div class="ad-eyebrow">The transition</div><h2>What Changes During Adoption?</h2></header><div class="ad-compare ad-compare--editorial"><article><h3>Before DMC24</h3><ul><li>Data spread across files and emails</li><li>Individual working methods</li><li>Manual quotation calculations</li><li>Supplier follow-up through inboxes</li><li>Limited profitability visibility</li><li>Reports assembled manually</li></ul></article><article><h3>During Adoption</h3><ul><li>Data is cleaned and configured</li><li>Common workflows are introduced</li><li>Teams practise costing rules</li><li>Confirmation status is recorded</li><li>Costs and expenses are reconciled</li><li>Live operational data accumulates</li></ul></article><article><h3>After Adoption</h3><ul><li>One structured source of information</li><li>Connected departmental processes</li><li>Faster, consistent quotations</li><li>Pending supplier actions are visible</li><li>File-wise and monthly GP is measurable</li><li>Dashboards support decisions</li></ul></article></div></div></section>
  <section><div class="container"><header class="ad-head ad-head--editorial"><div class="ad-eyebrow">An honest assessment</div><h2>The Advantages and the Challenges.</h2></header><div class="ad-procon"><article class="ad-list-panel ad-list-panel--editorial pro"><h3>Long-Term Advantages</h3><ul><li>One connected source of information</li><li>Faster enquiry response</li><li>More accurate quotations</li><li>Better supplier and operational control</li><li>Clearer financial and profitability visibility</li><li>Reduced dependency on individuals</li><li>Scalable growth across markets and channels</li></ul></article><article class="ad-list-panel ad-list-panel--editorial con"><h3>Short-Term Challenges</h3><ul><li>Initial data preparation</li><li>Temporary reduction in speed while learning</li><li>Resistance to changing familiar habits</li><li>Need for process standardisation</li><li>Dedicated training commitment</li><li>Configuration refinements during live use</li><li>Management discipline to retire parallel systems</li></ul></article></div></div></section>
  <section class="ad-soft"><div class="container"><header class="ad-head ad-head--editorial"><div class="ad-eyebrow">Measure adoption</div><h2>Track Behaviour, Not Only Software Activation.</h2><p class="ad-lead">A system is adopted when daily work moves through it consistently.</p></header><div class="ad-kpis">${[['INQ','Enquiries entered'],['QTE','Quotations generated'],['BKG','Bookings converted'],['SUP','Confirmations recorded'],['VOC','Vouchers produced'],['INV','Invoices generated'],['P&L','Files profitability-ready'],['USR','Active employee usage']].map(k=>`<div class="ad-kpi ad-kpi--editorial"><b>${k[0]}</b><span>${k[1]}</span></div>`).join('')}</div></div></section>
  <section><div class="container"><div class="ad-assessment ad-assessment--command"><header class="ad-head ad-head--editorial"><div class="ad-eyebrow" style="color:#ff8bb5">Adoption readiness check</div><h2>How Ready Is Your DMC?</h2><p class="ad-lead">Select the statements that are already true for your organisation.</p></header><div class="ad-check-grid">${questions.map((q,i)=>`<label class="ad-check"><input type="checkbox" data-readiness><span>${q}</span></label>`).join('')}</div><div class="ad-result" id="adResult">Select the statements above to calculate your readiness.</div></div></div></section>
  </main>
  <section class="ad-shell-cta"><div class="container ad-shell-cta-grid"><div><div class="ad-eyebrow" style="color:#ff8bb5">Technology makes expertise scalable</div><h2>Build an Adoption Plan Around Your DMC.</h2><p>Your team’s destination knowledge remains the foundation. DMC24 helps organise it, connect departments and turn it into a repeatable operating discipline.</p></div><div class="ad-actions"><a class="btn btn-primary" href="request-demo.html">Discuss an Adoption Plan →</a></div></div></section>
  <footer class="ad-shell-footer"><div class="container"><div class="ad-shell-footer-top"><img class="image--intrinsic-ratio" src="img/dmc24-logo.png" alt="DMC24" loading="lazy" decoding="async" width="449" height="128"><nav class="ad-shell-footer-links" aria-label="Footer navigation"><a href="what-is-dmc24.html">Product</a><a href="b2b.html">Solutions</a><a href="destinations.html">Destinations</a><a href="pricing.html">Pricing</a><a href="resources.html">Resources</a><a href="about.html">Company</a><a href="contact.html">Contact</a></nav></div><div class="ad-copy">© 2026 DMC24. Your Destination Our Solution.</div></div></footer>
  </div>`;
  const menu=document.getElementById('adMenu'),mobile=document.getElementById('adMobile');menu?.addEventListener('click',()=>mobile.classList.toggle('open'));
  const checks=[...document.querySelectorAll('[data-readiness]')],result=document.getElementById('adResult');
  const assess=()=>{const n=checks.filter(c=>c.checked).length;let label=n>=8?'Ready to Start':n>=6?'Ready with Data Preparation':n>=3?'Needs Process Alignment':'Requires a Phased Implementation Plan';result.innerHTML=`Readiness: <span>${label}</span> · ${n} of ${checks.length} foundations in place.`};
  checks.forEach(c=>c.addEventListener('change',assess));
})();

},
  "b1206a2f9e43669e":function(){
(()=>{
  const current=document.querySelector('.pricing-grid')?.closest('section');
  if(!current)return;

  const edition=document.body.dataset.page==='seychelles'?'Seychelles':'Maldives';
  const plans=[
    {
      code:'BIZ',name:'Business',description:`Booking control for growing ${edition} DMCs.`,monthly:'$350',yearly:'$3,600',setup:'None',heading:'What’s included',features:[
        'Booking Manager','Supplier setup','Customer management for B2B and direct business','GST and Green Tax setup','Direct booking management','Booking amendments and cancellations','Reservations','Guest vouchers','Proforma invoices','Daily arrival and departure management','Booking dashboard','Booking, sales and logistics reports','Implementation and setup in 3 days','Onboarding meeting','Up to 5 users and single-branch operations','4 training sessions included','7 days of system-adoption support','Basic WhatsApp support','Shared AWS server, 30 GB with backup'
      ]
    },
    {
      code:'PRO',name:'Professional',description:'Complete resort contracting, quotations, bookings and financial control.',monthly:'$550',yearly:'$6,000',setup:'USD 1,500',heading:'Everything in Business, plus',preferred:true,features:[
        'Full system with contracting, quotations and bookings','Contracting for multiple markets and seasons','Combined-offer management','Allotment, stop-sale, free-sale and request-availability management','Resort-package management','Business-market setup','Multi-market markup management','Multi-resort quotations','Split-room quotations','Create quotations in under 5 minutes','Cart-based quotation interface','Markup-adjustment module','Booking and cancellation workflows','Receivable and payable management','Credit and debit note management','GST and Green Tax reports','Finance reports and file-wise P&amp;L','Room-night production report','Market-analysis statistics','Implementation and setup in 3 days','Onboarding meeting','Up to 10 users and single-branch operations','8 training sessions included','7 days of system-adoption support','Advanced WhatsApp support','Shared AWS server, 30 GB with backup'
      ]
    },
    {
      code:'ENT',name:'Enterprise',description:'Extend Professional with a complete B2B booking platform.',monthly:'$950',yearly:'$10,800',setup:'USD 2,000',heading:'Everything in Professional, plus',features:[
        'B2B booking platform for agent partners','Credit and non-credit agent management','Unlimited agent logins','Agent registration with automatic sign-up workflow','Branded B2B user interface','Resort search with split-stay support','Static resort content management','Resort listing pages','Detailed resort pages','Complete bookings in under 5 minutes','Automatic markup, Green Tax and GST calculation','Time-limit-based cancellation management','Payment-gateway integration','Implementation and setup in 10 days','2 training sessions included','7 days of system-adoption support','Advanced WhatsApp support','Shared AWS server, 50 GB with backup'
      ]
    }
  ];

  const cards=plans.map(plan=>`<article class="sl-plan${plan.preferred?' is-preferred':''}">${plan.preferred?'<div class="sl-preferred">Most Preferred</div>':''}<div class="sl-plan-top"><span class="sl-plan-code">${plan.code}</span><h3>${plan.name}</h3><p>${plan.description}</p><div class="sl-plan-price" data-monthly="${plan.monthly}" data-yearly="${plan.yearly}"><strong>${plan.monthly}</strong><small>/ month</small></div><div class="sl-plan-saving" aria-live="polite">Flexible monthly subscription</div><div class="sl-setup-fee">One-time setup fee: ${plan.setup || 'Contact us'}</div><a class="btn ${plan.preferred?'btn-primary':'btn-outline'}" href="contact.html#demo">Request a Demo</a></div><div class="sl-plan-includes"><h4>${plan.heading}</h4><ul>${plan.features.map(feature=>`<li>${feature}</li>`).join('')}</ul></div></article>`).join('');

  current.outerHTML=`<section class="sl-subscriptions maldives-plans" id="subscriptions"><div class="container"><div class="sl-plan-head"><div><div class="kicker">${edition} Subscription Plans</div><h2>Choose the DMC24 Version That Fits Your Growth.</h2><p class="lead">Compare the ${edition} Business, Professional and Enterprise editions. All prices are in USD.</p></div><div class="sl-billing" role="group" aria-label="Choose billing period"><button class="is-active" type="button" data-billing="monthly" aria-pressed="true">Monthly</button><button type="button" data-billing="yearly" aria-pressed="false">Yearly <span>Save $600</span></button></div></div><div class="sl-plan-grid">${cards}</div><p class="sl-price-footnote">Yearly subscriptions save USD 600 compared with twelve monthly payments. Payment-gateway and other third-party usage charges may apply where stated.</p></div></section>`;

  const toggle=document.querySelector('.maldives-plans .sl-billing');
  const buttons=[...toggle.querySelectorAll('button[data-billing]')];
  const prices=[...document.querySelectorAll('.maldives-plans .sl-plan-price')];
  const setBilling=period=>{
    buttons.forEach(button=>{const active=button.dataset.billing===period;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active))});
    prices.forEach(price=>{price.querySelector('strong').textContent=price.dataset[period];price.querySelector('small').textContent=period==='monthly'?'/ month':'/ year';const note=price.nextElementSibling;note.textContent=period==='monthly'?'Flexible monthly subscription':'Save USD 600 with yearly billing';note.classList.toggle('is-saving',period==='yearly')});
  };
  buttons.forEach(button=>button.addEventListener('click',()=>setBilling(button.dataset.billing)));
})();

},
  "d9ca512c7cb7a75c":function(){
(()=>{
const main=document.querySelector('main');
if(!main)return;
main.classList.add('main--corporate');
main.innerHTML=`
<section class="pu-hero">
  <div class="pu-wrap pu-hero-grid">
    <div>
      <div class="pu-kicker">The company behind DMC24</div>
      <h1>Puratech: Travel Technology for<span> Tour Operators</span></h1>
      <p class="pu-lead">Puratech develops travel technology and provides process consulting, integrations and implementation support for tour operators and destination management companies.</p>
      <div class="pu-actions"><a class="pu-btn" href="https://www.puratech.in" target="_blank" rel="noopener">Visit Puratech →</a><a class="pu-outline" href="contact.html">Talk to a Consultant</a></div>
    </div>
    <div class="pu-system" aria-label="Puratech transformation model">
      <div class="pu-system-head"><small>THE PURATECH APPROACH</small><strong>Consult. Build. Implement. Grow.</strong></div>
      <div class="pu-system-flow">
        <article><b>01</b><div><strong>Strategy</strong><span>Understand the business model, markets and operational friction.</span></div></article>
        <article><b>02</b><div><strong>Technology</strong><span>Select and configure the right product architecture.</span></div></article>
        <article><b>03</b><div><strong>Operations</strong><span>Translate real workflows into connected digital processes.</span></div></article>
        <article><b>04</b><div><strong>Growth</strong><span>Enable distribution, insight and scalable commercial control.</span></div></article>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="pu-wrap">
    <header class="pu-heading"><div class="pu-kicker">Travel technology consulting</div><h2>More Than Software Development.</h2><p>Puratech maps travel-business processes, identifies technology requirements and supports implementation across operations and distribution.</p></header>
    <div class="pu-three">
      <article class="pu-card"><div class="pu-icon">SC</div><h3>Strategic Consulting</h3><p>Business process discovery, technology roadmaps, product planning and transformation priorities aligned to commercial goals.</p></article>
      <article class="pu-card"><div class="pu-icon">TE</div><h3>Technology Enablement</h3><p>Purpose-built platforms, integrations and digital distribution tools designed for travel businesses and their ecosystems.</p></article>
      <article class="pu-card"><div class="pu-icon">OT</div><h3>Operational Transformation</h3><p>Workflow redesign, onboarding, data readiness and team adoption that turn technology investment into daily business value.</p></article>
    </div>
  </div>
</section>

<section class="pu-facts">
  <div class="pu-wrap pu-fact-grid">
    <div><strong>15+</strong><span>Years of technology excellence</span></div>
    <div><strong>50+</strong><span>Travel technology professionals</span></div>
    <div><strong>100+</strong><span>Implementations worldwide</span></div>
    <div><strong>5</strong><span>Global regions served</span></div>
    <div><strong>3</strong><span>Connected travel verticals</span></div>
  </div>
</section>

<section class="pu-soft">
  <div class="pu-wrap">
    <header class="pu-heading"><div class="pu-kicker">The product ecosystem</div><h2>Specialised Platforms. One Travel Technology Vision.</h2><p>Each Puratech product is designed around a distinct operating model, while sharing the same focus on connected workflows, commercial control and practical implementation.</p></header>
    <div class="pu-products">
      <article class="pu-product pu-etos"><div class="pu-wordmark">ETOS <i>GLOBAL</i></div><h3>Enterprise Tour Operator Software</h3><p>Enterprise technology for tour operators managing complex products, distribution, operations and finance across markets.</p><a href="https://www.puratech.in/etos.html" target="_blank" rel="noopener">Explore ETOS →</a></article>
      <article class="pu-product pu-dmc"><div class="pu-wordmark">DMC<span>24</span></div><h3>DMC Operating Platform</h3><p>End-to-end technology for destination companies—from enquiry and contracting to bookings, logistics, finance and MIS.</p><a href="what-is-dmc24.html">Explore DMC24 →</a></article>
      <article class="pu-product pu-umrah"><div class="pu-wordmark">Umrah<span>360</span></div><h3>Umrah Operations Platform</h3><p>A specialised ecosystem for operators handling pilgrimage products, hotels, transport, ground services and distribution.</p><a href="https://www.puratech.in" target="_blank" rel="noopener">Learn more →</a></article>
      <article class="pu-product pu-series"><div class="pu-wordmark">Series<span>180</span></div><h3>Series Departure Management</h3><p>Technology for building, operating and distributing scheduled group departures with stronger inventory and sales control.</p><a href="https://www.puratech.in" target="_blank" rel="noopener">Learn more →</a></article>
    </div>
  </div>
</section>

<section>
  <div class="pu-wrap pu-market-grid">
    <div><div class="pu-kicker">What comes next</div><h2>From Operating Platforms to Digital Marketplaces.</h2><p class="pu-lead">Puratech is extending its domain platforms into direct-to-consumer marketplaces that connect specialised inventory with travellers through structured, technology-led distribution.</p></div>
    <div class="pu-market-cards">
      <article><span>UPCOMING</span><h3>Umrah Marketplace</h3><p>A consumer marketplace for discovering and booking structured Umrah packages and connected travel services.</p></article>
      <article><span>UPCOMING</span><h3>Series Departures Marketplace</h3><p>A D2C platform for discovering confirmed departures, comparing programmes and booking scheduled group tours.</p></article>
    </div>
  </div>
</section>

<section class="pu-dark">
  <div class="pu-wrap">
    <header class="pu-heading"><div class="pu-kicker">Client credibility</div><h2>Built With—and for—Travel Businesses.</h2><p>Puratech's portfolio spans destination companies, tour operators, pilgrimage specialists, online travel businesses and enterprise travel groups.</p></header>
    <div class="pu-client-area">
      <article class="pu-featured-client"><small>PUBLICLY FEATURED CLIENT</small><strong>UmrahBookings</strong><p>A specialised Umrah travel platform featured in Puratech's implementation portfolio.</p></article>
      <div class="pu-segments">
        <span>Destination Management Companies</span><span>Tour Operators</span><span>Hajj &amp; Umrah Operators</span><span>Online Travel Businesses</span><span>Enterprise Travel Groups</span><span>Group Departure Specialists</span>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="pu-wrap">
    <header class="pu-heading"><div class="pu-kicker">Why Puratech</div><h2>Domain Understanding Changes the Quality of Technology.</h2></header>
    <div class="pu-four">
      <article class="pu-card"><div class="pu-num">01</div><h3>Travel-First Thinking</h3><p>Products begin with how travel businesses contract, quote, operate, account and distribute—not with generic software assumptions.</p></article>
      <article class="pu-card"><div class="pu-num">02</div><h3>Consulting-Led Delivery</h3><p>Implementation connects system configuration with business process, data structure, responsibilities and measurable outcomes.</p></article>
      <article class="pu-card"><div class="pu-num">03</div><h3>Specialised Product IP</h3><p>Multiple focused platforms address the distinct realities of tour operations, DMCs, pilgrimage travel and series departures.</p></article>
      <article class="pu-card"><div class="pu-num">04</div><h3>Long-Term Partnership</h3><p>Onboarding, training, support and continuous product development help customers keep improving beyond go-live.</p></article>
    </div>
  </div>
</section>

<section class="pu-final">
  <div class="pu-wrap pu-final-grid"><div><div class="pu-kicker">Start the conversation</div><h2>Transform Travel Operations With Technology That Understands Travel.</h2><p>Talk to Puratech about your operating model, current systems and growth priorities.</p></div><div class="pu-actions"><a class="pu-btn" href="contact.html">Speak to Our Team →</a><a class="pu-outline" href="https://www.puratech.in" target="_blank" rel="noopener">Visit puratech.in</a></div></div>
</section>`;
})();

},
  "db4deda414869ea0":function(){
(function(){
const main=document.querySelector('main');if(!main)return;
const flow=['Enquiry|Capture the opportunity and required services.','Costing|Use structured products, rates and rules.','Quotation|Present professional, profitable options.','Booking|Convert the sale into a controlled file.','Suppliers|Request, confirm and amend every service.','Operations|Coordinate guests, vehicles and fulfilment.','Finance|Track invoices, collections and payments.','Profit|Measure provisional and final performance.'];
const complexity=[['FIT','FIT, GIT, Series & MICE','Manage individual, group, fixed-series and event-led business.'],['MKT','Markets & Currencies','Apply market-specific rates, currencies and commercial rules.'],['OFR','Contracts & Offers','Control seasons, policies, tactical offers and combinations.'],['OPS','Ground Operations','Coordinate suppliers, entrances, vehicles, drivers and guides.'],['KM','Routes & Mileage','Cost transfers, transport, disposal and multi-city journeys.'],['TAX','Destination Tax Rules','Configure VAT, GST, levies and service-charge treatment.'],['RES','Supplier Control','Manage requests, confirmations, amendments and vouchers.'],['P&L','File Profitability','Compare selling value, operational cost and final profit.']];
const departments=[['Sales','Enquiries, agents, follow-ups, quotations and conversions.'],['Contracting','Products, rates, seasons, offers and supplier conditions.'],['Reservations','Requests, confirmations, amendments and vouchers.'],['Operations','Arrivals, departures, vehicles, drivers and daily services.'],['Finance','Invoices, receivables, payables, expenses and profitability.'],['Management','Employee activity, source markets, revenue and gross profit.']];
const proof=[['450+','Operational capabilities across the DMC lifecycle'],['FIT + GIT','Individual, group, series and MICE workflows'],['3 Channels','Optional B2B, B2C and Local Sales extensions'],['One File','Sales, operations, finance and profitability connected'],['Multi-Market','Contracting, markup and performance controls'],['Multi-Currency','Controlled supplier and selling currencies'],['Multi-DMC','Local strength with network-wide visibility'],['Connected','API, payment and accounting integrations']];
main.innerHTML=`
<section class="wd-hero channel-hero--command"><div class="container wd-hero-grid module-command-grid"><div><div class="eyebrow eyebrow--spaced">Why DMC24?</div><h1 class="heading--compact">Why Choose DMC24 for Your Destination Business?</h1><p class="lead lead--slate">DMC24 connects supplier contracts, quotations, bookings, guest movements and operational finance in a shared travel file. It gives sales, reservations, operations and finance access to the booking information they need.</p><p class="lead lead--slate"><strong>Choose the modules, distribution channels and integrations that match your destination and operating requirements.</strong></p><div class="hero-actions"><a class="btn btn-primary btn-primary--raised" href="request-demo.html">Request a DMC24 Demo →</a><a class="btn btn-outline" href="#difference">See the Difference</a></div></div><aside class="wd-visual channel-panel--command"><span class="pill pill--compact" >The invisible engine of every journey</span><h2 class="heading--compact heading--card-scale">One guest experience. Many moving parts.</h2><p>DMC24 gives every team one connected travel file instead of another disconnected tool.</p><div class="wd-stack journey-stack--command"><div><b>01</b><span>Global agent sends a complex enquiry</span></div><div><b>02</b><span>Contracted services become a profitable proposal</span></div><div><b>03</b><span>Suppliers, guests and operations stay coordinated</span></div><div><b>04</b><span>Management sees cost, collection and profit</span></div></div></aside></div></section>
<section class="outcome-section"><div class="container"><header class="section-head section-head--compact"><div class="kicker">The operational backbone</div><h2 class="heading--large">The Journey the Traveller Never Sees.</h2><p class="lead lead--slate">The same travel file moves across departments without repeatedly recreating information.</p></header><div class="wd-flow module-flow--editorial">${flow.map((x,i)=>{const [h,p]=x.split('|');return `<article><b>0${i+1}</b><h3 class="heading--compact">${h}</h3><p>${p}</p></article>`}).join('')}</div></div></section>
<section class="section-alt outcome-section" id="difference"><div class="container"><header class="section-head section-head--compact"><div class="kicker">From fragmented activity to connected control</div><h2 class="heading--large">A DMC Should Not Have to Operate Through Disconnected Tools.</h2></header><div class="wd-compare comparison--editorial"><div class="wd-col"><h3 class="heading--compact">Without DMC24</h3><div class="wd-list">${['Enquiries spread across emails and spreadsheets','Contracts stored in files sales cannot use easily','Quotations and markups calculated inconsistently','Supplier confirmations followed through messages','Operations depend on personal knowledge','Profit appears only after completion'].map(x=>`<div class="wd-row"><b>!</b><span>${x}</span></div>`).join('')}</div></div><div class="wd-col"><h3 class="heading--compact">With DMC24</h3><div class="wd-list">${['Every enquiry is recorded, assigned and followed up','Products, rates and policies become usable inventory','Controlled costing and market- or agent-specific markups','Supplier status remains visible service by service','Guest movements and allocations are shared','Provisional and final profitability remain visible'].map(x=>`<div class="wd-row"><b>✓</b><span>${x}</span></div>`).join('')}</div></div></div></div></section>
<section class="outcome-section"><div class="container"><header class="section-head section-head--compact"><div class="kicker">Built for DMCs—not adapted for them</div><h2 class="heading--large">It Understands Destination-Level Complexity.</h2><p class="lead lead--slate">Generic CRM, booking and accounting applications solve individual pieces. DMC24 is designed around the complete reality of an inbound tour operator.</p></header><div class="wd-grid">${complexity.map(x=>`<article class="wd-card module-card2--editorial"><div class="wd-icon">${x[0]}</div><h3 class="heading--compact">${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div></div></section>
<section class="outcome-section"><div class="container"><div class="wd-margin margin-panel--command"><div class="wd-margin-grid"><div><div class="kicker" >Commercial control</div><h2 class="heading--large">Sell Faster Without Losing Control of Your Margin.</h2><p class="lead lead--slate">Speed matters, but an enquiry converted at the wrong price does not create profitable growth.</p></div><div class="wd-control">${[['Markup Management','Set markups by market or specific agent across all services.'],['Exchange Rates','Protect quotations from inconsistent currency calculations.'],['Service Costing','Understand the cost and selling value of each component.'],['Provisional & Final P&L','See expected profit and reconcile actual performance.'],['Receivables & Payables','Connect collections and supplier commitments to bookings.'],['Market Performance','Compare conversion, revenue and profit by source market.']].map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div></div></div></div></section>
<section class="section-alt outcome-section"><div class="container"><header class="section-head section-head--compact"><div class="kicker">One travel file—every department</div><h2 class="heading--large">Connect the Teams That Make Every Journey Possible.</h2></header><div class="wd-departments">${departments.map(x=>`<article class="wd-dept module-card2--editorial"><h3 class="heading--compact">${x[0]}</h3><p>${x[1]}</p></article>`).join('')}</div></div></section>
<section class="outcome-section"><div class="container"><header class="section-head section-head--compact"><div class="kicker">Destination adaptability</div><h2 class="heading--large">One Foundation. Different Destination Realities.</h2><p class="lead lead--slate">A safari itinerary does not operate like an island journey or a high-volume stopover. DMC24 adapts to the products, taxes, logistics and commercial rules of the destination.</p></header><div class="wd-grid">${[['Safari','Lodges, game drives, park fees and safari logistics.'],['Island','Resorts, ferries, seaplanes and connected transfers.'],['Land & Multi-City','Hotels, flights, guides, mileage and touring circuits.'],['Stopover','SIC services, timed attractions and high-speed fulfilment.']].map(x=>`<article class="wd-card module-card2--editorial"><div class="wd-icon">◎</div><h3 class="heading--compact">${x[0]} Destinations</h3><p>${x[1]}</p></article>`).join('')}</div><div class="section-actions"><a class="btn btn-outline" href="destinations.html">Explore Destination Editions →</a></div></div></section>
<section class="section-alt outcome-section"><div class="container"><header class="section-head section-head--compact"><div class="kicker">Grow without replacing your foundation</div><h2 class="heading--large">Start with the Mid Office. Expand with Your Ambition.</h2></header><div class="wd-scale">${[['Core','Mid Office','CRM, contracting, quotations, bookings, operations, finance and MIS.'],['Distribute','B2B','Give approved agents access to products and booking workflows.'],['Sell Direct','B2C','Create a branded direct channel for travellers.'],['Sell Locally','Local Sales','Capture additional revenue after travellers arrive.'],['Scale & Connect','Multi-DMC + APIs','Connect destinations, suppliers, payments and accounts.']].map(x=>`<article class="wd-stage growth-stage--editorial"><small>${x[0]}</small><h3 class="heading--compact">${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div></div></section>
<section class="outcome-section"><div class="container wd-adopt"><div><div class="kicker">Adoption that respects your operation</div><h2 class="heading--large">Technology Adoption Is a Journey—not a Switch.</h2><p class="lead lead--slate">DMC24 helps teams move from familiar manual processes to a structured, shared way of working without losing operational continuity.</p><a class="btn btn-outline" href="how-to-adopt-dmc24.html">Learn How to Adopt DMC24 →</a></div><div class="wd-adopt-steps adoption-steps--editorial">${[['01 · MAP','Understand workflows, roles and dependencies.'],['02 · PREPARE','Structure supplier, product and rate data.'],['03 · TRAIN','Configure departments and train by role.'],['04 · IMPROVE','Go live in phases and optimise continuously.']].map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div></div></section>
<section class="section-alt outcome-section"><div class="container"><header class="section-head section-head--compact"><div class="kicker">Reasons to believe</div><h2 class="heading--large">Built for Today. Ready for What Comes Next.</h2></header><div class="wd-proof proof-grid--editorial">${proof.map(x=>`<div><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('')}</div></div></section>
<section class="outcome-section"><div class="container"><div class="wd-final info-band--command"><div class="kicker">More than a booking system</div><h2 class="heading--large">DMC24 Is the Operating Platform Behind the Traveller’s Experience.</h2><p class="lead lead--slate">Respond faster, coordinate every confirmed service, protect margins and understand the profitability of every booking—while building a foundation for long-term growth.</p><div class="hero-actions hero-actions--center"><a class="btn btn-primary btn-primary--raised" href="request-demo.html">Request a DMC24 Demo →</a><a class="btn btn-outline" href="destinations.html">Explore Your Destination Edition</a></div></div></div></section>`;
})();

},
  "de188bc6968624b7":function(){

const toggle=document.getElementById('menuBtn');
const mobile=document.getElementById('mobileMenu');
if(toggle){toggle.addEventListener('click',()=>mobile.classList.toggle('open'));}

/* Shared DMC24 icon language. Text remains in the HTML as a resilient fallback. */
const dmcIcons={
  MO:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  B2B:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="7" r="2.5"/><path d="M2.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M13 15c1-.9 2.2-1.3 3.7-1.3 2.7 0 4.2 1.8 4.8 5.3"/>',
  B2C:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3"/>',
  POS:'<path d="M4 9h16l-1-5H5L4 9Z"/><path d="M5 9v11h14V9M9 20v-6h6v6M3 9c0 1.7 1 3 2.5 3S8 10.7 8 9c0 1.7 1 3 2.5 3S13 10.7 13 9c0 1.7 1 3 2.5 3S18 10.7 18 9c0 1.7 1 3 2.5 3S21 10.7 21 9"/>',
  CRM:'<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="m3 7 6-4 6 6 6-7"/>',
  OPS:'<path d="M3 7h13v10H3zM16 10h3l2 3v4h-5z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 4h10"/>',
  FIN:'<path d="M4 5h16v14H4zM4 9h16M8 14h3M8 17h5"/><circle cx="17" cy="15" r="2.5"/>',
  MD:'<circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="m6 6.5 4 3M18 6.5l-4 3M6 17.5l4-3M18 17.5l-4-3"/>',
  API:'<path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 4l-4 16"/>',
  RES:'<path d="M3 11h18v8H3zM5 11V6h6v5M13 11V6h6v5M3 19v2M21 19v2"/>',
  TRF:'<path d="M3 7h13v10H3zM16 10h3l2 3v4h-5z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  QTE:'<path d="M6 3h9l4 4v14H6zM15 3v5h5M9 12h6M9 16h6"/>',
  CTR:'<path d="M8 3h8v4H8zM6 5H4v16h16V5h-2M8 12h8M8 16h5"/>',
  CHM:'<path d="M4 20V8l8-5 8 5v12M8 20v-6h8v6M7 9h.01M12 9h.01M17 9h.01"/>',
  PAY:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/>',
  ACC:'<path d="M4 7h16M6 3h12l2 4H4l2-4ZM6 11v7M10 11v7M14 11v7M18 11v7M3 21h18"/>',
  PDF:'<path d="M6 3h9l4 4v14H6zM15 3v5h5M9 13h6M9 17h4"/>',
  FAQ:'<circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.1 2.3c-.9.4-.9 1.1-.9 1.7M12 17h.01"/>',
  DST:'<path d="M12 21s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
  CS:'<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
  BI:'<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M3 21h19"/>'
  ,HTL:'<path d="M3 20V5h18v15M7 20v-4h10v4M7 9h2M12 9h2M17 9h1M7 12h2M12 12h2M17 12h1"/>'
  ,TRN:'<path d="M5 17h14M6 17V7c0-2 1.5-3 6-3s6 1 6 3v10M6 11h12M8 8h2M14 8h2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>'
  ,ACT:'<path d="M4 18c2-4 4-6 7-6s4 2 6 2 3-1 3-1"/><circle cx="8" cy="7" r="3"/><path d="m15 4 1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L12 6.3l2-.3 1-2Z"/>'
  ,TKT:'<path d="M3 8h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V8Z"/><path d="M13 8v12"/>'
  ,TOUR:'<path d="M5 19c0-4 2-7 6-7s5-3 5-6"/><circle cx="5" cy="19" r="2"/><circle cx="16" cy="6" r="2"/><path d="m11 5 1.5 2.5L15 9l-2.5 1.5L11 13l-1.5-2.5L7 9l2.5-1.5L11 5Z"/>'
  ,PKG:'<path d="M4 8h16v12H4zM8 8V5h8v3M4 12h16M10 12v2h4v-2"/>'
  ,WLD:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3"/><path d="m17 5 3-2-.8 3.5"/>'
  ,BKG:'<path d="M5 3v3M19 3v3M4 8h16M4 5h16v16H4z"/><path d="m8 14 2.5 2.5L16 11"/>'
  ,MIS:'<path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7"/><path d="M3 20h18"/>'
  ,RSV:'<path d="M5 3v3M19 3v3M4 8h16M4 5h16v16H4z"/><path d="m8 14 2.5 2.5L16 11"/>'
  ,VCH:'<path d="M6 3h9l4 4v14H6zM15 3v5h5"/><path d="m9 14 2 2 4-5"/>'
  ,LOG:'<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h4a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/><path d="m9 14 2 4-2 4"/>'
  ,GST:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M13 15c1-.7 2.3-1 4-1 2.7 0 4.2 2 4.5 6"/><path d="m12 9 2-2-2-2"/>'
  ,EXE:'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>'
  ,INF:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h4M7 16h7"/>'
  ,MLS:'<path d="M6 3v8M9 3v8M6 7h3M7.5 11v10M16 3v18M16 3c3 2 3 7 0 9"/>'
  ,GDE:'<circle cx="12" cy="7" r="3"/><path d="M5 21c.7-5 3-8 7-8s6.3 3 7 8M18 5l3-2-.8 3.5"/>'
  ,EXT:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>'
  ,ENQ:'<path d="M4 4h16v13H8l-4 4V4Z"/><path d="M8 9h8M8 13h5"/>'
  ,AGT:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M13 15c1-.7 2.3-1 4-1 2.7 0 4.2 2 4.5 6"/>'
  ,FLW:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M18.5 5.5 21 3"/>'
  ,FUN:'<path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"/>'
  ,OFR:'<path d="M4 5h9l7 7-8 8-8-8V5Z"/><circle cx="9" cy="9" r="1.5"/>'
  ,TAX:'<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="16" r="2.5"/><path d="M18 5 6 19"/>'
  ,CLK:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  ,AIR:'<path d="m3 14 8-2 6-8 2 1-4 8 5 3-1 2-6-2-4 5-2-1 2-5-6 1Z"/>'
  ,BOT:'<path d="M3 14h18l-3 5H7l-4-5ZM8 14V7h7l3 7M11 7V4h4v3"/>'
  ,FAM:'<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><path d="M3 20c.4-4 2-6 5-6s4.6 2 5 6M12 16c1-.9 2.2-1.4 4-1.4 2.8 0 4.5 1.8 5 5.4"/>'
  ,UP:'<path d="M12 21V4M6 10l6-6 6 6"/>'
  ,RTE:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 2-2"/>'
};
document.querySelectorAll('.icon,.product-icon,.card-icon').forEach(el=>{
  const code=el.textContent.trim().toUpperCase();
  if(!dmcIcons[code]) return;
  el.dataset.iconCode=code;
  el.setAttribute('aria-hidden','true');
  el.innerHTML='<svg viewBox="0 0 24 24">'+dmcIcons[code]+'</svg>';
});

/* Destination pages use the same compact pink line-icon language as Mauritius and Kenya. */
const destinationIconRules=[
  ['B2B',/\bb2b\b/i],['B2C',/\bb2c\b/i],['POS',/local sales|point of sale/i],
  ['TAX',/vat|gst|green tax|tax|service charge/i],['FIN',/p&l|profit|margin|monthly gp/i],
  ['PAY',/invoice|receivable|payable|payment/i],['BI',/dashboard|mis|performance|intelligence/i],
  ['PDF',/digital.*pdf|pdf.*itinerar/i],['EXT',/ai itinerar/i],['QTE',/quote|quotation|costing/i],
  ['VCH',/voucher|confirmation/i],['BKG',/booking|reservation|amendment|cancellation/i],
  ['PKG',/package|stopover|series brochure|brochure program/i],['HTL',/hotel|resort|room|villa|camp contract/i],
  ['OFR',/offer|discount|early.bird|stay.pay|free.night|upgrade|honeymoon|anniversary|celebration|flash sale|combination/i],
  ['BOT',/speedboat|boat|ferry|marine/i],['AIR',/seaplane|domestic flight|airport|flight/i],
  ['TRN',/transport|vehicle|coach|driver|4x4/i],['RTE',/point.to.point|route|mileage|movement/i],
  ['GDE',/guide|representative/i],['TKT',/ticket|entrance|attraction/i],['MLS',/meal|restaurant|dining/i],
  ['ACT',/experience|excursion|cruise|diving|watersport|wellness|adventure|wadi|coast|desert|mountain/i],
  ['TOUR',/tour|circuit|sightseeing|heritage|culture/i],['FAM',/family|child|group|delegate/i],
  ['WLD',/market|currency|global|regional/i],['AGT',/employee|login|agent/i],['LOG',/operation|logistics|schedule|timed service/i],
  ['MO',/mid.office/i],['CRM',/crm|enquiry/i],['CTR',/contract|rate management/i],['DST',/destination/i]
];
const destinationIcons=document.querySelectorAll('.db-icon,.mv-icon');
if(destinationIcons.length){
  /* Styles are maintained in css/main.css. */
  destinationIcons.forEach(el=>{
    const card=el.closest('article,.db-extension,.mv-channel,.db-market-item');
    const heading=card&&card.querySelector('h2.heading--card-scale,h3,strong');
    const context=(heading?heading.textContent:'')+' '+el.textContent;
    const rule=destinationIconRules.find(([,pattern])=>pattern.test(context));
    const code=rule?rule[0]:'CS';
    el.dataset.iconCode=code;
    el.setAttribute('aria-hidden','true');
    el.innerHTML='<svg viewBox="0 0 24 24">'+dmcIcons[code]+'</svg>';
  });
}

const catalogAliases=[
  {icon:'HTL',names:['hotels','hotel']},
  {icon:'TRF',names:['transfers','airport transfers','transfer']},
  {icon:'TRN',names:['transport','transportation','private transport']},
  {icon:'ACT',names:['activities & experiences','activities and experiences','activities','experiences']},
  {icon:'TKT',names:['entrance tickets','entrance ticket','tickets','attractions & tickets','attractions and tickets']},
  {icon:'TOUR',names:['day tours','day tour','sightseeing','optional excursions','optional excursion']},
  {icon:'PKG',names:['packages','destination packages','package']},
  {icon:'WLD',names:['worldwide inventory','global inventory']},
  {icon:'EXT',names:['other services','additional services']}
];
const catalogTargets='.b2b-product,.product-b2c,.product-card,.contracting-item,.contract-item,.commerce-item,.detail-card,.service-card';
document.querySelectorAll(catalogTargets).forEach(card=>{
  if(card.querySelector('.catalog-icon,.card-icon svg')) return;
  const label=card.querySelector(':scope > b,:scope > strong,:scope > h2.heading--card-scale,:scope > h3');
  if(!label) return;
  const name=label.textContent.trim().toLowerCase();
  const match=catalogAliases.find(group=>group.names.includes(name));
  if(!match) return;
  const icon=document.createElement('div');
  icon.className='catalog-icon';
  icon.setAttribute('aria-hidden','true');
  icon.innerHTML='<svg viewBox="0 0 24 24">'+dmcIcons[match.icon]+'</svg>';
  card.prepend(icon);
});
document.querySelectorAll('.list-card li,.checks li').forEach(item=>{
  const name=item.textContent.trim().toLowerCase();
  const match=catalogAliases.find(group=>group.names.includes(name));
  if(!match) return;
  const icon=document.createElement('span');
  icon.className='catalog-inline-icon';
  icon.setAttribute('aria-hidden','true');
  icon.innerHTML='<svg viewBox="0 0 24 24">'+dmcIcons[match.icon]+'</svg>';
  item.classList.add('has-catalog-icon');
  item.prepend(icon);
});

const modulePageLinks=[
  {href:'sales-crm.html',names:['sales & crm','crm & enquiries','crm module','lead manager']},
  {href:'contracting-products.html',names:['contracting & products','contracting','supplier database management']},
  {href:'costing-quotations.html',names:['costing & quotations','fit & adhoc group quote builder','quote builder']},
  {href:'bookings-reservations.html',names:['bookings & reservations','booking management','supplier reservations','reservations']},
  {href:'operations-logistics.html',names:['operations & logistics','operations module (transport management)','transportation & logistics']},
  {href:'finance-profitability.html',names:['finance & profitability','finance & reporting','accounting module','invoicing']},
  {href:'dashboards-mis.html',names:['dashboards & mis','analytics & mis']}
];

/* Shared commercial capability on every detailed destination page. */
const markupDestinationPages=new Set([
  'cambodia.html','vietnam.html',
  'namibia.html',
  'zambia.html',
  'zimbabwe.html',
  'botswana.html',
  'mauritius.html','sri-lanka.html','kenya.html','tanzania.html','uganda.html','rwanda.html',
  'south-africa.html','maldives.html','egypt.html','oman.html','singapore.html','malaysia.html','thailand.html',
  'hong-kong.html','dubai.html','uae.html','saudi-arabia.html'
]);
const destinationPathPart=window.location.pathname.split('/').pop()||'index.html';
const currentDestinationPage=destinationPathPart.includes('.')?destinationPathPart:`${destinationPathPart}.html`;
if(markupDestinationPages.has(currentDestinationPage)&&![...document.querySelectorAll('h3')].some(h=>h.textContent.trim().toLowerCase()==='markup management')){
  const grids=[
    ['.mu-feature-grid','mu-feature-card','mu-num','icon'],
    ['.sl-feature-grid','sl-feature-card','sl-num','icon'],
    ['.ke-feature-grid','ke-feature-card','ke-num','icon'],
    ['.tz-feature-grid','tz-feature-card','tz-num','icon'],
    ['.ug-feature-grid','ug-feature-card','ug-num','icon'],
    ['.rw-feature-grid','rw-feature-card','rw-num','icon'],
    ['.mv-feature-grid','mv-feature','', 'mv-icon'],
    ['.db-feature-grid','db-feature','', 'db-icon']
  ];
  const match=grids.map(g=>[document.querySelector(g[0]),...g.slice(1)]).find(g=>g[0]);
  if(match){
    const [grid,cardClass,numClass,iconClass]=match;
    const card=document.createElement('article');
    card.className=cardClass+(cardClass==='mv-feature'||cardClass==='db-feature'?' highlight':' is-highlighted');
    const coolDestination = document.currentScript.dataset.destinationStyle === 'cool';
    if (coolDestination && cardClass === 'db-feature') card.classList.add('db-feature--cool');
    const renderedIconClass = iconClass + (coolDestination && iconClass === 'db-icon' ? ' db-icon--cool' : '');
    card.innerHTML=`<div class="${renderedIconClass}">%</div>${numClass?`<span class="${numClass}">Commercial Control</span>`:''}<h3 class="${document.documentElement.classList.contains('theme--product') ? 'heading--compact' : ''}">Markup Management</h3><p>Set markups by market or specific agent across all services. Apply the same commercial rules in the quote builder, individual service sales and the B2B platform.</p>`;
    const related=[...grid.querySelectorAll(':scope > article')].find(item=>/quote builder|quotation/i.test(item.querySelector('h3')?.textContent||''));
    related?.insertAdjacentElement('afterend',card)||grid.append(card);
  }
}

document.querySelectorAll('.card,.feature-pillar,.module-card2,.ops-card,.detail-card').forEach(card=>{
  if(card.matches('a')||card.querySelector(':scope > .module-deep-link')) return;
  const heading=card.querySelector(':scope > h2.heading--card-scale,:scope > h3,:scope > b');
  if(!heading) return;
  const name=heading.textContent.trim().toLowerCase();
  const match=modulePageLinks.find(group=>group.names.includes(name));
  if(!match) return;
  const link=document.createElement('a');
  link.className='module-deep-link';
  link.href=match.href;
  link.textContent='Explore this module →';
  card.append(link);
});

document.querySelectorAll('a.module-link-card,a.related-module,a.card,a.feature-pillar,a.destination-card').forEach(card=>{
  if(card.querySelector('.card-explore')) return;
  const destination=new URL(card.href,window.location.href);
  if(destination.origin!==window.location.origin) return;
  const prompt=document.createElement('span');
  prompt.className='card-explore';
  prompt.setAttribute('aria-hidden','true');
  prompt.innerHTML='Explore <span>→</span>';
  const content=card.matches('.destination-card')?card.querySelector('.body'):card;
  (content||card).append(prompt);
});

/* Product mega menu: wide, two-band navigation for product overview and core modules. */
/* Keep the adoption guide first in the Resources menu across desktop and mobile. */
const resourceNav=[...document.querySelectorAll('.dmc-master-item')].find(item=>item.querySelector(':scope > .dmc-master-link[href="resources.html"]'));
if(resourceNav){
  const drop=resourceNav.querySelector('.dmc-master-drop');
  if(drop&&!drop.querySelector('a[href="how-to-adopt-dmc24.html"]')){
    drop.insertAdjacentHTML('afterbegin','<a href="how-to-adopt-dmc24.html"><strong>How to Adopt DMC24?</strong><small>A practical roadmap for successful technology adoption</small></a>');
  }
}
const mobileCaseLink=document.querySelector('.dmc-master-mobile a[href="case-studies.html"]');
if(mobileCaseLink&&!document.querySelector('.dmc-master-mobile a[href="how-to-adopt-dmc24.html"]')){
  mobileCaseLink.insertAdjacentHTML('beforebegin','<a href="how-to-adopt-dmc24.html">How to Adopt DMC24?</a>');
}

/* Keep Puratech first in Company navigation across legacy and shell-based pages. */
const companyNav=[...document.querySelectorAll('.dmc-master-item')].find(item=>{
  const link=item.querySelector(':scope > .dmc-master-link');
  return link&&link.textContent.trim().startsWith('Company');
});
if(companyNav){
  const topLink=companyNav.querySelector(':scope > .dmc-master-link');
  const drop=companyNav.querySelector('.dmc-master-drop');
  if(topLink)topLink.href='about-puratech.html';
  if(drop&&!drop.querySelector('a[href="about-puratech.html"]')){
    drop.insertAdjacentHTML('afterbegin','<a href="about-puratech.html"><strong>About Puratech</strong><small>Travel technology and product ecosystem</small></a>');
  }
  drop?.querySelectorAll('a[href="about.html"]').forEach(link=>link.remove());
}
const mobileCompanyLink=document.querySelector('.dmc-master-mobile a[href="about.html"]');
if(mobileCompanyLink&&!document.querySelector('.dmc-master-mobile a[href="about-puratech.html"]')){
  mobileCompanyLink.insertAdjacentHTML('beforebegin','<a href="about-puratech.html">About Puratech</a>');
}
document.querySelectorAll('.dmc-master-mobile a[href="about.html"]').forEach(link=>link.remove());
document.querySelectorAll('.dmc-master-footer-links a').forEach(link=>{
  if(link.textContent.trim()==='Company')link.href='about-puratech.html';
});
if(/\/resources(?:\.html)?\/?$/.test(window.location.pathname)){
  const resourceGrid=document.querySelector('main .cards-4');
  if(resourceGrid&&!resourceGrid.querySelector('a[href="how-to-adopt-dmc24.html"]')){
    resourceGrid.insertAdjacentHTML('afterbegin','<a class="card" href="how-to-adopt-dmc24.html"><div class="icon">ADP</div><h2 class="heading--card-scale">How to Adopt DMC24?</h2><p>A practical roadmap for preparing data, aligning departments, training teams and achieving lasting platform adoption.</p></a>');
  }
}

const productNav=[...document.querySelectorAll('.dmc-master-item')].find(item=>item.querySelector(':scope > .dmc-master-link[href="what-is-dmc24.html"]'));
if(productNav){
  const drop=productNav.querySelector('.dmc-master-drop');
  if(drop){
    const icon=(code)=>'<span class="dmc-mega-icon" aria-hidden="true"><svg viewBox="0 0 24 24">'+dmcIcons[code]+'</svg></span>';
    productNav.classList.add('dmc-product-item');
    drop.className='dmc-master-drop dmc-product-mega';
    drop.innerHTML=`
      <section class="dmc-mega-band dmc-mega-about" aria-labelledby="dmcMegaAbout">
        <p class="dmc-mega-label" id="dmcMegaAbout">Know About DMC24</p>
        <div class="dmc-mega-about-links">
          <a href="what-is-dmc24.html">${icon('INF')}<strong>What is DMC24?</strong></a>
          <a href="features.html">${icon('EXT')}<strong>Features</strong></a>
          <a href="benefits.html">${icon('BI')}<strong>Benefits</strong></a>
          <a href="multi-dmc.html">${icon('MD')}<strong>Multi-DMC</strong></a>
          <a href="integrations.html">${icon('API')}<strong>API Integrations</strong></a>
        </div>
      </section>
      <section class="dmc-mega-band dmc-mega-operations" aria-labelledby="dmcMegaCore">
        <div class="dmc-mega-core">
          <p class="dmc-mega-label" id="dmcMegaCore">Core Operational Modules</p>
          <a class="dmc-mega-overall" href="mid-office.html">${icon('MO')}<strong>Overall Mid-Office Features</strong></a>
        </div>
        <div class="dmc-mega-breakdown">
          <p class="dmc-mega-label">Breakdown of Mid-Office Modules</p>
          <div class="dmc-mega-module-links">
            <a href="sales-crm.html">${icon('CRM')}<strong>Sales &amp; CRM</strong></a>
            <a href="contracting-products.html">${icon('CTR')}<strong>Contracting &amp; Products</strong></a>
            <a href="costing-quotations.html">${icon('QTE')}<strong>Costing &amp; Quotations</strong></a>
            <a href="bookings-reservations.html">${icon('BKG')}<strong>Bookings &amp; Reservations</strong></a>
            <a href="operations-logistics.html">${icon('OPS')}<strong>Operations &amp; Logistics</strong></a>
            <a href="finance-profitability.html">${icon('FIN')}<strong>Finance &amp; Profitability</strong></a>
            <a href="dashboards-mis.html">${icon('MIS')}<strong>Dashboards &amp; MIS</strong></a>
          </div>
        </div>
      </section>`;

    /* Styles are maintained in css/main.css. */
  }
}

const destinationMenu=[
  ["Cambodia","cambodia.html","Temple circuits, cultural tours and coastal extensions","🇰🇭"],
  ["Vietnam","vietnam.html","Multi-city tours, bay cruises and beach programmes","🇻🇳"],
  ["Namibia","namibia.html","Desert, wildlife and touring operations","🇳🇦"],
  ["Zambia","zambia.html","Safari, river and regional operations","🇿🇲"],
  ["Zimbabwe","zimbabwe.html","Safari, heritage and regional operations","🇿🇼"],
  ["Botswana","botswana.html","Delta, wildlife and remote safari operations","🇧🇼"],
  ['Mauritius','mauritius.html','Island DMC operations','🇲🇺'],
  ['Sri Lanka','sri-lanka.html','Subscription editions','🇱🇰'],
  ['UAE','dubai.html','Hotels, offers, multi-emirate services and VAT','🇦🇪'],
  ['Kenya','kenya.html','Safari and inbound operations','🇰🇪'],
  ['Tanzania','destinations.html#tanzania','Safari circuits and Zanzibar','🇹🇿'],
  ['Uganda','destinations.html#uganda','Wildlife and adventure travel','🇺🇬'],
  ['Rwanda','destinations.html#rwanda','Premium wildlife journeys','🇷🇼'],
  ['South Africa','south-africa.html','Safari, multi-city and regional programmes','🇿🇦'],
  ['Bali','bali.html','Resorts, villas, offers and island experiences','🇮🇩'],
  ['Oman','oman.html','Round tours, transport and VAT','🇴🇲'],
  ['Maldives','maldives.html','Resorts and island operations','🇲🇻'],
  ['Egypt','egypt.html','Cultural and group operations','🇪🇬'],
  ['Singapore','singapore.html','Stopovers, MICE and GST','🇸🇬'],
  ['Malaysia','malaysia.html','SIC tours, land programmes and domestic flights','🇲🇾'],
  ['Thailand','thailand.html','SIC tours, island transfers and multi-city programmes','🇹🇭'],
  ['Hong Kong','hong-kong.html','Ferries, Macau and Shenzhen programmes','🇭🇰'],
  ['Saudi Arabia','saudi-arabia.html','Religious, heritage and leisure','🇸🇦'],
  ['Seychelles','seychelles.html','Island resorts, ferries and connected transfers','🇸🇨']
].sort((a,b)=>a[0].localeCompare(b[0], 'en'));
document.querySelectorAll('.dmc-master-mobile a[href="dubai.html"]').forEach(link=>{
  link.href='dubai.html';
  link.textContent='UAE';
});
const destinationNav=[...document.querySelectorAll('.dmc-master-item')].find(item=>item.querySelector(':scope > .dmc-master-link[href="destinations.html"]'));
if(destinationNav){
  const drop=destinationNav.querySelector('.dmc-master-drop');
  if(drop){
    drop.classList.add('dmc-destination-drop');
    drop.innerHTML='';
    destinationMenu.forEach(([name,href,summary,flag])=>{
      const link=document.createElement('a');
      link.href=href;
      link.innerHTML='<span class="dmc-country-flag" aria-hidden="true">'+flag+'</span><span class="dmc-destination-copy"><strong>'+name+'</strong><small>'+summary+'</small></span>';
      drop.append(link);
    });
    const all=document.createElement('a');
    all.href='destinations.html';
    all.innerHTML='<span class="dmc-country-flag dmc-all-destinations" aria-hidden="true">🌐</span><span class="dmc-destination-copy"><strong>All Destinations</strong><small>Explore DMC24 by market</small></span>';
    drop.append(all);
  }
}
const mobileDestinationMenu=document.querySelector('.dmc-master-mobile');
if(mobileDestinationMenu){
  const all=[...mobileDestinationMenu.querySelectorAll('a')].find(link=>link.textContent.trim()==='All Destinations');
  destinationMenu.forEach(([name,href,,flag])=>{
    const existing=[...mobileDestinationMenu.querySelectorAll('a')].find(link=>link.textContent.trim()===name);
    if(existing){existing.href=href;existing.textContent=flag+'  '+name;mobileDestinationMenu.insertBefore(existing,all||null);return;}
    const link=document.createElement('a');
    link.href=href;
    link.textContent=flag+'  '+name;
    mobileDestinationMenu.insertBefore(link,all||null);
  });
  if(all) all.textContent='🌐  All Destinations';
}

const destinationFlagMap=Object.fromEntries(destinationMenu.map(([name,,,flag])=>[name,flag]));
document.querySelectorAll('.destination-card').forEach(card=>{
  const heading=card.querySelector('.body h3,h3');
  if(!heading||heading.querySelector('.destination-card-flag')) return;
  const flag=destinationFlagMap[heading.textContent.trim()];
  if(!flag) return;
  const badge=document.createElement('span');
  badge.className='destination-card-flag';
  badge.setAttribute('aria-hidden','true');
  badge.textContent=flag;
  heading.prepend(badge);
});

},
  "eb1ebf9297930b5b":function(){
(() => {
  const icon = (label) => `<span class="fc-icon" aria-hidden="true">${label}</span>`;
  const groups = [
    { key:'sales', icon:'01', title:'Sell Faster', text:'Keep every enquiry, relationship and follow-up moving toward conversion.', items:['FIT, GIT, series and MICE enquiries','Customer and agent profiles','Assignment, ageing and follow-up reminders','Multiple quotation options and revisions','Email and WhatsApp quotations','Conversion and lost-reason tracking'] },
    { key:'product', icon:'02', title:'Build & Price Accurately', text:'Turn destination contracts and commercial rules into reusable digital inventory.', items:['Multi-market hotel contracts','Seasonal rates, offers and policies','Transfer and transport tariffs','Point-to-point mileage calculations','Nationality-based entrance fees','Markup, tax and multi-currency rules'] },
    { key:'operations', icon:'03', title:'Confirm & Operate Confidently', text:'Connect each confirmed booking to suppliers, guests and the destination team.', items:['Supplier request and confirmation workflow','Supplier and guest vouchers','Vehicle and guide allocation','Arrival and departure movements','Duty slips and operational manifests','Pre- and post-tour expenses'] },
    { key:'finance', icon:'04', title:'Control Finance & Performance', text:'Follow every travel file from selling value to actual profitability.', items:['Proforma, advance and tax invoices','Receivables and payables','Supplier payment tracking','Provisional versus final GP','File-wise profit and loss','Market, employee and MIS dashboards'] }
  ];

  const differentiators = [
    ['CAL','Quote Complex Travel in Minutes','Combine hotels, transfers, transport, activities, entrances, meals and guides in one day-wise quotation—with multiple options and automatic calculations.'],
    ['MKT','One Product, Multiple Markets','Maintain market-specific rates, offers, policies, currencies and markups without duplicating the entire product.'],
    ['GP','See Profit Before Confirmation','Review expected gross profit before the quote is sent and protect the margin while commercial decisions can still be changed.'],
    ['P&L','Know the Final Profit','Compare quoted costs with confirmed supplier costs and tour expenses to identify the real profitability of every file.'],
    ['ACT','Manage by Exception','Focus reservation teams on services that remain unconfirmed, amended, approaching a deadline or require immediate action.'],
    ['TAX','Destination-Specific Tax Logic','Configure VAT, GST, green tax, entrance-fee rules and other local calculations within the operating workflow.'],
    ['FIT','Built for FIT, GIT, Series & MICE','Use workflows suited to different business types without maintaining separate operating systems.'],
    ['POS','Connected Sales Extensions','Extend the same inventory and commercial rules to B2B agents, B2C travellers and local sales representatives.']
  ];

  const scenarios = {
    fit:{label:'12-day multi-city FIT',title:'From a complex enquiry to a costed proposal',text:'Build a day-wise programme using contracted hotels, routing, transfers, activities, entrances, meals and guides—then present several options without rebuilding the file.',tags:['Product search','Day-wise costing','Multiple options','PDF / Digital / Email / WhatsApp']},
    group:{label:'120-passenger GIT',title:'Control group costing and delivery',text:'Manage rooming, vehicle requirements, group services, supplier commitments and operational documentation for a large movement.',tags:['GIT costing','Rooming','Coach logistics','Operational lists']},
    contract:{label:'Multi-market contract',title:'Use one contract across multiple source markets',text:'Structure seasons, room categories, meal plans, tactical offers and market-specific rules so sales teams quote from controlled rates.',tags:['Market rates','Offers','Policies','Stop sales']},
    exception:{label:'Supplier delay',title:'Act on the reservation exception',text:'See which service is still requested, who owns the follow-up and when action is due—without manually checking the entire booking.',tags:['Pending status','Deadlines','Ownership','Escalation']},
    margin:{label:'Falling file margin',title:'Identify where profit is leaking',text:'Compare estimated and confirmed costs, exchange movements and operational expenses before the file is closed.',tags:['Provisional GP','Confirmed cost','Tour expense','Final P&L']}
  };

  const featureList = [
    ['sales','Capture FIT, GIT, series and MICE enquiries'],['sales','Assign enquiries and schedule follow-ups'],['sales','Maintain customer and agent profiles'],['sales','Track quotation revisions and lost reasons'],['sales','Send quotations by email and WhatsApp'],
    ['product','Manage hotel seasons, rooms and meal plans'],['product','Apply tactical and combined hotel offers'],['product','Maintain transfer and transport tariffs'],['product','Calculate point-to-point mileage'],['product','Control nationality-based entrance fees'],
    ['quoting','Create multiple quote options'],['quoting','Calculate FIT and GIT costs'],['quoting','Build day-wise itineraries'],['quoting','Apply markup, tax and currency rules'],['quoting','Generate PDF and digital itineraries'],
    ['operations','Track supplier requests and confirmations'],['operations','Generate supplier and guest vouchers'],['operations','Allocate guides, drivers and vehicles'],['operations','Produce manifests and duty slips'],['operations','Control pre- and post-tour expenses'],
    ['finance','Generate proforma, advance and tax invoices'],['finance','Track receivables and payables'],['finance','Compare provisional and final gross profit'],['finance','Review file-wise profit and loss'],['finance','Analyse performance by market and employee'],
    ['extensions','Distribute inventory through B2B'],['extensions','Sell direct through B2C'],['extensions','Enable in-destination local sales'],['extensions','Connect APIs and accounting systems'],['extensions','Operate multiple DMCs through one ecosystem']
  ];

  const main = document.querySelector('main');
  if (!main) return;

  /* Styles are maintained in css/main.css. */

  main.className = 'fc-page';
  main.innerHTML = `
    <section class="fc-hero"><div class="container fc-hero-grid"><div><div class="fc-eyebrow">DMC24 Features</div><h1 class="heading--compact">DMC Software Features</h1><p class="fc-lead">Manage contracted products, complex quotations, supplier confirmations, guest movements, operational expenses and final profitability through one connected platform.</p><div class="fc-actions"><a class="btn btn-primary btn-primary--raised" href="#capabilities">Explore Features →</a><a class="btn btn-outline" href="request-demo.html">Request a Demo</a></div><div class="fc-proof"><span>450+ capabilities</span><span>FIT, GIT, Series & MICE</span><span>One connected workflow</span></div></div><aside class="fc-console" aria-label="DMC24 capability overview"><div class="fc-console-head"><b>Operational command view</b><span>Illustrative interface</span></div><div class="fc-console-grid"><div class="fc-console-card"><small>Enquiries awaiting action</small><strong>12</strong><em>Sales & CRM</em></div><div class="fc-console-card"><small>Quotes in preparation</small><strong>28</strong><em>Costing & Quotations</em></div><div class="fc-console-card"><small>Supplier confirmations due</small><strong>17</strong><em>Reservations</em></div><div class="fc-console-card"><small>Open-file provisional GP</small><strong>14.6%</strong><em>Finance & MIS</em></div></div></aside></div></section>
    <div class="fc-strip"><div class="container fc-strip-grid"><div class="fc-strip-item"><b>Sell</b><span>Enquiry to conversion</span></div><div class="fc-strip-item"><b>Build & Price</b><span>Contract to quotation</span></div><div class="fc-strip-item"><b>Confirm & Operate</b><span>Supplier to service delivery</span></div><div class="fc-strip-item"><b>Control</b><span>Invoice to final profitability</span></div></div></div>

    <section id="capabilities"><div class="container"><header class="fc-head"><div class="fc-eyebrow">Complete capability map</div><h2 class="heading--large">Everything Your Teams Need to Run the Business.</h2><p class="fc-lead">Explore each team’s workflow, from capturing an enquiry and preparing a quotation to delivering services and reviewing the financial result.</p></header><div class="fc-group-grid">${groups.map(g=>`<article class="fc-group"><div class="fc-group-top">${icon(g.icon)}<div><h3 class="heading--compact">${g.title}</h3><p>${g.text}</p></div></div><div class="fc-checks">${g.items.map(i=>`<div class="fc-check">${i}</div>`).join('')}</div></article>`).join('')}</div></div></section>

    <section class="fc-soft"><div class="container"><header class="fc-head center"><div class="fc-eyebrow">Where DMC24 stands apart</div><h2 class="heading--large">Features Designed Around Real DMC Decisions.</h2><p class="fc-lead">Not generic CRM, accounting or booking functionality—capabilities shaped around how inbound operations are sold, confirmed, delivered and measured.</p></header><div class="fc-diff-grid">${differentiators.map(d=>`<article class="fc-diff">${icon(d[0])}<h3 class="heading--compact">${d[1]}</h3><p>${d[2]}</p></article>`).join('')}</div></div></section>

    <section><div class="container fc-quote"><div><div class="fc-eyebrow">Costing & quote builder</div><h2 class="heading--large">From Complex Requirements to a Professional Proposal.</h2><p class="fc-lead">Build day-wise FIT and GIT quotations using contracted products, multiple service options, occupancy calculations, taxes, currencies and markup rules. Convert the accepted option into a booking without entering everything again.</p><div class="fc-actions"><a class="btn btn-primary btn-primary--raised" href="contact.html#demo">Request a PDF Itinerary Sample →</a><a class="btn btn-outline" href="contact.html#demo">Request a Digital Itinerary Sample →</a></div></div><div class="fc-workflow" aria-label="Quotation workflow"><div class="fc-flow">${[['01','Capture enquiry'],['02','Select products'],['03','Calculate cost'],['04','Apply markup'],['05','Create options'],['06','Build itinerary'],['07','Send quotation'],['08','Convert to booking']].map(s=>`<div class="fc-step"><b>${s[0]} · ${s[1]}</b><span>${s[1]==='Calculate cost'?'FIT / GIT rules and service costs':s[1]==='Send quotation'?'PDF, digital, email or WhatsApp':'Connected DMC24 workflow'}</span></div>`).join('')}</div><div class="fc-output">One accepted proposal becomes the operational travel file →</div></div></div></section>

    <section class="fc-soft"><div class="container"><header class="fc-head"><div class="fc-eyebrow">Real operational scenarios</div><h2 class="heading--large">See How DMC24 Handles Actual DMC Work.</h2><p class="fc-lead">Select a situation to see which connected capabilities come into action.</p></header><div class="fc-tabs" role="tablist">${Object.entries(scenarios).map(([k,s],i)=>`<button class="fc-tab${i===0?' active':''}" data-scenario="${k}" role="tab" aria-selected="${i===0}">${s.label}</button>`).join('')}</div><div class="fc-scenario" id="fc-scenario" aria-live="polite"></div></div></section>

    <section><div class="container"><header class="fc-head"><div class="fc-eyebrow">Product editions</div><h2 class="heading--large">Choose the Depth That Matches Your Operation.</h2><p class="fc-lead">Start with core control and extend the platform as your teams, channels, destinations and integration requirements grow.</p></header><div class="fc-matrix-wrap"><table class="fc-matrix"><thead><tr><th>Capability</th><th>Business</th><th>Professional</th><th>Enterprise</th></tr></thead><tbody>${[['Sales, CRM and FIT quotation','—','Full','Full'],['GIT quotation and workflow','—','✓','✓'],['Quick Booking FIT','✓','✓','✓'],['Contracting and inventory','Core','Advanced','Advanced'],['Operations / Transportation','—','Core','Advanced'],['Operational finance','Core','Full','Full'],['Dashboards and MIS','Standard','Advanced','Advanced'],['B2B','Optional','Optional','Optional'],['B2C','Optional','Optional','Optional'],['Local Sales','Optional','Optional','Optional'],['Multi-DMC capability','—','—','Optional'],['APIs and accounting integrations','Optional','Optional','Optional'],['Back-to-back series and workflow','Optional','Optional','Optional']].map(r=>`<tr><td>${r[0]}</td>${r.slice(1).map(v=>`<td class="${v==='✓'||v==='Full'?'fc-yes':v==='Optional'?'fc-opt':''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="fc-note">Capability availability depends on the selected edition, destination configuration and agreed implementation scope.</p></div></section>

    <section class="fc-soft"><div class="container"><header class="fc-head center"><div class="fc-eyebrow">Destination intelligence</div><h2 class="heading--large">Adapted to How Your Destination Operates.</h2><p class="fc-lead">DMC24 applies its common operating foundation to the commercial and logistical realities of different destination types.</p></header><div class="fc-dest-grid"><article class="fc-dest">${icon('SAF')}<h3 class="heading--compact">Safari Destinations</h3><p>Camps, lodges, park fees, vehicles, guides and multi-point movements.</p></article><article class="fc-dest">${icon('ISL')}<h3 class="heading--compact">Island Destinations</h3><p>Resort offers, tactical promotions, transfers and destination taxes.</p></article><article class="fc-dest">${icon('LND')}<h3 class="heading--compact">Land Destinations</h3><p>Multi-city routing, mileage, transport, guides and internal flights.</p></article><article class="fc-dest">${icon('SIC')}<h3 class="heading--compact">SIC Destinations</h3><p>Fixed departures, pickup points, shared transfers and tour inventory.</p></article><article class="fc-dest">${icon('TAX')}<h3 class="heading--compact">Tax-Sensitive Markets</h3><p>VAT, GST, green tax and configured local invoice requirements.</p></article></div><p style="text-align:center;margin-top:26px"><a class="fc-link" href="destinations.html">Explore destination-specific DMC24 editions →</a></p></div></section>

    <section><div class="container"><header class="fc-head"><div class="fc-eyebrow">Small features, significant time saved</div><h2 class="heading--large">Practical Controls Your Teams Will Use Every Day.</h2></header><div class="fc-small-grid">${['Duplicate an itinerary or quotation','Reuse preferred service combinations','Copy contract seasons and rate periods','Create multiple quotation options','Flag expiring quotations','Record supplier confirmation numbers','Generate vouchers in bulk','Filter pending supplier responses','Allocate guides, drivers and vehicles','Export operational lists','Restrict access by employee role','Maintain a complete amendment audit trail'].map(x=>`<div class="fc-small">${x}</div>`).join('')}</div></div></section>

    <section class="fc-soft"><div class="container"><div class="fc-discovery"><header class="fc-head" style="margin-bottom:22px"><div class="fc-eyebrow" style="color:#ff8bb5">Feature discovery</div><h2 class="heading--large">Find the Capability Your Team Needs.</h2><p class="fc-lead" style="color:#c6cad3">Search or filter the platform by department and business function.</p></header><div class="fc-search-row"><input class="fc-search" id="fc-search" type="search" placeholder="Search features—for example: vouchers, GP, WhatsApp…" aria-label="Search DMC24 features"><a class="btn btn-primary btn-primary--raised" href="request-demo.html">Discuss Your Requirements →</a></div><div class="fc-filters" role="group" aria-label="Filter features"><button class="fc-filter active" data-filter="all">All</button>${[['sales','Sales'],['product','Contracting'],['quoting','Costing & Quotes'],['operations','Operations'],['finance','Finance & MIS'],['extensions','Extensions & APIs']].map(f=>`<button class="fc-filter" data-filter="${f[0]}">${f[1]}</button>`).join('')}</div><div class="fc-results" id="fc-results"></div></div></div></section>
  `;

  const scenarioBox = document.getElementById('fc-scenario');
  const renderScenario = key => {
    const s = scenarios[key];
    scenarioBox.innerHTML = `<div><div class="fc-scenario-label">${s.label}</div><h3 class="heading--compact">${s.title}</h3><p>${s.text}</p></div><div class="fc-tags">${s.tags.map(t=>`<div class="fc-tag">${t}</div>`).join('')}</div>`;
  };
  renderScenario('fit');
  document.querySelectorAll('.fc-tab').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.fc-tab').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false')});
    btn.classList.add('active');btn.setAttribute('aria-selected','true');renderScenario(btn.dataset.scenario);
  }));

  let activeFilter = 'all';
  const search = document.getElementById('fc-search');
  const results = document.getElementById('fc-results');
  const renderFeatures = () => {
    const q = search.value.trim().toLowerCase();
    const rows = featureList.filter(([cat,name]) => (activeFilter==='all'||cat===activeFilter) && (!q||name.toLowerCase().includes(q)));
    results.innerHTML = rows.length ? rows.map(([cat,name])=>`<div class="fc-result">${name}<small>${cat}</small></div>`).join('') : '<div class="fc-empty">No matching capability found. Try another term or view all features.</div>';
  };
  search.addEventListener('input',renderFeatures);
  document.querySelectorAll('.fc-filter').forEach(btn=>btn.addEventListener('click',()=>{
    activeFilter=btn.dataset.filter;document.querySelectorAll('.fc-filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderFeatures();
  }));
  renderFeatures();
})();

},
  "eef1df7d3d886af5":function(){
(function(){
  const script=document.currentScript;
  const market=script&&script.dataset.market;
  const destinationClass = name => name + (script.dataset.destinationStyle === 'cool' ? ' ' + name + '--cool' : '');
  const main=document.querySelector('main');
  if(!main||!market) return;

  const sharedFeatures=[
    ['⚙️','End-to-End Mid Office','Connect sales, reservations, operations, finance and reporting.'],
    ['👥','Employee Logins & Dashboards','Give every department secure role-based access.'],
    ['🧮','FIT & GIT Quote Builder','Build detailed individual and group quotations.'],
    ['%','Markup Management','Set markups by market or specific agent across all services for quotations, individual service sales and the B2B platform.'],
    ['🔀','Multi-Option Quotations','Present alternative hotels, services and packages together.'],
    ['💬','Email & WhatsApp Quotations','Share professional quotations in minutes.'],
    ['✨','AI Itinerary Creation','Create professional itineraries faster with consistent destination content.'],
    ['📱','Digital, Email & PDF Itineraries','Deliver customised branded proposals in multiple formats.'],
    ['⚡','Quick Booking Module','Convert confirmed enquiries into bookings rapidly.'],
    ['✅','Supplier Reservations & Vouchers','Control supplier requests, confirmations and vouchers.'],
    ['🧾','Proforma, Tax & Advance Invoices','Generate invoices, deposits and payment schedules.'],
    ['↙️','Receivable Tracking','Monitor customer and agent payments and outstanding balances.'],
    ['↗️','Supplier Payable Tracking','Manage supplier payment schedules and balances.'],
    ['📈','File-Wise P&L & Monthly GP','Measure profitability for every file and business period.'],
    ['🌐','Multi-Currency Management','Contract, quote, sell and account in controlled currencies.'],
    ['📊','Dashboards & MIS','Turn operational activity into management intelligence.'],
    ['450+','450+ Powerful Features','Scale sales, operations, finance and reporting confidently.']
  ];

  const markets={
    bali:{
      label:'Bali',hero:'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=86',heroWidth:1600,heroHeight:2123,heroAlt:'Tiered Balinese temple beside a lake, reflected in the water',
      headline:'One Connected Platform for Bali DMCs.',
      intro:'Manage resorts and villas, tactical offers, quotations, day tours, transfers, island connections, activities, bookings, operations, taxes, finance and profitability through one connected destination management platform.',
      caption:'Built for Bali’s experience-led inbound operations',captionSub:'From airport arrivals and resort stays to temples, wellness, adventure and island extensions.',
      pillars:[['🏨','Hotels, Resorts & Villas','Manage contracted accommodation, seasons, room and villa types, meal plans, policies and offers.'],['🌴','Tours & Experiences','Build cultural, wellness, adventure, dining and island experiences with structured rates.'],['🚐','Transfers & Island Logistics','Coordinate airports, resort zones, private vehicles, guides, boats and multi-stop guest movements.']],
      roleTitle:'The DMC Role in Bali Tourism.',roleText:'Bali DMCs connect global travel partners with hotels, resorts, villas, transport operators, guides, restaurants, attractions, wellness providers, activity suppliers and neighbouring islands.',
      roleCards:[['🌏','International Source Markets','Apply market-specific rates, currencies, conditions and commercial rules.'],['🏷️','Offer-Driven Accommodation','Control tactical promotions, stay-pay offers, upgrades and combinability.'],['🗺️','Experience-Led Itineraries','Combine beaches, culture, wellness, adventure and dining into complete programmes.'],['⛴️','Island Connections','Coordinate boats, transfers and services for Nusa Penida, the Gilis and nearby islands.']],
      features:[
        ['🏨','Multi-Market Hotel & Resort Contracting','Maintain rates by source market, season, currency, room type and meal plan.',true],
        ['🏡','Villa Contracting','Manage villa categories, occupancy, inclusions, supplements, policies and supplier terms.'],
        ['🏷️','Tactical Accommodation Offers','Digitise early-booking, stay-pay, upgrade and short-window promotions.',true],
        ['＋','Combined Offer Rules','Define which hotel and resort offers may be combined and prevent invalid stacking.'],
        ['🧮','FIT & GIT Quote Builder','Build accurate individual and group quotations from structured products and rates.',true],
        ['%','Markup Management','Set markups by market or specific agent across all services for quotations, individual service sales and the B2B platform.',true],
        ['🔀','Multi-Option Quotations','Present alternative resorts, villas, vehicles, experiences and programme combinations.'],
        ['💬','Email & WhatsApp Quotations','Send professional quotations quickly, including complex calculations.'],
        ['✨','AI Itinerary Creation','Create professional Bali itineraries faster with consistent destination information.'],
        ['📱','Digital, Email & PDF Itineraries','Deliver customised and branded proposals across multiple formats.'],
        ['↔️','Point-to-Point Transfers','Price routes between the airport, resort zones, attractions, ports and activity locations.'],
        ['📍','Mileage & Route Calculation','Calculate distance and operating cost for touring and private vehicle programmes.'],
        ['🚐','Vehicle & Driver Management','Maintain vehicle types, capacities, seasons, overtime, disposal and route rates.'],
        ['🗣️','Guide Management','Control guide languages, rates, working hours, assignments and allowances.'],
        ['🎟️','Entrance Fee Management','Maintain temple, attraction and activity fees by age, nationality and season.'],
        ['🌴','Day Tour Management','Package vehicles, guides, entrances, meals and activities into reusable excursions.'],
        ['🧘','Wellness & Retreat Products','Manage spa, yoga, wellness, retreat and specialist programme services.'],
        ['🏄','Adventure & Marine Activities','Contract surfing, rafting, diving, cycling and marine experiences.'],
        ['⛴️','Boat & Island Transfer Management','Control ports, schedules, fares, baggage and connecting ground services.'],
        ['🗺️','Multi-Region Bali Programmes','Combine South Bali, Ubud, the north, east and west in one structured itinerary.'],
        ['🌏','Regional Extensions','Connect Bali with Lombok, the Gilis, Java and wider Indonesia programmes.'],
        ['🍽️','Restaurant & Meal Contracting','Manage menus, group meals, dietary requirements and dining experiences.'],
        ['💍','Weddings, Groups & Events','Coordinate venues, rooms, transport, dining, activities and guest movements.'],
        ['📘','Group Series Brochure Programmes','Create fixed-date Bali programmes for travel agents to promote and sell.'],
        ['⚡','Quick Booking Module','Convert confirmed FIT and group enquiries into controlled travel files.'],
        ['✅','Supplier Reservations & Vouchers','Manage requests, confirmations, amendments and supplier vouchers.'],
        ['📋','Rooming Lists & Passenger Manifests','Control guest, room, flight, boat and movement information.'],
        ['OPS','Operations & Logistics','Coordinate arrivals, departures, drivers, guides and daily service delivery.'],
        ['💼','Pre- & Post-Tour Expenses','Issue operational cash and reconcile driver, guide and tour expenses.'],
        ['%','Tax & Service Charge Management','Apply configured Indonesian tax and supplier service-charge rules where applicable.',true],
        ['🧾','Proforma, Tax & Advance Invoices','Generate commercial documents, deposits and payment schedules.'],
        ['AR','Receivable Tracking','Monitor collections, due dates, ageing and outstanding balances.'],
        ['AP','Supplier Payable Tracking','Manage supplier liabilities, schedules, approvals and outstanding amounts.'],
        ['P&L','File-Wise P&L & Monthly GP','Measure profitability by file, market, product and period.',true],
        ['FX','Multi-Currency Management','Manage supplier and selling currencies with controlled exchange rates.'],
        ['MIS','Dashboards, Market Analysis & MIS','Turn sales and operational activity into management intelligence.'],
        ['450+','450+ Powerful Features','Scale the complete Bali DMC operation through one connected platform.',true]
      ],
      completeFeatures:true,
      focusTitle:'Build Complete Bali and Island Programmes.',
      focusText:'Combine resorts, villas, transfers, guides, temples, day tours, meals, wellness, adventure and island connections into accurate and profitable programmes.',
      packages:[['🌴','Classic Bali','South Bali, Ubud, temples, culture and curated day tours.'],['💎','Luxury Bali','Premium resorts, private villas, vehicles, dining and exclusive experiences.'],['🧘','Wellness & Retreats','Resorts, yoga, spa, healthy dining and specialist programmes.'],['🏄','Adventure Bali','Rafting, surfing, cycling, hiking and marine activities.'],['⛴️','Bali & Island Extensions','Nusa Penida, Lombok, the Gilis and connecting boat services.'],['👨‍👩‍👧','Family Bali','Family accommodation, private transfers and age-suitable experiences.'],['💍','Weddings & Celebrations','Venues, rooms, guests, transport, dining and event services.'],['👥','Groups & Series','Fixed departures, coaches, guides, rooming lists and operational control.']],
      tax:'Applicable Taxes & Service Charges',taxText:'Configure applicable Indonesian taxes and supplier service charges across accommodation, transport, touring, activities and invoices according to current rules and the DMC’s accounting policies.',
      famous:[['Beaches & Islands','Resort coastlines, marine experiences and nearby island extensions.'],['Culture & Temples','Living traditions, ceremonies, arts, villages and sacred places.'],['Wellness & Luxury','Private villas, retreats, spas, fine dining and premium experiences.'],['Nature & Adventure','Rice terraces, volcanoes, waterfalls, rafting, cycling and outdoor discovery.']],
      impact:['Respond faster to detailed, experience-led enquiries.','Control resort and villa offers without losing commercial accuracy.','Cost transfers, guides, entrances and island sectors correctly.','Apply market and agent markups consistently across sales channels.','Improve visibility across reservations, suppliers and daily operations.','Measure profitability by file, market and programme.']
    },
    seychelles:{
      label:'Seychelles',hero:'img/seychelles-anse-source-argent.jpg',heroWidth:1600,heroHeight:1067,heroAlt:'Granite boulders, palms and turquoise water at Anse Source d’Argent beach, La Digue, Seychelles',
      headline:'One Connected Platform for Seychelles DMCs.',
      intro:'Manage island resorts, hotel offers, quotations, ferries, domestic flights, private boats, connecting transfers, excursions, bookings, operations, taxes, finance and profitability through one connected destination management platform.',
      caption:'Built for connected island journeys across Seychelles',captionSub:'Coordinate Mahé, Praslin, La Digue and outer-island stays through one controlled workflow.',
      pillars:[['🏝️','Island Hotels & Resorts','Manage contracted stays, room categories, meal plans, seasons, policies and offers.'],['⛴️','Inter-Island Transfers','Connect ferries, domestic flights, private boats and ground transfers without operational gaps.'],['🐢','Experiences & Excursions','Package beaches, nature reserves, marine activities, island tours and guided experiences.']],
      roleTitle:'The DMC Role in Seychelles Tourism.',roleText:'Seychelles DMCs connect global travel partners with hotels, island resorts, ferry operators, domestic airlines, boat companies, transport providers, guides, marine activities and nature experiences.',
      roleCards:[['🛬','Mahé Gateway Operations','Coordinate international arrivals with hotels, jetties, domestic flights and onward transfers.'],['⛴️','Praslin Connections','Manage the important Praslin link to La Digue and other island services with connecting ground movements.'],['🏝️','Multi-Island Programmes','Combine Mahé, Praslin, La Digue and private-island stays in one itinerary.'],['🌊','Weather-Sensitive Logistics','Maintain timings, alternatives and supplier communication for sea and air movements.']],
      features:[
        ['🏨','Multi-Market Hotel & Resort Contracting','Maintain rates by source market, island, season, currency, room type and meal plan.',true],
        ['🏝️','Private-Island Resort Contracting','Manage island-specific accommodation, transfer requirements, inclusions and policies.'],
        ['🏷️','Tactical Resort Offers','Digitise early-booking, stay-pay, honeymoon, upgrade and value-added promotions.',true],
        ['＋','Combined Offer Rules','Define which resort offers may be combined and prevent invalid promotion stacking.'],
        ['🧮','FIT & GIT Quote Builder','Build accurate individual and group quotations from structured products and rates.',true],
        ['%','Markup Management','Set markups by market or specific agent across all services for quotations, individual service sales and the B2B platform.',true],
        ['🔀','Multi-Option Quotations','Present alternative resorts, islands, transfer modes and programme combinations.'],
        ['💬','Email & WhatsApp Quotations','Send professional quotations quickly, including complex island-transfer calculations.'],
        ['✨','AI Itinerary Creation','Create professional Seychelles itineraries faster with consistent destination information.'],
        ['📱','Digital, Email & PDF Itineraries','Deliver customised and branded proposals across multiple formats.'],
        ['⛴️','Inter-Island Ferry Management','Control routes, sailing times, classes, fares, baggage, passenger details and supplier conditions.',true],
        ['✈️','Mahé–Praslin Domestic Flights','Manage domestic sectors, schedules, fares, baggage and connecting services.',true],
        ['🚤','Private Boat & Speedboat Transfers','Price and reserve private or shared boat movements between relevant islands.'],
        ['🚁','Helicopter & Charter Transfers','Include premium air transfers and charter services in quotations and operations.'],
        ['🔗','Connected Transfer Management','Link airport, road, ferry, flight and hotel transfers as one complete guest movement.',true],
        ['🚐','Mahé & Praslin Ground Transfers','Price airport, jetty, hotel and excursion routes with vehicle and pickup details.'],
        ['📋','Passenger & Baggage Manifests','Maintain traveller details, baggage allowances and movement lists for air and sea sectors.'],
        ['🗓️','Schedule & Connection Control','Coordinate arrival times, check-in windows, sailing schedules and onward transfers.'],
        ['🎟️','Excursion & Entrance Management','Control island tours, reserves, marine parks, entrance fees and supplier conditions.'],
        ['🐠','Marine Activity Management','Contract snorkelling, diving, fishing, cruises and water-based experiences.'],
        ['🐢','Nature & Conservation Products','Manage reserve visits, guided walks, conservation fees and eco-experiences.'],
        ['🍽️','Restaurant & Meal Contracting','Manage group menus, dietary requirements, dining and special experiences.'],
        ['💍','Honeymoon & Celebration Packages','Combine stays, transfers, dining, experiences and romantic inclusions.'],
        ['📘','Group Series Brochure Programmes','Create fixed-date Seychelles programmes for travel agents to promote and sell.'],
        ['⚡','Quick Booking Module','Convert confirmed FIT and group enquiries into controlled travel files.'],
        ['✅','Supplier Reservations & Vouchers','Manage requests, confirmations, amendments and supplier vouchers.'],
        ['OPS','Operations & Logistics','Coordinate arrivals, jetties, flights, ferries, boats, drivers, guides and daily services.'],
        ['💼','Pre- & Post-Tour Expenses','Issue operational cash and reconcile driver, guide and tour expenses.'],
        ['%','Tax, Levy & Service Charge Management','Apply configured local taxes, tourism levies and supplier service charges where applicable.',true],
        ['🧾','Proforma, Tax & Advance Invoices','Generate commercial documents, deposits and payment schedules.'],
        ['AR','Receivable Tracking','Monitor collections, due dates, ageing and outstanding balances.'],
        ['AP','Supplier Payable Tracking','Manage supplier liabilities, schedules, approvals and outstanding amounts.'],
        ['P&L','File-Wise P&L & Monthly GP','Measure profitability by file, market, island and programme.',true],
        ['FX','Multi-Currency Management','Manage supplier and selling currencies with controlled exchange rates.'],
        ['MIS','Dashboards, Market Analysis & MIS','Turn sales and operational activity into management intelligence.'],
        ['450+','450+ Powerful Features','Scale the complete Seychelles DMC operation through one connected platform.',true]
      ],
      completeFeatures:true,
      focusTitle:'Build Complete Seychelles Island-Hopping Programmes.',
      focusText:'Combine resorts, ferries, domestic flights, road transfers, private boats, excursions, meals and island stays into accurate and profitable programmes.',
      packages:[['🏝️','Mahé Island Stays','Resorts, airport transfers, island tours and marine experiences.'],['🌴','Praslin Escapes','Resort stays, Vallée de Mai, beaches and connecting transfers.'],['🚲','La Digue Experiences','Ferry connections, bicycles, beaches, nature and guided discovery.'],['⛴️','Three-Island Journeys','Mahé, Praslin and La Digue connected through planned air, sea and road sectors.'],['💎','Private-Island Luxury','Premium resorts, private transfers and curated experiences.'],['💍','Honeymoons & Celebrations','Romantic stays, dining, cruises and special inclusions.'],['🐠','Marine & Nature','Diving, snorkelling, reserves, island cruises and eco-experiences.'],['👥','Groups & Series','Fixed departures, rooming lists, manifests and movement coordination.']],
      tax:'Applicable Taxes, Tourism Levies & Service Charges',taxText:'Configure applicable local taxes, tourism levies and supplier service charges across accommodation, transfers, excursions and invoices according to current rules and the DMC’s accounting policies.',
      famous:[['Beaches & Granite Islands','Distinctive beaches, granite landscapes and clear tropical waters.'],['Mahé, Praslin & La Digue','Three principal islands connected through air, sea and ground services.'],['Nature & Marine Life','Reserves, giant tortoises, marine parks, diving and island ecosystems.'],['Luxury & Romance','Private-island resorts, honeymoons, celebrations and premium experiences.']],
      impact:['Build multi-island quotations with every connecting sector included.','Coordinate Mahé, Praslin and La Digue movements without service gaps.','Control resort offers and transfer conditions accurately.','Apply market and agent markups consistently across sales channels.','Improve visibility across suppliers, manifests and daily operations.','Measure profitability by file, market, island and programme.']
    },
    oman:{
      label:'Oman',hero:'img/oman-hero.webp',heroWidth:2048,heroHeight:768,heroAlt:'Muscat waterfront and traditional fort with mountains behind the bay at sunset',
      headline:'One Connected Platform for Oman DMCs.',
      intro:'Manage hotel contracts, round tours, transport, guides, desert camps, quotations, bookings, VAT, operations, finance and profitability through one powerful destination management platform.',
      caption:'Built for Oman’s multi-stop touring operations',captionSub:'From Muscat and the mountains to deserts, wadis and the coast.',
      pillars:[['🏨','Hotels & Offers','Manage seasons, room types, meal plans, tactical offers and market rates.'],['🗺️','Round Tours & Circuits','Build multi-night programs across cities, mountains, deserts and coast.'],['🚘','Transport & Mileage','Price point-to-point routes, vehicles, mileage, drivers and long-distance movements.']],
      roleTitle:'The DMC Role in Oman Tourism.',roleText:'Oman DMCs connect global travel partners with hotels, desert camps, transport companies, guides, cultural sites, wadis, mountains and coastal experiences.',
      roleCards:[['🏛️','Culture & Heritage','Coordinate forts, museums, souqs and heritage experiences.'],['🏜️','Desert Operations','Manage camps, 4x4 vehicles, meals and remote services.'],['⛰️','Multi-Stop Touring','Connect cities, mountains, wadis and coastal stays.'],['🚘','Long-Distance Logistics','Control routes, mileage, drivers and daily movements.']],
      features:[
        ['🏨','Multi-Market Hotel Contracting','Maintain hotel and camp rates by market, season and currency.'],
        ['🏷️','Hotel Tactical Offers','Digitise early-bird, stay-pay and promotional offers.'],
        ['⛺','Desert Camp Contracting','Manage tents, meal plans, transfers and camp activities.'],
        ['🗺️','Round Tour Builder','Create structured circuits with nights, services and daily routing.'],
        ['↔️','Point-to-Point Transfers','Price airport, hotel, city, mountain and desert routes.'],
        ['📍','Point-to-Point Mileage','Calculate distance and operating cost across touring circuits.'],
        ['🚙','4x4 & Vehicle Management','Maintain vehicle types, capacities, rates and route conditions.'],
        ['🚌','Coach & Group Transport','Manage coaches, group movements and baggage requirements.'],
        ['🗣️','Guide Management','Maintain language, rate, working-hour and assignment rules.'],
        ['🎟️','Entrance Fee Management','Control fort, museum, attraction and site fees.'],
        ['🍽️','Meals & Restaurants','Contract restaurants, group meals and special menus.'],
        ['🌊','Wadi & Coastal Experiences','Manage cruises, dolphin trips, wadis and marine activities.'],
        ['🏔️','Mountain & Adventure Services','Configure mountain stays, hikes and specialist vehicles.'],
        ['📘','Group Series Brochure Programs','Create date-led Oman circuits for agents to promote and sell.'],
        ['%','VAT Calculation','Apply configured VAT rules across applicable services and invoices.']
      ],
      focusTitle:'Build Complete Oman Round Tours.',
      focusText:'Combine hotels, desert camps, transport, guides, entrance fees, meals and activities into accurate multi-night touring programs.',
      packages:[['🕌','Cultural Oman','Muscat, Nizwa, forts, souqs and heritage.'],['🏜️','Desert & Wadi','Wadis, dunes, camps and 4x4 experiences.'],['⛰️','Mountains & Villages','Jabal Akhdar, mountain stays and local culture.'],['🌊','Coast & Marine','Sur, turtles, cruises and coastal experiences.'],['👥','Groups & Series','Coaches, guides, rooming lists and fixed departures.'],['💎','Luxury Oman','Premium hotels, private vehicles and curated experiences.']],
      tax:'VAT',taxText:'Apply configured VAT rules across applicable accommodation, transport, touring and destination services.',
      famous:[['Forts & Heritage','Historic forts, souqs and living traditions.'],['Deserts & Wadis','Dunes, wadis and dramatic natural landscapes.'],['Mountains & Villages','Scenic roads, villages and highland experiences.'],['Coast & Marine Life','Beaches, cruises, turtles and dolphin trips.']],
      impact:['Build complex round tours faster.','Calculate point-to-point mileage accurately.','Control desert, mountain and remote services.','Coordinate vehicles, guides and entrances.','Apply VAT consistently.','Measure profit for every circuit.']
    },
    singapore:{
      label:'Singapore',hero:'img/singapore-hero.webp',heroWidth:2048,heroHeight:768,heroAlt:'Singapore Marina Bay skyline, Marina Bay Sands and waterfront gardens after sunset',
      headline:'One Connected Platform for Singapore DMCs.',
      intro:'Manage hotel offers, stopovers, transfers, attractions, groups, MICE, cruises, GST, operations, finance and profitability through one connected platform.',
      caption:'Built for Singapore’s high-speed destination operations',captionSub:'From stopovers and attractions to MICE, cruises and regional programs.',
      pillars:[['🏨','Hotels & Stopovers','Manage contracted hotels, offers, short stays and package combinations.'],['🎟️','Attractions & Experiences','Control tickets, time slots, tours and destination products.'],['🚌','Groups, MICE & Logistics','Coordinate coaches, guides, delegates, events and movements.']],
      roleTitle:'The DMC Role in Singapore Tourism.',roleText:'Singapore DMCs connect global travel partners with hotels, attractions, cruise terminals, transport operators, restaurants, event venues and regional travel services.',
      roleCards:[['🛫','Global Stopover Hub','Create efficient short-stay and transit programs.'],['🎡','Attraction-Led Travel','Manage tickets, time slots and bundled experiences.'],['🏢','MICE & Corporate','Coordinate delegates, venues and event logistics.'],['🚢','Cruise & Regional Links','Connect cruise, airport and neighbouring-country services.']],
      features:[
        ['🏨','Multi-Market Hotel Contracting','Maintain rates by source market, season and currency.'],
        ['🏷️','Hotel Tactical Offers','Digitise promotions, stay-pay offers and upgrades.'],
        ['🛫','Stopover Package Management','Combine hotels, transfers and attractions for short stays.'],
        ['🎟️','Attraction & Ticket Management','Control rates, ticket types, slots and supplier conditions.'],
        ['↔️','Point-to-Point Transfers','Price routes between airport, hotels, attractions and cruise terminals.'],
        ['🚌','Coach & Transport Management','Maintain coach sizes, hourly use, transfers and disposal rates.'],
        ['🗣️','Guide Management','Manage languages, rates, timing and assignments.'],
        ['🏢','MICE & Delegate Operations','Coordinate venues, delegates, transport and event services.'],
        ['🚢','Cruise Pre & Post Programs','Build stays and services around cruise arrivals and departures.'],
        ['🌏','Regional Combination Programs','Combine Singapore with Malaysia and neighbouring destinations.'],
        ['🍽️','Restaurant & Meal Contracting','Manage group menus, dietary needs and meal packages.'],
        ['📘','Group Series Brochure Programs','Create fixed-date Singapore and regional programs for agents.'],
        ['📋','Rooming Lists & Manifests','Control passenger, room and movement information.'],
        ['📅','Timed Service Operations','Manage attraction slots, transfers and precise schedules.'],
        ['%','GST Calculation','Apply configured GST rules across applicable services and invoices.']
      ],
      focusTitle:'Build Complete Singapore Programs.',
      focusText:'Combine hotels, airport transfers, attractions, guides, meals, MICE services and regional extensions into professional programs.',
      packages:[['🛫','Stopover Packages','Hotels, transfers, city tours and attractions.'],['👨‍👩‍👧','Family Singapore','Theme parks, wildlife attractions and family stays.'],['🏢','MICE & Corporate','Venues, delegates, coaches, meals and events.'],['🚢','Cruise Extensions','Pre- and post-cruise stays and port transfers.'],['🌏','Singapore & Malaysia','Cross-border hotels, transport and touring.'],['👥','Groups & Series','Fixed departures, coaches, guides and rooming lists.']],
      tax:'GST',taxText:'Apply configured GST rules across applicable accommodation, transport, attractions and destination services.',
      famous:[['Modern City Experiences','Architecture, waterfronts and contemporary attractions.'],['Gardens & Family Attractions','Gardens, wildlife parks and entertainment.'],['Food & Multicultural Heritage','Neighbourhoods, cuisines and cultural experiences.'],['MICE & Regional Connectivity','Events, cruises and Southeast Asian combinations.']],
      impact:['Respond rapidly to short-lead enquiries.','Package hotels, transfers and attractions accurately.','Manage timed tickets and precise schedules.','Coordinate groups, MICE and cruise movements.','Apply GST consistently.','Measure profitability by market and program.']
    },
    cambodia:{
  "label": "Cambodia",
  "hero": "img/cambodia-angkor-wat.webp",
  "heroAlt": "Angkor Wat temple towers reflected in a pool in Cambodia",
  "headline": "One Connected Platform for Cambodia DMCs.",
  "intro": "Manage hotel contracts, SIC transfers and tours, multi-city programmes, quotations, bookings, operations, tax, finance and profitability for your Cambodia DMC through one connected platform.",
  "caption": "Built for Cambodia’s connected cultural and touring operations",
  "captionSub": "From Siem Reap and Angkor to Phnom Penh, Battambang and the coast.",
  "pillars": [
    [
      "🚌",
      "SIC Transfers & Tours",
      "Manage shared transfers, guided temple tours, operating days and pickup points."
    ],
    [
      "🗺️",
      "Cultural & Multi-City Circuits",
      "Build private and group journeys connecting temples, heritage towns and the capital."
    ],
    [
      "🌴",
      "Coast & Regional Extensions",
      "Connect cultural programmes with coastal stays and neighbouring destinations."
    ]
  ],
  "roleTitle": "The DMC Role in Cambodia Tourism.",
  "roleText": "Cambodia DMCs connect international travel partners with hotels, transport operators, guides, attractions, restaurants and local experience providers. DMC24 keeps the commercial and operational details together.",
  "roleCards": [
    [
      "🏛️",
      "Temple & Heritage Touring",
      "Coordinate guided Angkor visits, entrance services and cultural experiences."
    ],
    [
      "🏙️",
      "City & Cultural Travel",
      "Package Phnom Penh and Battambang stays with guides and ground services."
    ],
    [
      "🌴",
      "Coastal & Island Stays",
      "Combine Sihanoukville, Kampot, Kep and island resort extensions."
    ],
    [
      "🌏",
      "Regional Programmes",
      "Keep Cambodia services connected with Vietnam, Thailand and Laos itineraries."
    ]
  ],
  "features": [
    [
      "🏨",
      "Multi-Market Hotel Contracting",
      "Maintain city, heritage and coastal hotel rates by market, season and currency."
    ],
    [
      "🏷️",
      "Hotel Tactical Offers",
      "Digitise promotions, stay-pay offers, upgrades and value-added benefits."
    ],
    [
      "🚌",
      "SIC Airport Transfer Management",
      "Configure scheduled transfers by airport, hotel zone, pickup window and vehicle."
    ],
    [
      "🗺️",
      "SIC Tour Management",
      "Manage fixed-departure tours, excursions, inclusions and operating days."
    ],
    [
      "📍",
      "Pickup Point & Hotel Zone Control",
      "Assign hotels to zones and publish clear pickup times and meeting points."
    ],
    [
      "⏱️",
      "SIC Cut-Off & Operating Rules",
      "Control booking deadlines, minimum passengers, blackout dates and departure rules."
    ],
    [
      "↔️",
      "Private Point-to-Point Transfers",
      "Price routes between airports, hotels, attractions, ports and cities."
    ],
    [
      "KM",
      "Mileage & Route Calculation",
      "Calculate distance and operating cost for land tours and private vehicles."
    ],
    [
      "🚐",
      "Vehicle & Coach Management",
      "Maintain capacities, seasons, disposal rates, overtime and baggage rules."
    ],
    [
      "✈️",
      "Domestic Flight Management",
      "Include sectors, schedules, fares, baggage and booking conditions."
    ],
    [
      "🛫",
      "Arrival & Departure Coordination",
      "Connect airport arrivals, departures and transfer services with the itinerary."
    ],
    [
      "🗺️",
      "Land Tour & Circuit Builder",
      "Create multi-night itineraries with hotels, transport, guides, meals and attractions."
    ],
    [
      "🎟️",
      "Attraction & Ticket Management",
      "Control entrance rates, ticket types, time slots and supplier conditions."
    ],
    [
      "🗣️",
      "Guide Management",
      "Manage languages, rates, working hours and destination assignments."
    ],
    [
      "🍽️",
      "Restaurant & Meal Contracting",
      "Manage group menus, dietary requirements and meal packages."
    ],
    [
      "🌴",
      "Coast & Island Programmes",
      "Combine cultural circuits with Kampot, Kep and coastal or island resort stays."
    ],
    [
      "🏛️",
      "Temple & Heritage Operations",
      "Coordinate guides, entrance services, visit timings and ground logistics for Angkor and cultural circuits."
    ],
    [
      "🏢",
      "MICE & Delegate Operations",
      "Coordinate venues, delegates, coaches, dining and event services."
    ],
    [
      "🌏",
      "Regional Combination Programmes",
      "Combine Cambodia with Vietnam, Thailand and Laos through coordinated destination services."
    ],
    [
      "📘",
      "Group Series Brochure Programmes",
      "Create fixed-date Cambodia and regional programmes for travel agents."
    ],
    [
      "📋",
      "Rooming Lists & Passenger Manifests",
      "Control passenger, room, flight and movement information."
    ],
    [
      "%",
      "Tax & Service Charge Management",
      "Apply configured local tax rules and supplier service charges where applicable."
    ]
  ],
  "focusTitle": "Build Complete Cambodia Programmes.",
  "focusText": "Combine hotels, SIC services, private transport, guides, entrance services, meals, cultural circuits and coastal extensions into accurate, profitable programmes.",
  "packages": [
    [
      "🏛️",
      "Siem Reap & Angkor",
      "Hotels, guided temple visits, entrance services and transfers."
    ],
    [
      "🏙️",
      "Phnom Penh & Siem Reap",
      "City stays, cultural touring, transport and local guides."
    ],
    [
      "🗺️",
      "Battambang Heritage",
      "Local experiences, heritage visits and overland connections."
    ],
    [
      "🌴",
      "Kampot & Kep",
      "Riverside stays, countryside touring and coastal experiences."
    ],
    [
      "⛵",
      "Coast & Island Extensions",
      "Resort nights, boat connections and ground transfers."
    ],
    [
      "👨‍👩‍👧",
      "Family Cambodia",
      "Flexible touring, cultural activities and family stays."
    ],
    [
      "🌏",
      "Cambodia & Vietnam",
      "Combine hotels, guides and regional travel services."
    ],
    [
      "👥",
      "Groups & Series",
      "Fixed departures, coaches, rooming lists and supplier coordination."
    ]
  ],
  "tax": "Taxes & Service Charges",
  "taxText": "Configure applicable taxes and supplier service charges across accommodation, transport, touring and destination services, according to your accounting policies.",
  "famous": [
    [
      "Angkor & Khmer Heritage",
      "Temple landscapes and the historic architecture of Angkor."
    ],
    [
      "Cities & Living Culture",
      "Phnom Penh, Battambang, markets and local traditions."
    ],
    [
      "Coast & Island Experiences",
      "Kampot, Kep and Cambodia’s southern coastal stays."
    ],
    [
      "Food & Rural Encounters",
      "Khmer cuisine, countryside visits and local experiences."
    ]
  ],
  "impact": [
    "Sell shared transfers and guided tours with clear operating rules.",
    "Build cultural and multi-city itineraries faster.",
    "Coordinate guides, temple visits and ground services.",
    "Connect cultural circuits with coast and regional extensions.",
    "Apply configured taxes and service charges consistently.",
    "Measure profitability by market, programme and booking."
  ],
  "heroWidth": 1280,
  "heroHeight": 645,
  "credit": "Photo: <a href=\"https://commons.wikimedia.org/wiki/File:Angkor_Wat_with_its_reflection_(cropped).jpg\" target=\"_blank\" rel=\"noopener\">Satdeep Gill / Wikimedia Commons</a> · <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" target=\"_blank\" rel=\"noopener\">CC BY-SA 4.0</a> · Resized and converted to WebP."
},
    vietnam:{
  "label": "Vietnam",
  "hero": "img/vietnam-ha-long-bay.webp",
  "heroAlt": "Limestone islands rising from the water in Ha Long Bay, Vietnam",
  "headline": "One Connected Platform for Vietnam DMCs.",
  "intro": "Manage hotel contracts, SIC transfers and tours, multi-city programmes, quotations, bookings, operations, tax, finance and profitability for your Vietnam DMC through one connected platform.",
  "caption": "Built for Vietnam’s connected city, cruise and touring operations",
  "captionSub": "From Hanoi and Ha Long Bay to Hue, Hoi An, Ho Chi Minh City and the coast.",
  "pillars": [
    [
      "🚌",
      "SIC Transfers & Tours",
      "Manage scheduled transfers, city tours, excursions, pickup points and operating rules."
    ],
    [
      "🗺️",
      "North-to-South Programmes",
      "Build connected circuits with hotels, guides, transport and domestic flight sectors."
    ],
    [
      "⛵",
      "Bay Cruises & Beach Stays",
      "Combine cruise products and coastal resorts with the wider travel programme."
    ]
  ],
  "roleTitle": "The DMC Role in Vietnam Tourism.",
  "roleText": "Vietnam DMCs connect international travel partners with hotels, transport operators, guides, attractions, restaurants and local experience providers. DMC24 keeps the commercial and operational details together.",
  "roleCards": [
    [
      "🏙️",
      "Cities & Cultural Circuits",
      "Connect Hanoi, Hue, Hoi An and Ho Chi Minh City with guided experiences."
    ],
    [
      "⛵",
      "Bay & Cruise Products",
      "Coordinate cruise cabins, embarkation points, transfers and inclusions."
    ],
    [
      "🌴",
      "Coast & Resort Extensions",
      "Add Da Nang, Nha Trang and Phu Quoc stays to touring programmes."
    ],
    [
      "✈️",
      "Multi-City Connectivity",
      "Bring domestic flight sectors and ground arrangements into one travel file."
    ]
  ],
  "features": [
    [
      "🏨",
      "Multi-Market Hotel Contracting",
      "Maintain city, heritage, coastal and island hotel rates by market, season and currency."
    ],
    [
      "🏷️",
      "Hotel Tactical Offers",
      "Digitise promotions, stay-pay offers, upgrades and value-added benefits."
    ],
    [
      "🚌",
      "SIC Airport Transfer Management",
      "Configure scheduled transfers by airport, hotel zone, pickup window and vehicle."
    ],
    [
      "🗺️",
      "SIC Tour Management",
      "Manage fixed-departure tours, excursions, inclusions and operating days."
    ],
    [
      "📍",
      "Pickup Point & Hotel Zone Control",
      "Assign hotels to zones and publish clear pickup times and meeting points."
    ],
    [
      "⏱️",
      "SIC Cut-Off & Operating Rules",
      "Control booking deadlines, minimum passengers, blackout dates and departure rules."
    ],
    [
      "↔️",
      "Private Point-to-Point Transfers",
      "Price routes between airports, hotels, attractions, ports and cities."
    ],
    [
      "KM",
      "Mileage & Route Calculation",
      "Calculate distance and operating cost for land tours and private vehicles."
    ],
    [
      "🚐",
      "Vehicle & Coach Management",
      "Maintain capacities, seasons, disposal rates, overtime and baggage rules."
    ],
    [
      "✈️",
      "Domestic Flight Management",
      "Include sectors, schedules, fares, baggage and booking conditions."
    ],
    [
      "🛫",
      "Multi-City Arrival Operations",
      "Coordinate arrivals, departures and ground services in Hanoi, Da Nang and Ho Chi Minh City."
    ],
    [
      "🗺️",
      "Land Tour & Circuit Builder",
      "Create multi-night itineraries with hotels, transport, guides, meals and attractions."
    ],
    [
      "🎟️",
      "Attraction & Ticket Management",
      "Control entrance rates, ticket types, time slots and supplier conditions."
    ],
    [
      "🗣️",
      "Guide Management",
      "Manage languages, rates, working hours and destination assignments."
    ],
    [
      "🍽️",
      "Restaurant & Meal Contracting",
      "Manage group menus, dietary requirements and meal packages."
    ],
    [
      "🌴",
      "Beach & Resort Programmes",
      "Combine touring with Da Nang, Nha Trang and Phu Quoc resort stays."
    ],
    [
      "⛵",
      "Bay Cruise Product Management",
      "Maintain cabin categories, cruise inclusions, embarkation details and connected transfers."
    ],
    [
      "🏢",
      "MICE & Delegate Operations",
      "Coordinate venues, delegates, coaches, dining and event services."
    ],
    [
      "🌏",
      "Regional Combination Programmes",
      "Combine Vietnam with Cambodia, Laos and other regional destinations."
    ],
    [
      "📘",
      "Group Series Brochure Programmes",
      "Create fixed-date Vietnam and regional programmes for travel agents."
    ],
    [
      "📋",
      "Rooming Lists & Passenger Manifests",
      "Control passenger, room, flight and movement information."
    ],
    [
      "%",
      "Tax & Service Charge Management",
      "Apply configured local tax rules and supplier service charges where applicable."
    ]
  ],
  "focusTitle": "Build Complete Vietnam Programmes.",
  "focusText": "Combine hotels, SIC services, private transport, domestic flights, bay cruises, guides, meals and beach extensions into accurate, profitable programmes.",
  "packages": [
    [
      "🏙️",
      "Hanoi & Ha Long Bay",
      "City hotels, guided touring, bay cruises and transfers."
    ],
    [
      "🏛️",
      "Hue, Da Nang & Hoi An",
      "Heritage, coastal stays, guides and inter-city transport."
    ],
    [
      "🌿",
      "Ho Chi Minh City & Mekong",
      "City experiences, river-region excursions and local guides."
    ],
    [
      "🗺️",
      "North-to-South Vietnam",
      "Multi-city hotels, domestic flights and connected ground services."
    ],
    [
      "🌴",
      "Phu Quoc & Beach Stays",
      "Resorts, airport transfers and island experiences."
    ],
    [
      "👨‍👩‍👧",
      "Family Vietnam",
      "Flexible touring, local experiences and family beach extensions."
    ],
    [
      "🌏",
      "Vietnam & Cambodia",
      "Connect cultural programmes with Angkor and Cambodian services."
    ],
    [
      "👥",
      "Groups & Series",
      "Fixed departures, coaches, guides, flights and rooming lists."
    ]
  ],
  "tax": "Taxes & Service Charges",
  "taxText": "Configure applicable taxes and supplier service charges across accommodation, transport, touring and destination services, according to your accounting policies.",
  "famous": [
    [
      "Cities & Cultural Heritage",
      "Hanoi, Hue, Hoi An and Ho Chi Minh City."
    ],
    [
      "Bays & Coastal Landscapes",
      "Ha Long Bay, beaches and scenic coastal stays."
    ],
    [
      "Food & Local Experiences",
      "Regional cuisine, markets and everyday cultural encounters."
    ],
    [
      "Rivers & Countryside",
      "The Mekong Delta, rural landscapes and guided excursions."
    ]
  ],
  "impact": [
    "Sell shared transfers and tours with clear operating rules.",
    "Build north-to-south itineraries faster.",
    "Connect domestic flight sectors with ground services.",
    "Coordinate cruise products, city touring and beach extensions.",
    "Apply configured taxes and service charges consistently.",
    "Measure profitability by market, programme and booking."
  ],
  "heroWidth": 1280,
  "heroHeight": 830,
  "credit": "Photo: <a href=\"https://commons.wikimedia.org/wiki/File:Ha_Long_Bay_(39389789735).jpg\" target=\"_blank\" rel=\"noopener\">Mig Gilbert / Wikimedia Commons</a> · <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\" target=\"_blank\" rel=\"noopener\">CC BY-SA 2.0</a> · Resized and converted to WebP."
},
    malaysia:{
      label:'Malaysia',hero:'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1600&q=86',heroWidth:1600,heroHeight:1075,heroAlt:'Illuminated Petronas Twin Towers and Kuala Lumpur skyline at dusk',
      headline:'One Connected Platform for Malaysia DMCs.',
      intro:'Manage hotel contracts, SIC transfers and tours, multi-city land programmes, domestic flights, islands, quotations, bookings, operations, tax, finance and profitability through one connected platform.',
      caption:'Built for Malaysia’s connected city, island and touring operations',captionSub:'From Kuala Lumpur and Penang to Langkawi, Borneo and regional extensions.',
      pillars:[['🚌','SIC Transfers & Tours','Manage scheduled airport transfers, city tours, excursions, timings and pickup points.'],['🗺️','Land Tours & Multi-City Programmes','Build guided and private circuits across Peninsular Malaysia and Borneo.'],['✈️','Domestic Flights & Islands','Connect mainland cities, island stays and East Malaysia with controlled flight sectors.']],
      roleTitle:'The DMC Role in Malaysia Tourism.',roleText:'Malaysia DMCs connect global travel partners with city hotels, island resorts, airlines, transport operators, attractions, guides, restaurants, nature products and regional travel services.',
      roleCards:[['🚌','Scheduled SIC Operations','Coordinate shared transfers and tours with fixed timings, zones and pickup points.'],['🏙️','City & Stopover Travel','Package Kuala Lumpur and gateway stays with efficient destination services.'],['🌴','Island & Nature Products','Combine Langkawi, Penang, beaches, rainforests and wildlife experiences.'],['✈️','Domestic Air Connectivity','Control flight sectors connecting Peninsular Malaysia, Sabah and Sarawak.']],
      features:[
        ['🏨','Multi-Market Hotel Contracting','Maintain city, resort and island hotel rates by market, season and currency.'],
        ['🏷️','Hotel Tactical Offers','Digitise promotions, stay-pay offers, upgrades and value-added benefits.'],
        ['🚌','SIC Airport Transfer Management','Configure scheduled transfers by airport, hotel zone, pickup window and vehicle.'],
        ['🗺️','SIC Tour Management','Manage fixed-departure city tours, excursions, inclusions and operating days.'],
        ['📍','Pickup Point & Hotel Zone Control','Assign hotels to zones and publish clear pickup times and meeting points.'],
        ['⏱️','SIC Cut-Off & Operating Rules','Control booking deadlines, minimum passengers, blackout dates and departure rules.'],
        ['↔️','Private Point-to-Point Transfers','Price routes between airports, hotels, attractions, ports and cities.'],
        ['KM','Mileage & Route Calculation','Calculate distance and operating cost for land tours and private vehicles.'],
        ['🚐','Vehicle & Coach Management','Maintain capacities, seasons, disposal rates, overtime and baggage rules.'],
        ['✈️','Domestic Flight Management','Include sectors, schedules, fares, baggage and booking conditions.'],
        ['🛫','Multi-Airport Operations','Coordinate services through Kuala Lumpur, Penang, Langkawi, Kota Kinabalu and Kuching.'],
        ['🗺️','Land Tour & Circuit Builder','Create multi-night itineraries with hotels, transport, guides, meals and attractions.'],
        ['🎟️','Attraction & Ticket Management','Control entrance rates, ticket types, time slots and supplier conditions.'],
        ['🗣️','Guide Management','Manage languages, rates, working hours and destination assignments.'],
        ['🍽️','Restaurant & Meal Contracting','Manage group menus, dietary requirements and meal packages.'],
        ['🌴','Island & Resort Programmes','Combine mainland services with Penang, Langkawi and other island stays.'],
        ['🦧','Sabah & Sarawak Operations','Manage Borneo flights, nature products, lodges, guides and ground logistics.'],
        ['🏢','MICE & Delegate Operations','Coordinate venues, delegates, coaches, dining and event services.'],
        ['🌏','Regional Combination Programmes','Combine Malaysia with Singapore, Thailand, Brunei and neighbouring destinations.'],
        ['📘','Group Series Brochure Programmes','Create fixed-date Malaysia and regional programmes for travel agents.'],
        ['📋','Rooming Lists & Passenger Manifests','Control passenger, room, flight and movement information.'],
        ['%','Tax & Service Charge Management','Apply configured SST, tourism tax and supplier service charges where applicable.']
      ],
      focusTitle:'Build Complete Malaysia Programmes.',
      focusText:'Combine hotels, SIC services, private transport, domestic flights, guides, attractions, meals, islands and Borneo extensions into accurate, profitable programmes.',
      packages:[['🏙️','Kuala Lumpur Stopovers','Hotels, SIC airport transfers, city tours and attractions.'],['🌴','Kuala Lumpur & Langkawi','City stays, domestic flights, island resorts and transfers.'],['🏛️','Kuala Lumpur & Penang','Heritage, food, hotels, touring and inter-city travel.'],['🦧','Sabah & Sarawak','Borneo flights, wildlife, nature lodges and guided experiences.'],['👨‍👩‍👧','Family Malaysia','Theme parks, nature, city attractions and island stays.'],['🏢','MICE & Corporate','Venues, delegates, coaches, meals and event logistics.'],['🌏','Malaysia & Singapore','Cross-border hotels, transport, flights and touring.'],['👥','Groups & Series','Fixed departures, coaches, guides, flights and rooming lists.']],
      tax:'SST, Tourism Tax & Service Charges',taxText:'Configure applicable SST, tourism tax and supplier service charges across accommodation, transport, touring and destination services.',
      famous:[['Cities & Multicultural Heritage','Kuala Lumpur, Malacca and diverse cultural neighbourhoods.'],['Islands & Beaches','Langkawi, Penang and tropical resort experiences.'],['Food & Local Experiences','Distinctive Malay, Chinese, Indian and regional cuisines.'],['Borneo Nature & Wildlife','Rainforests, marine parks, wildlife and adventure in Sabah and Sarawak.']],
      impact:['Sell scheduled SIC transfers and tours with clear operating rules.','Build multi-city land itineraries faster.','Connect domestic flight sectors with ground services.','Coordinate mainland, island and Borneo operations.','Apply taxes and service charges consistently.','Measure profitability by market, programme and booking.']
    },
    thailand:{
      label:'Thailand',hero:'img/thailand-bangkok-temple.webp',heroWidth:1200,heroHeight:1598,heroAlt:'Traditional Thai temple with ornate tiled roofs and trees beside a Bangkok waterway',
      headline:'One Connected Platform for Thailand DMCs.',
      intro:'Manage hotel contracts, SIC transfers and tours, multi-city land programmes, domestic flights, islands, quotations, bookings, operations, tax, finance and profitability through one connected platform.',
      caption:'Built for Thailand’s connected city, island and touring operations',captionSub:'From Bangkok and Pattaya to Phuket, Krabi, Chiang Mai and regional extensions.',
      pillars:[['🚌','SIC Transfers & Tours','Manage scheduled airport transfers, city tours, excursions, timings and pickup points.'],['🗺️','Land Tours & Multi-City Programmes','Build guided and private circuits linking Bangkok, Ayutthaya, Chiang Mai and beach destinations.'],['✈️','Domestic Flights & Islands','Connect mainland cities, island stays and northern Thailand with controlled flight sectors.']],
      roleTitle:'The DMC Role in Thailand Tourism.',roleText:'Thailand DMCs connect global travel partners with city hotels, island resorts, airlines, transport operators, attractions, guides, restaurants, nature products and regional travel services.',
      roleCards:[['🚌','Scheduled SIC Operations','Coordinate shared transfers and tours with fixed timings, zones and pickup points.'],['🏙️','City & Stopover Travel','Package Bangkok and gateway stays with efficient destination services.'],['🌴','Island & Nature Products','Combine Phuket, Krabi, island excursions, beaches and nature experiences.'],['✈️','Domestic Air Connectivity','Control flight sectors connecting central and southern Thailand, Chiang Mai and Chiang Rai.']],
      features:[
        ['🏨','Multi-Market Hotel Contracting','Maintain city, resort and island hotel rates by market, season and currency.'],
        ['🏷️','Hotel Tactical Offers','Digitise promotions, stay-pay offers, upgrades and value-added benefits.'],
        ['🚌','SIC Airport Transfer Management','Configure scheduled transfers by airport, hotel zone, pickup window and vehicle.'],
        ['🗺️','SIC Tour Management','Manage fixed-departure city tours, excursions, inclusions and operating days.'],
        ['📍','Pickup Point & Hotel Zone Control','Assign hotels to zones and publish clear pickup times and meeting points.'],
        ['⏱️','SIC Cut-Off & Operating Rules','Control booking deadlines, minimum passengers, blackout dates and departure rules.'],
        ['↔️','Private Point-to-Point Transfers','Price routes between airports, hotels, attractions, ports and cities.'],
        ['KM','Mileage & Route Calculation','Calculate distance and operating cost for land tours and private vehicles.'],
        ['🚐','Vehicle & Coach Management','Maintain capacities, seasons, disposal rates, overtime and baggage rules.'],
        ['✈️','Domestic Flight Management','Include sectors, schedules, fares, baggage and booking conditions.'],
        ['🛫','Multi-Airport Operations','Coordinate services through Bangkok, Chiang Mai, Phuket, Krabi and Chiang Mai.'],
        ['🗺️','Land Tour & Circuit Builder','Create multi-night itineraries with hotels, transport, guides, meals and attractions.'],
        ['🎟️','Attraction & Ticket Management','Control entrance rates, ticket types, time slots and supplier conditions.'],
        ['🗣️','Guide Management','Manage languages, rates, working hours and destination assignments.'],
        ['🍽️','Restaurant & Meal Contracting','Manage group menus, dietary requirements and meal packages.'],
        ['🌴','Island & Resort Programmes','Combine mainland services with Chiang Mai, Phuket and other island stays.'],
        ['⛵','Island & Boat Transfer Operations','Coordinate piers, boat transfers, island excursions, pickup times and supplier confirmations.'],
        ['🏢','MICE & Delegate Operations','Coordinate venues, delegates, coaches, dining and event services.'],
        ['🌏','Regional Combination Programmes','Combine Thailand with Malaysia, Singapore, Cambodia and neighbouring destinations.'],
        ['📘','Group Series Brochure Programmes','Create fixed-date Thailand and regional programmes for travel agents.'],
        ['📋','Rooming Lists & Passenger Manifests','Control passenger, room, flight and movement information.'],
        ['%','Tax & Service Charge Management','Apply configured taxes and supplier service charges where applicable.']
      ],
      focusTitle:'Build Complete Thailand Programmes.',
      focusText:'Combine hotels, SIC services, private transport, domestic flights, guides, attractions, meals, islands and northern Thailand extensions into accurate, profitable programmes.',
      packages:[['🏙️','Bangkok & Pattaya','City hotels, airport transfers, attractions and coastal excursions.'],['🌴','Phuket & Krabi','Beach resorts, boat transfers, island excursions and guided tours.'],['🏛️','Bangkok & Ayutthaya','Temples, heritage visits, guides, meals and private transport.'],['⛰️','Chiang Mai & Chiang Rai','Northern circuits, cultural experiences, hotels and ground logistics.'],['👨‍👩‍👧','Family Thailand','Family stays, attractions, private transfers and beach extensions.'],['🏢','MICE & Corporate','Venues, delegates, coaches, meals and event logistics.'],['🌏','Regional Extensions','Connect Thailand programmes with neighbouring destinations.'],['👥','Groups & Series','Fixed departures, coaches, guides, flights and rooming lists.']],
      tax:'Taxes & Service Charges',taxText:'Configure applicable taxes and supplier service charges across accommodation, transport, touring and destination services.',
      famous:[['Cities & Cultural Heritage','Bangkok, Ayutthaya, temples and cultural neighbourhoods.'],['Islands & Beaches','Phuket, Krabi and tropical resort experiences.'],['Food & Local Experiences','Thai cuisine, markets and regional culinary traditions.'],['Northern Landscapes & Culture','Chiang Mai, Chiang Rai, mountain scenery and guided cultural journeys.']],
      impact:['Sell scheduled SIC transfers and tours with clear operating rules.','Build multi-city land itineraries faster.','Connect domestic flight sectors with ground services.','Coordinate mainland, island and northern Thailand operations.','Apply taxes and service charges consistently.','Measure profitability by market, programme and booking.']
    },
    hongkong:{
      label:'Hong Kong',hero:'img/hong-kong-hero.webp',heroWidth:1774,heroHeight:887,heroAlt:'Passenger ferry crossing Victoria Harbour beneath the illuminated Hong Kong skyline',
      headline:'One Connected Platform for Hong Kong DMCs.',
      intro:'Manage hotels, attractions, transfers, ferries, guides, groups, MICE and regional Hong Kong–Macau–Shenzhen programmes through one connected destination management platform.',
      caption:'Hong Kong at the centre of a connected regional journey',captionSub:'From airport arrival and Victoria Harbour to Macau ferries and Shenzhen extensions.',
      pillars:[['🏨','Hotels & City Stays','Manage contracted hotels, short stays, stopovers, offers and room requirements.'],['🚢','Hong Kong–Macau Ferries','Control ferry sectors, terminals, timings, classes, baggage and passenger details.'],['🌏','Regional Programmes','Combine Hong Kong with Macau and Shenzhen while keeping Hong Kong as the base destination.']],
      roleTitle:'The DMC Role in Hong Kong Tourism.',roleText:'Hong Kong DMCs connect global travel partners with hotels, attractions, ferries, transport operators, restaurants, event venues, Macau services and Shenzhen extensions.',
      roleCards:[['🛫','Global Stopover Hub','Create efficient short-stay, transit and city programmes.'],['🚢','Ferry-Led Connections','Coordinate Hong Kong and Macau through terminal-specific services.'],['🏢','MICE & Corporate','Manage delegates, venues, transport and event logistics.'],['🌏','Three-City Touring','Combine Hong Kong, Macau and Shenzhen in one controlled itinerary.']],
      features:[
        ['🏨','Multi-Market Hotel Contracting','Maintain Hong Kong hotel rates by source market, season and currency.'],
        ['🏷️','Hotel Tactical Offers','Digitise short-window promotions, upgrades and stay-based offers.'],
        ['🛫','Stopover Package Management','Combine hotels, transfers and attractions for short Hong Kong stays.'],
        ['🎟️','Attraction & Ticket Management','Control rates, ticket types, time slots and supplier conditions.'],
        ['↔️','Point-to-Point Transfers','Price routes between airport, hotels, attractions, ferry terminals and borders.'],
        ['🚢','Hong Kong–Macau Ferry Management','Manage terminals, sailings, cabin classes, fares and booking conditions.'],
        ['📋','Ferry Passenger & Baggage Details','Maintain passenger manifests, travel documents and baggage allowances.'],
        ['🚌','Coach & Transport Management','Maintain vehicle sizes, hourly use, transfers and disposal rates.'],
        ['🗣️','Guide Management','Manage languages, rates, timings and destination assignments.'],
        ['🌏','Hong Kong–Macau–Shenzhen Programmes','Build connected regional itineraries while retaining Hong Kong as the base.'],
        ['🛂','Cross-Border Service Coordination','Track border sectors, supplier handovers, timings and document notes.'],
        ['🏢','MICE & Delegate Operations','Coordinate venues, delegates, transfers, dining and event services.'],
        ['🚢','Cruise Pre & Post Programmes','Build stays and services around cruise arrivals and departures.'],
        ['🍽️','Restaurant & Meal Contracting','Manage group menus, dietary needs and meal packages.'],
        ['📘','Group Series Brochure Programmes','Create fixed-date Hong Kong and regional programmes for agents.'],
        ['📅','Timed Service Operations','Manage attraction slots, ferry departures, transfers and precise schedules.']
      ],
      focusTitle:'Build Complete Hong Kong Regional Programmes.',
      focusText:'Combine Hong Kong hotels, airport transfers, attractions and guides with Macau ferries, Shenzhen extensions, MICE services and regional logistics.',
      packages:[['🛫','Hong Kong Stopovers','Hotels, airport transfers, city touring and attractions.'],['🚢','Hong Kong & Macau','City stays, ferry sectors, transfers and Macau experiences.'],['🌏','Hong Kong, Macau & Shenzhen','A connected three-city itinerary with coordinated handovers.'],['🏢','MICE & Corporate','Venues, delegates, transport, meals and events.'],['🚢','Cruise Extensions','Pre- and post-cruise stays, terminal transfers and tours.'],['👥','Groups & Series','Fixed departures, coaches, guides, ferries and rooming lists.']],
      tax:'Local Taxes & Charges',taxText:'Configure applicable local taxes, service charges, ferry fees and supplier levies across each destination component.',
      famous:[['Victoria Harbour & Skyline','Iconic waterfront views, harbour cruises and urban experiences.'],['Culture, Food & Shopping','Neighbourhoods, markets, dining and international retail.'],['Macau Connections','Fast ferry access to heritage, leisure and entertainment.'],['Shenzhen & Greater Bay Area','Cross-border extensions for business, leisure and regional touring.']],
      impact:['Respond rapidly to short-lead enquiries.','Package Hong Kong, Macau and Shenzhen accurately.','Control ferry timings, terminals and passenger details.','Coordinate hotels, attractions, groups and MICE movements.','Manage cross-border supplier handovers.','Measure profitability by market and programme.']
    },
    saudi:{
      label:'Saudi Arabia',hero:'img/destination-saudi-arabia.webp',heroWidth:1536,heroHeight:1024,heroAlt:'Desert rock formations and a resort terrace at sunset',
      headline:'One Connected Platform for Saudi Arabia DMCs.',
      intro:'Manage enquiries, hotel contracts, quotations, bookings, domestic flights, rail, transport, guides, attractions, religious ground services, operations, VAT, finance and profitability through one connected platform.',
      caption:'Built for Saudi Arabia’s rapidly expanding tourism industry',captionSub:'From Riyadh, Jeddah and AlUla to religious ground services, Red Sea stays and major events.',
      pillars:[['HOT','Hotels, Resorts & Offers','Manage seasonal contracts, room types, tactical offers and source-market rates.'],['CITY','Multi-City Programmes','Connect cities, heritage destinations, religious ground services and Red Sea stays.'],['OPS','Transport & Logistics','Coordinate flights, rail, coaches, vehicles, guides and long-distance movements.']],
      roleTitle:'The DMC Role in Saudi Arabia Tourism.',roleText:'Saudi DMCs connect global travel partners with hotels, transport companies, domestic airlines, rail services, guides, attractions, restaurants, event venues and emerging destination experiences.',
      roleCards:[['GROW','Expanding Destination Products','Combine heritage, entertainment, nature, luxury, events and religious ground services.'],['MOVE','Complex Guest Movements','Coordinate airports, hotels, flights, rail, coaches, guides and supplier handovers.'],['MKT','International Source Markets','Maintain market-specific rates, currencies, policies and commercial conditions.'],['VOL','Seasonal & High-Volume Operations','Manage groups, events, peak periods and fixed-date programmes.']],
      completeFeatures:true,
      features:[
        ['MO','End-to-End Mid Office','Connect sales, contracting, quotations, bookings, operations, finance and reporting.'],['CRM','Sales & CRM','Track agents, enquiries, follow-ups, quotations, lost reasons and conversions.'],['MKT','Business Market Performance','Analyse enquiries, revenue, conversion and profitability by source market.',true],['HOT','Multi-Market Hotel Contracting','Maintain hotel and resort rates by market, season, currency and policy.',true],['REL','Religious-Market Hotel Contracting','Manage relevant Makkah and Madinah hotel products, seasons, rooms and meal plans.'],['RES','Resort & Luxury Product Contracting','Maintain premium properties, villas, supplements and value-added services.'],['OFR','Tactical Hotel Offers','Digitise early-booking, stay-pay, upgrades and short-window promotions.'],['COM','Offer Combination Rules','Define permitted combinations and prevent invalid offer stacking.'],['FIT','FIT & GIT Quote Builder','Build detailed individual and group quotations using structured products and rates.',true],['OPT','Multi-Option Quotations','Present alternative hotels, routes, vehicles and service combinations.'],['MSG','Email & WhatsApp Quotations','Send professional quotations quickly with complex calculations.'],['AI','AI Itinerary Creation','Create destination itineraries faster with consistent programme information.'],['PDF','Digital, Email & PDF Itineraries','Deliver customised and branded proposals in multiple formats.'],['CITY','Multi-City Itinerary Builder','Connect Riyadh, Jeddah, AlUla, Madinah, Makkah, the Red Sea and Abha.',true],['AIR','Domestic Flight Management','Include sectors, schedules, fares, baggage and supplier information.'],['RAIL','High-Speed Rail Sectors','Include dates, timings, classes and passenger details in the programme.'],['TRF','Point-to-Point Transfers','Create route pricing between cities, airports, hotels, attractions and resorts.'],['KM','Point-to-Point Mileage','Calculate routing distances and transport costs for intercity programmes.'],['BUS','Vehicle & Coach Management','Maintain capacities, seasons, overtime, disposal and group transport rates.'],['GUIDE','Guide Management','Control languages, qualifications, rates, assignments and allowances.'],['GRD','Religious Ground Services','Coordinate permitted accommodation, transport, meals, guides and destination services.',true],['TKT','Attractions & Entrance Management','Maintain ticket rates, time slots, seasons and supplier conditions.'],['ALU','AlUla & Heritage Experiences','Manage timed visits, specialist guides, transfers and experience combinations.',true],['DES','Desert & Adventure Products','Configure camps, 4x4 services, activities and specialist requirements.'],['SEA','Red Sea & Coastal Programmes','Combine resorts, transfers, marine experiences and leisure services.'],['MEAL','Restaurant & Meal Management','Contract menus, group meals, dietary requirements and packages.'],['MICE','MICE & Corporate Operations','Coordinate venues, delegates, transport, dining and event schedules.'],['EVT','Entertainment & Event Travel','Manage travel services around sport, exhibitions, concerts and events.'],['SER','Group Series Programmes','Create recurring programmes with fixed dates, services and agent distribution.'],['QBK','Quick Booking','Convert confirmed FIT and group business into controlled travel files.'],['SUP','Supplier Reservations & Vouchers','Manage requests, confirmations, amendments and vouchers.'],['ROOM','Rooming Lists & Manifests','Maintain traveller, room, flight, rail and movement information.'],['OPS','Operations & Logistics','Coordinate arrivals, vehicles, drivers, guides, flights, rail and daily services.'],['EXP','Pre- & Post-Tour Expenses','Issue operational cash and reconcile driver, guide and tour expenses.'],['VAT','VAT Calculation','Apply configured VAT rules to relevant products, services and invoices.',true],['INV','Proforma, VAT & Advance Invoices','Generate commercial documents and payment schedules.'],['AR','Receivable Tracking','Monitor collections, due dates, ageing and outstanding balances.'],['AP','Supplier Payable Tracking','Manage supplier liabilities, schedules and approvals.'],['P&L','File-Wise P&L & Monthly GP','Measure profitability by file, market, product and period.',true],['FX','Multi-Currency Management','Manage supplier and selling currencies with controlled exchange rates.'],['MIS','Dashboards, Market Analysis & MIS','Turn commercial and operational data into management intelligence.'],['450+','450+ Powerful Features','Scale the complete Saudi Arabia DMC operation through one platform.',true]
      ],
      notice:{title:'Religious Travel Ground Services: Clear Scope and Connected Control',text:'DMC24 can manage the destination and ground-handling components of religious travel programmes. Specialised pilgrim, visa, allotment and departure-management requirements may require a separately configured solution or integration.',important:'DMC24 is presented here for relevant destination and ground-handling services. Specialised pilgrim management is not represented as a standard DMC24 module.',steps:[['1','Contract Ground Products','Structure relevant hotels, transport, meals, guides and service conditions.'],['2','Build the Programme','Combine permitted ground services with arrival, departure and intercity movements.'],['3','Confirm & Operate','Track suppliers, rooming, vehicles, vouchers and daily service delivery.'],['4','Control Financials','Manage invoices, collections, payables, expenses and final file profitability.']]},
      focusTitle:'Build Complete Saudi Arabia Programmes.',focusText:'Combine hotels, domestic flights, rail, transfers, coaches, guides, attractions, meals, events and destination services into accurate and profitable programmes.',
      packages:[['RUH','Riyadh City & Business','Hotels, corporate services, dining, attractions and event support.'],['JED','Jeddah & Red Sea','City stays, cultural experiences, resorts and coastal activities.'],['ALU','AlUla Heritage','Hotels, timed entrances, specialist guides and premium experiences.'],['CIR','Multi-City Circuits','Connect Riyadh, Jeddah, AlUla and other destinations.'],['REL','Religious Ground Services','Relevant accommodation, permitted transport, meals and guides.'],['LUX','Red Sea Luxury','Premium resorts, private transfers and marine experiences.'],['ABH','Abha & the South','Nature, culture, scenic routes and domestic connections.'],['MICE','MICE & Incentives','Venues, delegates, transport, dining and events.']],
      tax:'VAT',taxText:'Apply configured VAT rules to relevant products, services, markups and invoices according to prevailing regulations and the DMC’s accounting policies.',
      famous:[['Heritage & Ancient Civilisations','Archaeological sites, historic cities and cultural landscapes.'],['Religious Significance','Makkah and Madinah hold exceptional importance for Muslim travellers.'],['Modern Cities & Major Events','Business, entertainment, sport, exhibitions and international events.'],['AlUla, Red Sea & Nature','Heritage, luxury hospitality, coastlines, deserts and mountain experiences.']],
      impact:['Respond faster to complex multi-city enquiries.','Structure hotel, transport and destination product contracts.','Cost flights, rail, vehicles, guides and entrances accurately.','Coordinate groups and complex guest movements.','Apply configured VAT and financial controls consistently.','Expand through B2B, B2C, Local Sales and Multi-DMC capabilities.']
    },
    egypt:{
      label:'Egypt',hero:'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1400&q=88',heroWidth:1400,heroHeight:933,heroAlt:'Pyramid at Giza in Egypt with visitors at its base beneath a cloudy sky',
      headline:'One Connected Platform for Egypt DMCs.',
      intro:'Manage hotels, Nile cruise programmes, cultural touring, transport, guides, entrance fees, domestic flights, quotations, bookings, operations, finance and profitability through one connected DMC platform.',
      caption:'Egypt journeys, connected from Cairo to the Nile',captionSub:'Control every hotel, sailing sector, guide, entrance, movement, cost and guest service.',
      pillars:[['PYR','Culture & Heritage Operations','Coordinate monuments, museums, entrances, guides and timed services.'],['NILE','Nile Cruise Workaround','Configure cruise products and packages through existing DMC24 workflows.'],['OPS','Multi-City Logistics','Connect Cairo, Luxor, Aswan, Alexandria and Red Sea extensions.']],
      roleTitle:'The DMC Role in Egypt Tourism.',roleText:'Egypt DMCs connect global travel partners with hotels, Nile cruise suppliers, domestic airlines, transport companies, Egyptologists, guides, monuments, museums, restaurants and Red Sea resorts.',
      roleCards:[['HIS','Heritage & Archaeology','Coordinate complex touring across monuments, museums and archaeological sites.'],['NILE','Nile Programmes','Connect Cairo stays with Luxor–Aswan sailings and shore arrangements.'],['AIR','Domestic Connections','Manage internal flights, airports, baggage, transfers and supplier handovers.'],['SEA','Red Sea Extensions','Add resorts, diving, leisure stays and long-distance movements.']],
      completeFeatures:true,
      features:[
        ['MO','End-to-End Mid Office','Connect sales, contracting, quotations, bookings, operations, finance and reporting.'],
        ['CRM','Sales & CRM','Track source markets, agents, enquiries, follow-ups, quotations and conversion.'],
        ['MKT','Business Market Performance','Analyse enquiries, sales, conversion and profitability by source market.',true],
        ['HOT','Multi-Market Hotel Contracting','Maintain hotel and resort rates by market, season, currency and policy.',true],
        ['OFR','Hotel Tactical Offers','Digitise early-booking, stay-pay, upgrade and promotional offers.'],
        ['NILE','Nile Cruise Product Setup','Configure vessels as products with sailing patterns, cabin categories, meal plans and supplier conditions.',true],
        ['PKG','Nile Cruise Package Templates','Build reusable cruise-inclusive programmes with pre/post hotels, transfers, guides and excursions.',true],
        ['CAB','Cabin & Occupancy Options','Represent cabin categories, occupancy, supplements and child policies within configured product options.'],
        ['DATE','Sailing Date Patterns','Maintain scheduled embarkation dates and route variants as dated product or package options.'],
        ['SHORE','Shore Services & Excursions','Add guides, entrances, transfers and excursions required around each sailing programme.'],
        ['FIT','FIT & GIT Quote Builder','Build detailed individual and group programmes with day-wise costing.',true],
        ['OPT','Multi-Option Quotations','Present alternative hotels, cruise options, routes and service combinations.'],
        ['MSG','Email & WhatsApp Quotations','Send professional quotations in minutes with complex calculations.'],
        ['AI','AI Itinerary Creation','Create professional itineraries faster while maintaining consistent destination information.'],
        ['PDF','Digital, Email & PDF Itineraries','Deliver branded and customised proposals across multiple formats.'],
        ['CITY','Multi-City Itinerary Builder','Connect Cairo, Alexandria, Luxor, Aswan, Abu Simbel and Red Sea destinations.',true],
        ['AIR','Domestic Flight Management','Include sectors, schedules, fares, baggage and supplier details.'],
        ['TRF','Airport & Station Transfers','Price and coordinate airports, hotels, stations, ports and cruise embarkation points.'],
        ['KM','Point-to-Point Mileage','Calculate routing distance and transport cost for land sectors.'],
        ['BUS','Coach & Vehicle Management','Maintain vehicle types, capacities, seasons, overtime and long-distance rates.'],
        ['GUIDE','Egyptologist & Guide Management','Control languages, qualifications, rates, assignments and allowances.',true],
        ['TKT','Monument & Entrance Fees','Maintain site fees, age bands, nationalities, time slots and booking conditions.',true],
        ['MEAL','Restaurants & Meal Management','Contract menus, group meals, dietary requirements and meal packages.'],
        ['SER','Group Series Programmes','Create fixed-date Egypt programmes for agent distribution and recurring departures.'],
        ['MICE','MICE & Incentive Operations','Coordinate venues, delegates, transport, dining, events and special access.'],
        ['QBK','Quick Booking','Convert confirmed FIT and group business into controlled travel files quickly.'],
        ['RES','Supplier Reservations & Vouchers','Manage requests, confirmations, supplier communication and service vouchers.'],
        ['ROOM','Rooming Lists & Manifests','Control guest, room, flight, cruise and movement information.'],
        ['OPS','Operations & Logistics','Coordinate arrivals, departures, guides, vehicles, sailing connections and daily services.'],
        ['EXP','Pre- & Post-Tour Expenses','Issue operational cash and reconcile guide, driver and tour expenses.'],
        ['INV','Proforma, Tax & Advance Invoices','Generate controlled commercial documents and payment schedules.'],
        ['AR','Receivable Tracking','Monitor collections, due dates, ageing and customer balances.'],
        ['AP','Supplier Payable Tracking','Manage hotel, cruise, transport, guide and attraction liabilities.'],
        ['P&L','File-Wise P&L & Monthly GP','Measure profitability by file, market, product and reporting period.',true],
        ['FX','Multi-Currency Management','Manage supplier and selling currencies with controlled exchange rates.'],
        ['MIS','Dashboards, Market Analysis & MIS','Turn commercial and operational data into management intelligence.'],
        ['450+','450+ Powerful Features','Scale the complete Egypt DMC operation through one connected platform.',true]
      ],
      notice:{title:'How DMC24 Handles Nile Cruises Without a Dedicated Cruise Module',text:'DMC24 does not currently include a standalone cruise inventory module. Instead, the Egypt configuration uses the existing contracting, product, package, quotation, reservation and operations workflows to manage Nile cruise programmes.',important:'This is a configured operational workaround using existing DMC24 capabilities. It is not presented as a dedicated cruise module.',steps:[['1','Configure the Product','Set up the vessel or supplier, route, sailing pattern, cabin options, meal plan and commercial conditions.'],['2','Create Programme Templates','Combine the cruise with Cairo hotels, domestic flights, transfers, guides, entrances and pre/post stays.'],['3','Quote & Reserve','Cost the complete itinerary, present options, record supplier confirmation and generate vouchers.'],['4','Operate & Reconcile','Coordinate embarkation, shore services and movements, then include confirmed costs in the final file P&L.']]},
      focusTitle:'Build Complete Egypt and Nile Programmes.',
      focusText:'Combine Cairo hotels, Nile cruise products, domestic flights, monuments, guides, transport, meals and Red Sea extensions into accurate and profitable programmes.',
      packages:[['CAI','Classic Cairo','Hotels, pyramids, museums, guides, entrances and transfers.'],['NILE','Cairo & Nile','Cairo stays combined with configured Luxor–Aswan cruise programmes.'],['TEM','Ancient Egypt','Luxor, Aswan, Abu Simbel and archaeological touring.'],['SEA','Red Sea Extensions','Hurghada, Sharm El Sheikh and resort combinations.'],['FAM','Family Egypt','Family rooms, age-based entrances and suitable experiences.'],['SER','Groups & Series','Fixed departures, coaches, guides, rooming and movement lists.'],['MICE','MICE & Incentives','Venues, delegates, transport, dining and special events.'],['REG','Regional Combinations','Connect Egypt with Jordan, the Gulf and other regional programmes.']],
      tax:'Applicable Taxes & Service Charges',taxText:'Configure applicable taxes, service charges and supplier levies according to the DMC’s commercial and accounting policies.',
      famous:[['Ancient Civilisation','Pyramids, temples, tombs, museums and extraordinary archaeological heritage.'],['The Nile','Cairo, Luxor and Aswan connected through river journeys and historic landscapes.'],['Culture & Cities','Cairo, Alexandria, markets, cuisine, faith, arts and living neighbourhoods.'],['Red Sea & Desert','Resorts, diving, beaches, desert experiences and leisure extensions.']],
      impact:['Respond faster to complex cultural and multi-city enquiries.','Build Nile cruise-inclusive programmes through a controlled workaround.','Cost domestic flights, transport, guides and entrances accurately.','Improve visibility across suppliers, confirmations and daily movements.','Measure profitability by file, market and programme.','Expand through optional B2B, B2C, Local Sales and Multi-DMC capabilities.']
    },
    southafrica:{
      label:'South Africa',hero:'img/destination-south-africa.webp',heroWidth:1536,heroHeight:1024,heroAlt:'Elephants and antelope with Table Mountain and the South African coastline in the background',
      headline:'One Connected Platform for South Africa DMCs.',
      intro:'Manage enquiries, hotel and lodge contracts, safari products, multi-city itineraries, quotations, bookings, domestic flights, transport, operations, VAT, finance and profitability through one connected platform.',
      caption:'South Africa journeys, connected from city to safari',captionSub:'Control every supplier, movement, cost and guest experience in one workflow.',
      pillars:[['🏨','Hotels, Lodges & Safari Products','Manage city hotels, safari lodges, private reserves, seasons, offers and policies.'],['🗺️','Multi-City & Regional Itineraries','Build detailed journeys across South Africa and neighbouring destinations.'],['🚌','Transport, Flights & Logistics','Coordinate vehicles, guides, domestic flights, guest movements and operational fulfilment.']],
      roleTitle:'The DMC Role in South Africa Tourism.',roleText:'South Africa DMCs connect international travel partners with hotels, safari lodges, private reserves, transport operators, airlines, guides, attractions, restaurants, activities and event venues.',
      roleCards:[['🧭','Diverse Destination Products','Combine cities, safaris, coastlines, wine regions and adventure experiences.'],['🚐','Complex Guest Movements','Coordinate long-distance routes, flights, vehicles, guides and supplier handovers.'],['🌍','International Source Markets','Apply market-specific rates, currencies, conditions and commercial rules.'],['🗺️','Regional Southern Africa Operations','Extend programmes across Botswana, Zimbabwe, Zambia, Namibia and beyond.']],
      completeFeatures:true,
      features:[
        ['MO','End-to-End Mid Office','Connect sales, contracting, quotations, bookings, operations, finance and reporting.'],
        ['👥','Employee Logins & Dashboards','Give every department role-based access and actionable dashboards.'],
        ['CRM','Enquiry & CRM Management','Track agents, customers, follow-ups, quotations and conversions.'],
        ['📊','Business Market Performance','Measure enquiries, sales, conversion and profitability by source market.',true],
        ['🏨','Multi-Market Hotel Contracting','Maintain market-specific hotel rates, seasons, currencies and policies.',true],
        ['🦁','Safari Lodge & Private Reserve Contracting','Digitise lodge, reserve, room, meal, activity and conservation fee contracts.',true],
        ['📅','Seasonal Rate Management','Control peak, shoulder, low-season and special-event pricing.'],
        ['🏷️','Tactical Hotel & Lodge Offers','Manage stay-pay, early-booking, upgrade and value-add promotions.'],
        ['＋','Offer Combination Rules','Define which promotions can be combined and protect commercial accuracy.'],
        ['FIT','FIT, GIT & Series Quote Builder','Build individual, group and fixed-series proposals with detailed costing.',true],
        ['🗺️','Multi-City Itinerary Builder','Connect cities, safari regions, coastal stays and regional extensions.',true],
        ['OPT','Multi-Option Quotations','Present alternative hotels, routes, room types and service combinations.'],
        ['✉️','Email & WhatsApp Quotations','Send professional quotations in minutes, even with complex calculations.'],
        ['AI','AI Itinerary Creation','Create professional itineraries faster with consistent destination content.'],
        ['PDF','Digital, Email & PDF Itineraries','Deliver branded and customised proposals across multiple formats.'],
        ['↔️','Point-to-Point Transfers','Price airport, hotel, lodge, attraction and inter-city transfer routes.'],
        ['KM','Point-to-Point Mileage Calculation','Calculate routing distance for accurate transport costing.',true],
        ['🚌','Private Vehicle & Coach Management','Maintain vehicle categories, capacities, seasons, disposal and route rates.'],
        ['4X4','Safari Vehicle Costing','Cost dedicated safari vehicles, game-drive hours and specialist operations.',true],
        ['🚗','Self-Drive Programme Management','Build rental, route, accommodation and activity programmes for self-drive guests.'],
        ['✈️','Domestic Flight Management','Include flight sectors, schedules, fares, baggage and supplier details.'],
        ['🗣️','Guide & Tour Director Management','Control languages, day rates, assignments, allowances and availability.'],
        ['🎟️','Attractions & Entrance Fees','Manage entrance rates, age bands, nationalities, seasons and booking rules.'],
        ['🦒','Game Drives & Safari Activities','Cost shared or private game drives and reserve activities.'],
        ['🍽️','Restaurant & Meal Management','Contract menus, group meals, dietary requirements and meal packages.'],
        ['MICE','MICE & Incentive Operations','Coordinate venues, delegates, transport, dining, events and production.'],
        ['📘','Group Series Brochure Programmes','Create fixed-date South Africa programmes for agent distribution.',true],
        ['⚡','Quick Booking Module','Convert FIT and group quotations into controlled travel files quickly.'],
        ['✓','Supplier Reservations & Vouchers','Manage confirmations, supplier communication and service vouchers.'],
        ['📋','Rooming Lists & Passenger Manifests','Control guest, room, flight and movement information.'],
        ['OPS','Operations & Logistics','Coordinate arrivals, departures, drivers, guides, vehicles and daily services.'],
        ['💼','Pre- and Post-Tour Expenses','Issue operational cash and reconcile driver and guide expenses.',true],
        ['%','VAT Calculation','Apply configured VAT rules and prevent inconsistent tax treatment.',true],
        ['🧾','Proforma, VAT & Advance Invoices','Generate clear commercial documents with automated tax calculations.'],
        ['AR','Receivable Tracking','Monitor due dates, collections, ageing and outstanding customer balances.'],
        ['AP','Supplier Payable Tracking','Manage supplier liabilities, schedules, approvals and outstanding amounts.'],
        ['P&L','File-Wise P&L & Monthly GP','Measure profitability by file, market, product and reporting period.',true],
        ['FX','Multi-Currency Management','Manage supplier and selling currencies with controlled exchange rates.'],
        ['MIS','Dashboards, Market Analysis & MIS','Turn operational and commercial data into management intelligence.'],
        ['450+','450+ Powerful Features','Scale the entire South Africa DMC operation on one connected platform.',true]
      ],
      focusTitle:'Build Complete South Africa and Regional Programmes.',
      focusText:'Combine hotels, safari lodges, private reserves, vehicles, domestic flights, guides, attractions and neighbouring destinations into profitable programmes.',
      packages:[['🦁','Classic South Africa','Cape Town, the Garden Route, Johannesburg and safari.'],['🏙️','Cape Town & Safari','City experiences paired with a lodge or private reserve.'],['🚗','Garden Route Programmes','Self-drive or guided journeys through coastal and scenic regions.'],['🚂','Luxury Rail & Safari','Premium rail journeys combined with private safari experiences.'],['👨‍👩‍👧','Family South Africa','Family stays, wildlife, beaches and age-appropriate activities.'],['MICE','MICE & Incentive Travel','Venues, delegates, transport, dining and special events.'],['🛣️','Self-Drive Journeys','Rental vehicles, routes, stays, activities and traveller documentation.'],['🌍','Southern Africa Combinations','Connect Botswana, Zimbabwe, Zambia, Namibia, Mozambique, Eswatini and Lesotho.']],
      tax:'VAT',taxText:'Configure VAT rules, inclusive or exclusive rates, effective dates and VAT-ready invoices across applicable services.',
      famous:[['Wildlife & Safari','Big Five reserves, private lodges and exceptional wildlife experiences.'],['Cities & Culture','Cape Town, Johannesburg, heritage, cuisine and creative neighbourhoods.'],['Coast, Wine & Scenic Routes','The Garden Route, winelands, beaches and dramatic landscapes.'],['Adventure & Diversity','Self-drive journeys, outdoor activities and highly varied regional experiences.']],
      impact:['Respond faster to complex multi-city and safari enquiries.','Cost mileage, vehicles, domestic flights and safari services accurately.','Improve visibility across reservations, suppliers and daily operations.','Apply VAT and financial controls consistently.','Measure profit by file, market and programme.','Expand through B2B, B2C, Local Sales and multi-DMC capabilities.']
    }
  };

  const d=markets[market];
  if(!d) return;
  const allFeatures=d.completeFeatures?d.features:d.features.concat(sharedFeatures);
  const featureCards=allFeatures.map((f,i)=>`<article class="${destinationClass('db-feature')} ${f[3]===true||(f[3]===undefined&&i%5===0)?'highlight':''}"><div class="${destinationClass('db-icon')}"${f[0]==='450+'?' style="font-size:12px"':''}>${f[0]}</div><h3>${f[1]}</h3><p>${f[2]}</p></article>`).join('');
  const roleCards=d.roleCards.map(f=>`<article class="${destinationClass('db-role-point')}"><div class="${destinationClass('db-icon')}">${f[0]}</div><h3>${f[1]}</h3><p>${f[2]}</p></article>`).join('');
  const packageCards=d.packages.map(f=>`<article class="${destinationClass('db-package')}"><div class="${destinationClass('db-icon')}">${f[0]}</div><h3>${f[1]}</h3><p>${f[2]}</p></article>`).join('');
  const famousCards=d.famous.map((f,i)=>`<article class="${destinationClass('db-famous')}" style="background-image:url('${d.hero}')"><div><h3>${f[0]}</h3><p>${f[1]}</p></div></article>`).join('');
  const impacts=d.impact.map((x,i)=>`<div class="db-impact"><b>${i+1}</b><p>${x}</p></div>`).join('');
  const pillars=d.pillars.map(f=>`<article><div class="${destinationClass('db-icon')}">${f[0]}</div><h2 class="heading--card-scale">${f[1]}</h2><p>${f[2]}</p></article>`).join('');
  const notice=d.notice?`<section class="db-notice-section"><div class="container"><div class="db-notice"><header class="section-head"><div class="kicker">Configured Workflow</div><h2>${d.notice.title}</h2><p class="lead">${d.notice.text}</p></header><div class="db-notice-grid">${d.notice.steps.map(s=>`<article><b>${s[0]}</b><h3>${s[1]}</h3><p>${s[2]}</p></article>`).join('')}</div><div class="db-honesty"><strong>Important:</strong> ${d.notice.important}</div></div></div></section>`:'';

  const sharedRateMarkets=new Set(['cambodia','vietnam','singapore','malaysia','thailand','bali','hongkong','egypt']);
  const plan=(code,name,description,monthly,yearly,heading,features,classes='',button='Request a Demo')=>`<article class="sl-plan ${classes}">${classes.includes('is-preferred')?'<div class="sl-preferred">Most Preferred</div>':''}<div class="sl-plan-top"><span class="sl-plan-code">${code}</span><h3>${name}</h3><p>${description}</p>${monthly?`<div class="sl-plan-price" data-monthly="$${monthly}" data-yearly="$${yearly}"><strong>$${monthly}</strong><small>/ month</small></div><div class="sl-plan-saving" aria-live="polite">Flexible monthly subscription</div>`:'<div class="sl-plan-price is-consult"><strong>Request a Consultation</strong></div><div class="sl-plan-saving">Configured to your operation</div>'}<div class="sl-setup-fee">One-time setup fee: ${({BIZ:'None',PRO:'USD 1,200','PRO PLUS':'USD 2,000',ENT:'USD 3,000'})[code]}</div><a class="btn ${classes.includes('is-preferred')?'btn-primary':classes.includes('sl-enterprise')?'btn-dark':'btn-outline'}" href="contact.html#demo">${button}</a></div><div class="sl-plan-includes"><h4>${heading}</h4><ul>${features.map(x=>`<li>${x}</li>`).join('')}</ul></div></article>`;
  const sharedEditions=sharedRateMarkets.has(market)?`<section class="sl-subscriptions" id="subscriptions"><div class="container"><div class="sl-plan-head"><div><div class="kicker">${d.label} Subscription Plans</div><h2>Choose the DMC24 Version That Fits Your Growth.</h2><p class="lead">Compare complete feature sets across four editions. All prices are in USD.</p></div><div class="sl-billing" role="group" aria-label="Choose billing period"><button class="is-active" type="button" data-billing="monthly" aria-pressed="true">Monthly</button><button type="button" data-billing="yearly" aria-pressed="false">Yearly <span>Save $600</span></button></div></div><div class="sl-plan-grid">
    ${plan('BIZ','Business',`Essential operational control for growing ${d.label} DMCs.`,'350','3,600','What’s included',['Customer management for B2B and direct business','Tax and statutory setup','FIT and group booking management','Booking amendments and cancellations','Basic reservations','Guest vouchers','Guest itineraries and welcome letters','Proforma invoices','Movement setup management','Transportation management','Pre-tour and post-tour expense management','Duty slips for drivers and guides','Booking dashboard','Booking, sales and logistics reports','Implementation and setup in 3 days','Onboarding meeting','Up to 5 users and single-branch operations','4 training sessions included','7 days of system-adoption support','Basic WhatsApp support','Shared AWS server, 30 GB with backup'])}
    ${plan('PRO','Professional','Advanced sales, supplier contracting and quotation management.','550','6,000','Everything in Business, plus',['Supplier management','Contracting for different markets and seasons','Lead management','CRM and follow-up management','Email and WhatsApp follow-up reminders','Business-market setup','FIT and group quotation builder','Quote history and version management','AI itinerary builder in English','Email, PDF and digital itinerary proposals','Enquiry and CRM dashboard','Advance reservation module','Implementation and setup in 3 days','Onboarding meeting','Up to 10 users and single-branch operations','8 training sessions included','15 days of system-adoption support','Basic WhatsApp support','CRM and follow-up reports','Basic business-market analysis','Shared AWS server, 50 GB with backup','Google Maps setup by client','Gemini itinerary API setup by client'],'is-preferred')}
    ${plan('PRO PLUS','Professional Plus','Financial control, multilingual output and multi-branch operations.','950','10,800','Everything in Professional, plus',['Multilingual itineraries in 4 languages','Employee roles and rights','Deposit and tax invoices','Accounts receivable management','Accounts payable management','Credit and debit notes','Outstanding management','Provisional and final P&amp;L','Monthly GP report','Shopping income module','Travel diary','Customer and supplier database migration support','Implementation and setup in 7 days','Up to 20 users and multi-branch operations','Onboarding meeting','12 training sessions included','30 days of system-adoption support','Advanced WhatsApp and Freshdesk support','Finance reports','Basic business-market analysis','Shared AWS server, 100 GB with backup','Google Maps setup by client','Gemini itinerary API setup by client'])}
    ${plan('ENT','Enterprise','Integrations, distribution and advanced management for complex DMCs.',null,null,'Everything in Professional Plus, plus',['Third-party API integrations','Finance-module integration from available options','Individual service booking for hotels, transfers, transport and activities','B2B booking-engine integration','Advanced business-market analysis','Payment-gateway integration','Management dashboard','Up to 30 users and multi-branch operations','Onboarding meeting','15 training sessions included','30 days of system-adoption support','Unlimited advanced WhatsApp and Freshdesk support','Dedicated virtual AWS server, 150 GB with backup','Google Maps setup by client','Gemini itinerary API setup by client'],'sl-enterprise','Talk to Our Team')}
  </div><p class="sl-price-footnote">Yearly subscriptions save USD 600 compared with twelve monthly payments. Third-party usage charges and client-managed API accounts may apply where stated.</p></div></section>`:`<section class="soft"><div class="container"><header class="section-head"><div class="kicker">${d.label} Editions</div><h2>Choose the DMC24 Version That Fits Your Operations.</h2></header><div class="pricing-grid"><article class="price-card"><h3>Business</h3><p>For growing ${d.label} DMCs.</p><div class="price">Essential</div><div class="price-note">Connected core operations</div><ul class="checks"><li>CRM and enquiries</li><li>Contracting and quotations</li><li>Bookings and operations</li><li>Core finance reports</li></ul><a class="btn btn-outline" href="request-demo.html">Request Pricing</a></article><article class="price-card featured"><div class="badge">Recommended</div><h3>Professional</h3><p>For established multi-market operators.</p><div class="price">Advanced</div><div class="price-note">Automation and profitability</div><ul class="checks"><li>Everything in Business</li><li>FIT, GIT and group series</li><li>Advanced operations</li><li>File P&amp;L and MIS</li></ul><a class="btn btn-primary" href="request-demo.html">Request Pricing</a></article><article class="price-card"><h3>Enterprise</h3><p>For high-volume and multi-company DMCs.</p><div class="price">Custom</div><div class="price-note">Configured to scope</div><ul class="checks"><li>Everything in Professional</li><li>B2B, B2C and Local Sales options</li><li>Multi-DMC and integrations</li><li>Enterprise onboarding</li></ul><a class="btn btn-dark" href="contact.html#demo">Talk to Sales</a></article></div></div></section>`;

  main.innerHTML=`
  <section class="${destinationClass('db-hero')} country-hero--command"><div class="container ${destinationClass('db-hero-grid')}"><div><div class="kicker">${d.label} Edition</div><h1>DMC Software for ${d.label}</h1><p class="lead">${d.intro}</p><div class="hero-actions"><a class="btn btn-primary" href="request-demo.html">Request a ${d.label} Demo →</a><a class="btn btn-outline" href="#market-features">Explore ${d.label} Features</a></div></div><figure class="${destinationClass('db-hero-image')}"><img src="${d.hero}" alt="${d.heroAlt}" ${d.heroWidth?`width="${d.heroWidth}" height="${d.heroHeight}"`:""} loading="eager" decoding="async"><figcaption class="${destinationClass('db-caption')}"><strong>${d.caption}</strong><span>${d.captionSub}</span></figcaption></figure></div></section>
  <section><div class="container"><div class="${destinationClass('db-strip')}">${pillars}</div></div></section>
  <section><div class="container ${destinationClass('db-role-grid')}"><div><div class="kicker">Industry Contribution</div><h2>${d.roleTitle}</h2><p class="lead">${d.roleText}</p><div class="${destinationClass('db-role-panel')}"><h3>Destination expertise needs connected operational control.</h3><p>DMC24 brings products, quotations, bookings, operations, tax, finance and reporting into one environment.</p></div></div><div class="db-role-points">${roleCards}</div></div></section>
  <section class="soft" id="market-features"><div class="container"><header class="section-head"><div class="kicker">${d.label} Market Capabilities</div><h2>Everything ${d.label} DMCs Need to Run the Business.</h2><p class="lead">Destination-specific capabilities combined with DMC24’s complete operational foundation.</p></header><div class="db-feature-grid">${featureCards}</div></div></section>
  ${notice}
  <section><div class="container"><div class="db-offers"><div class="kicker" style="color:#ffc47f">Destination Product Control</div><h2>${d.focusTitle}</h2><p class="lead">${d.focusText}</p><div class="db-offer-grid">${packageCards}</div></div></div></section>
  <section class="soft"><div class="container"><header class="section-head"><div class="kicker">Tax & Commercial Accuracy</div><h2>Manage ${d.tax} Throughout the Workflow.</h2><p class="lead">${d.taxText}</p></header><div class="db-tax-grid"><article class="${destinationClass('db-tax')}"><div class="${destinationClass('db-icon')}">%</div><h3>Configured Rules</h3><p>Apply tax according to product and transaction rules.</p></article><article class="${destinationClass('db-tax')}"><div class="${destinationClass('db-icon')}">↕️</div><h3>Inclusive & Exclusive</h3><p>Manage supplier rates in either commercial format.</p></article><article class="${destinationClass('db-tax')}"><div class="${destinationClass('db-icon')}">📅</div><h3>Effective Dates</h3><p>Protect historical bookings when rules change.</p></article><article class="${destinationClass('db-tax')}"><div class="${destinationClass('db-icon')}">🧾</div><h3>Tax-Ready Invoices</h3><p>Present taxable value, tax and total amounts clearly.</p></article></div><div class="db-tax-note">Tax rules can be configured according to prevailing local regulations and the DMC’s accounting policies.</div></div></section>
  <section><div class="container"><header class="section-head"><div class="kicker">Optional Extensions</div><h2>Expand Distribution and Destination Revenue.</h2><p class="lead">Use DMC24 Mid Office as the operational core and add the channels that fit your business.</p></header><div class="cards-3"><a class="card module-link-card" href="b2b.html"><div class="icon">B2B</div><h3>B2B Booking Platform</h3><p>Give approved agents digital access to ${d.label} products, packages and market rates.</p></a><a class="card module-link-card" href="b2c.html"><div class="icon">B2C</div><h3>B2C Booking Platform</h3><p>Sell destination programs and experiences through a branded direct channel.</p></a><a class="card module-link-card" href="local-sales.html"><div class="icon">POS</div><h3>Local Sales</h3><p>Enable authorised representatives to sell additional services after arrival.</p></a></div></div></section>
  ${sharedEditions}
  <section><div class="container"><header class="section-head"><div class="kicker">The Destination</div><h2>What Is ${d.label} Famous For?</h2></header><div class="db-famous-grid">${famousCards}</div></div></section>
  <section class="soft"><div class="container"><header class="section-head"><div class="kicker">Implementation Timeline</div><h2>Get Started in Days, Not Months.</h2></header><div class="db-timeline"><article><b>Day 1–2</b><h3>Go-Live Preparation</h3><p>Activation, users, currencies and core settings.</p></article><article><b>Day 3–7</b><h3>Training & Configuration</h3><p>Products, rates, taxes and operational workflows.</p></article><article><b>Ongoing</b><h3>Support & Optimisation</h3><p>Continuous assistance, upgrades and guidance.</p></article></div></div></section>
  <section><div class="container"><header class="section-head"><div class="kicker">Business Impact</div><h2>Empower Your ${d.label} DMC with DMC24.</h2></header><div class="db-impact-grid">${impacts}</div><div class="db-conclusion">DMC24 helps ${d.label} DMCs quote faster, coordinate complex destination services and improve the profitability of every booking.</div></div></section>${d.credit?`<div class="container image-attribution">${d.credit}</div>`:""}`;
})();

},
  "f4a0a88e162ee2fe":function(){
(()=>{const plans=[...document.querySelectorAll('.sl-plan')];const businessList=plans[0]?.querySelector('.sl-plan-includes ul');const professionalList=plans[1]?.querySelector('.sl-plan-includes ul');const supplierItem=[...(professionalList?.querySelectorAll('li')||[])].find(item=>item.textContent.trim()==='Supplier management');if(businessList&&supplierItem){const taxItem=[...businessList.querySelectorAll('li')].find(item=>item.textContent.trim()==='Tax and statutory setup');businessList.insertBefore(supplierItem,taxItem||businessList.children[1]||null)}const toggle=document.querySelector('.sl-billing');if(!toggle)return;const buttons=[...toggle.querySelectorAll('button[data-billing]')];const prices=[...document.querySelectorAll('.sl-plan-price[data-monthly]')];const setBilling=period=>{buttons.forEach(button=>{const active=button.dataset.billing===period;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active))});prices.forEach(price=>{price.querySelector('strong').textContent=price.dataset[period];price.querySelector('small').textContent=period==='monthly'?'/ month':'/ year';const note=price.nextElementSibling;if(note){note.textContent=period==='monthly'?'Flexible monthly subscription':'Save USD 600 with yearly billing';note.classList.toggle('is-saving',period==='yearly')}})};buttons.forEach(button=>button.addEventListener('click',()=>setBilling(button.dataset.billing)));})();

},
  "f8cb7c98de961688":function(){

(function(){
  const btn=document.getElementById('dmcMasterMenuBtn');
  const menu=document.getElementById('dmcMasterMobile');
  if(btn && menu){
    btn.addEventListener('click',()=>menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));
  }
  const filters=document.querySelectorAll('.destination-filter');
  const cards=document.querySelectorAll('#destinationGrid .destination-card');
  filters.forEach(filter=>filter.addEventListener('click',()=>{
    const selected=filter.dataset.filter;
    filters.forEach(item=>{
      const active=item===filter;
      item.classList.toggle('active',active);
      item.setAttribute('aria-pressed',String(active));
    });
    cards.forEach(card=>{card.hidden=selected!=='all'&&card.dataset.category!==selected;});
  }));
})();

},
};
modules['journal-browser']=function(){
 const input=document.getElementById('journal-search'),buttons=[...document.querySelectorAll('[data-journal-filter]')],cards=[...document.querySelectorAll('[data-journal-category]')],grid=document.querySelector('.journal-grid');let category='All Articles';
 function update(){const q=input.value.trim().toLowerCase(),overall=category==='All Articles';let count=0;cards.sort((a,b)=>{if(overall){const af=a.dataset.journalFeatured==='true',bf=b.dataset.journalFeatured==='true';if(af!==bf)return af?-1:1;}return Number(overall?a.dataset.journalOverall||0:a.dataset.journalRank||0)-Number(overall?b.dataset.journalOverall||0:b.dataset.journalRank||0);});for(const card of cards){const visible=(overall||card.dataset.journalCategory===category)&&card.textContent.toLowerCase().includes(q);card.hidden=!visible;card.classList.toggle('journal-card--featured',overall&&card.dataset.journalFeatured==='true');const label=card.querySelector('.journal-featured-label');if(label)label.hidden=!overall;grid.append(card);if(visible)count++;}document.getElementById('journal-count').textContent=count+' insight'+(count===1?'':'s');document.querySelector('.journal-empty').hidden=count!==0;for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.journalFilter===category));}
 buttons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.journalFilter;update()}));input.addEventListener('input',update);document.getElementById('journal-reset').addEventListener('click',()=>{category='All Articles';input.value='';update();input.focus()});update();
};
modules['gulf-subscription-plans']=function(){
const label=({dubai:'UAE',uae:'UAE',oman:'Oman','saudi-arabia':'Saudi Arabia'})[document.body.dataset.page];if(!label)return;
const old=document.querySelector('#subscriptions')||document.querySelector('.pricing-grid')?.closest('section');if(!old)return;
old.outerHTML="<section class=\"sl-subscriptions\" id=\"subscriptions\"><div class=\"container\"><div class=\"sl-plan-head\"><div><div class=\"kicker\">__MARKET__ Subscription Plans</div><h2>Choose the DMC24 Version That Fits Your Growth.</h2><p class=\"lead\">Compare complete feature sets across four editions. All prices are in USD.</p></div><div class=\"sl-billing\" role=\"group\" aria-label=\"Choose billing period\"><button class=\"is-active\" type=\"button\" data-billing=\"monthly\" aria-pressed=\"true\">Monthly</button><button type=\"button\" data-billing=\"yearly\" aria-pressed=\"false\">Yearly <span>Save $600</span></button></div></div><div class=\"sl-plan-grid\">\n<article class=\"sl-plan\"><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">BIZ</span><h3>Business</h3><p>Essential operational control for growing __MARKET__ DMCs.</p><div class=\"sl-plan-price\" data-monthly=\"$350\" data-yearly=\"$3,600\"><strong>$350</strong><small>/ month</small></div><div class=\"sl-plan-saving\" aria-live=\"polite\">Flexible monthly subscription</div><div class=\"sl-setup-fee\">One-time setup fee: None</div><a class=\"btn btn-outline\" href=\"contact.html#demo\">Request a Demo</a></div><div class=\"sl-plan-includes\"><h4>What’s included</h4><ul><li>Customer management for B2B and direct business</li><li>Tax and statutory setup</li><li>FIT and group booking management</li><li>Booking amendments and cancellations</li><li>Basic reservations</li><li>Guest vouchers</li><li>Guest itineraries and welcome letters</li><li>Proforma invoices</li><li>Movement setup management</li><li>Transportation management</li><li>SIC Transfer and SIC Tours Management</li><li>Clubbing of SIC Services for Safaris and Parks</li><li>Duty slips for drivers and guides</li><li>Booking dashboard</li><li>Booking, sales and logistics reports</li><li>Implementation and setup in 3 days</li><li>Onboarding meeting</li><li>Up to 5 users and single-branch operations</li><li>4 training sessions included</li><li>7 days of system-adoption support</li><li>Basic WhatsApp support</li><li>Shared AWS server, 30 GB with backup</li></ul></div></article>\n<article class=\"sl-plan is-preferred\"><div class=\"sl-preferred\">Most Preferred</div><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">PRO</span><h3>Professional</h3><p>Advanced sales, supplier contracting and quotation management.</p><div class=\"sl-plan-price\" data-monthly=\"$550\" data-yearly=\"$6,000\"><strong>$550</strong><small>/ month</small></div><div class=\"sl-plan-saving\" aria-live=\"polite\">Flexible monthly subscription</div><div class=\"sl-setup-fee\">One-time setup fee: USD 1,200</div><a class=\"btn btn-primary\" href=\"contact.html#demo\">Request a Demo</a></div><div class=\"sl-plan-includes\"><h4>Everything in Business, plus</h4><ul><li>Supplier management</li><li>Contracting for different markets and seasons</li><li>Lead management</li><li>CRM and follow-up management</li><li>Email and WhatsApp follow-up reminders</li><li>Business-market setup</li><li>FIT and group quotation builder</li><li>Quote history and version management</li><li>AI itinerary builder in English</li><li>Email, PDF and digital itinerary proposals</li><li>Enquiry and CRM dashboard</li><li>Advance reservation module</li><li>Implementation and setup in 3 days</li><li>Onboarding meeting</li><li>Up to 10 users and single-branch operations</li><li>8 training sessions included</li><li>15 days of system-adoption support</li><li>Basic WhatsApp support</li><li>CRM and follow-up reports</li><li>Basic business-market analysis</li><li>Shared AWS server, 50 GB with backup</li><li>Google Maps setup by client</li><li>Gemini itinerary API setup by client</li></ul></div></article>\n<article class=\"sl-plan\"><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">PRO PLUS</span><h3>Professional Plus</h3><p>Financial control, multilingual output and multi-branch operations.</p><div class=\"sl-plan-price\" data-monthly=\"$950\" data-yearly=\"$10,800\"><strong>$950</strong><small>/ month</small></div><div class=\"sl-plan-saving\" aria-live=\"polite\">Flexible monthly subscription</div><div class=\"sl-setup-fee\">One-time setup fee: USD 2,000</div><a class=\"btn btn-outline\" href=\"contact.html#demo\">Request a Demo</a></div><div class=\"sl-plan-includes\"><h4>Everything in Professional, plus</h4><ul><li>Multilingual itineraries in 4 languages</li><li>Individual service booking for hotels, transfers, transport and activities</li><li>Employee roles and rights</li><li>Deposit and tax invoices</li><li>Accounts receivable management</li><li>Accounts payable management</li><li>Credit and debit notes</li><li>Outstanding management</li><li>Provisional and final P&amp;L</li><li>Monthly GP report</li><li>Shopping income module</li><li>Travel diary</li><li>Customer and supplier database migration support</li><li>Implementation and setup in 7 days</li><li>Up to 20 users and multi-branch operations</li><li>Onboarding meeting</li><li>12 training sessions included</li><li>30 days of system-adoption support</li><li>Advanced WhatsApp and Freshdesk support</li><li>Finance reports</li><li>Basic business-market analysis</li><li>Shared AWS server, 100 GB with backup</li><li>Google Maps setup by client</li><li>Gemini itinerary API setup by client</li></ul></div></article>\n<article class=\"sl-plan sl-enterprise\"><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">ENT</span><h3>Enterprise</h3><p>Integrations, distribution and advanced management for complex DMCs.</p><div class=\"sl-plan-price is-consult\"><strong>Request a Consultation</strong></div><div class=\"sl-plan-saving\">Configured to your operation</div><div class=\"sl-setup-fee\">One-time setup fee: USD 3,000</div><a class=\"btn btn-dark\" href=\"contact.html#demo\">Talk to Our Team</a></div><div class=\"sl-plan-includes\"><h4>Everything in Professional Plus, plus</h4><ul><li>Third-party API integrations</li><li>Finance-module integration from available options</li><li>B2B booking-engine integration</li><li>Advanced business-market analysis</li><li>Payment-gateway integration</li><li>Management dashboard</li><li>Up to 30 users and multi-branch operations</li><li>Onboarding meeting</li><li>15 training sessions included</li><li>30 days of system-adoption support</li><li>Unlimited advanced WhatsApp and Freshdesk support</li><li>Dedicated virtual AWS server, 150 GB with backup</li><li>Google Maps setup by client</li><li>Gemini itinerary API setup by client</li></ul></div></article>\n</div><p class=\"sl-price-footnote\">Yearly subscriptions save USD 600 compared with twelve monthly payments. Third-party usage charges and client-managed API accounts may apply where stated.</p></div></section>".replaceAll('__MARKET__',label);
};
modules['common-destination-pricing']=function(){
 const rates={Business:['$350','$3,600','None'],Professional:['$550','$6,000','USD 1,200'],'Professional Plus':['$950','$10,800','USD 2,000'],Enterprise:[null,null,'USD 3,000']};
 const cards=[...document.querySelectorAll('.sl-plan,.price-card')].filter(c=>rates[c.querySelector('h3')?.textContent.trim()]);if(!cards.length)return;
 for(const card of cards){const name=card.querySelector('h3').textContent.trim(),r=rates[name];let price=card.querySelector('.sl-plan-price,.price');price.className='sl-plan-price'+(r[0]?'':' is-consult');if(r[0]){price.dataset.monthly=r[0];price.dataset.yearly=r[1];price.innerHTML='<strong>'+r[0]+'</strong><small>/ month</small>'}else{price.removeAttribute('data-monthly');price.removeAttribute('data-yearly');price.innerHTML='<strong>Request a Consultation</strong>'}let note=card.querySelector('.sl-plan-saving,.price-note');if(!note){note=document.createElement('div');price.after(note)}note.className='sl-plan-saving';note.textContent=r[0]?'Flexible monthly subscription':'Configured to your operation';let setup=card.querySelector('.sl-setup-fee');if(!setup){setup=document.createElement('div');setup.className='sl-setup-fee';note.after(setup)}setup.textContent='One-time setup fee: '+r[2];}
 const section=cards[0].closest('section');let toggle=section.querySelector('.sl-billing');const toggleHtml='<div class="sl-billing" role="group" aria-label="Choose billing period"><button class="is-active" type="button" data-billing="monthly" aria-pressed="true">Monthly</button><button type="button" data-billing="yearly" aria-pressed="false">Yearly <span>Save $600</span></button></div>';
 if(toggle){toggle.outerHTML=toggleHtml}else{const grid=section.querySelector('.sl-plan-grid,.pricing-grid');grid.insertAdjacentHTML('beforebegin',toggleHtml)}toggle=section.querySelector('.sl-billing');
 // Keep every destination billing control in the shared responsive heading row.
 let planHead=section.querySelector('.sl-plan-head');
 if(!planHead){const heading=section.querySelector('.section-head');if(heading){planHead=document.createElement('div');planHead.className='sl-plan-head';heading.before(planHead);planHead.append(heading)}}
 if(planHead)planHead.append(toggle);
 toggle.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{const period=button.dataset.billing;toggle.querySelectorAll('button').forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button))});cards.forEach(c=>{const p=c.querySelector('.sl-plan-price[data-monthly]');if(!p)return;p.querySelector('strong').textContent=p.dataset[period];p.querySelector('small').textContent=period==='monthly'?'/ month':'/ year';c.querySelector('.sl-plan-saving').textContent=period==='monthly'?'Flexible monthly subscription':'Save USD 600 with yearly billing'})}));
}
;
modules['south-africa-plans']=function(){const current=document.querySelector('#subscriptions')||document.querySelector('.pricing-grid')?.closest('section');if(current)current.outerHTML="<section class=\"sl-subscriptions\" id=\"subscriptions\"><div class=\"container\"><div class=\"sl-plan-head\"><div><div class=\"kicker\">South Africa Plans</div><h2>Choose the DMC24 Version That Fits Your Growth.</h2><p class=\"lead\">Compare the four editions. Final pricing and user limits can be configured for your South Africa commercial model.</p></div><div class=\"sl-billing\" role=\"group\" aria-label=\"Choose billing period\"><button class=\"is-active\" type=\"button\" data-billing=\"monthly\" aria-pressed=\"true\">Monthly</button><button type=\"button\" data-billing=\"yearly\" aria-pressed=\"false\">Yearly <span>Save $600</span></button></div></div><div class=\"sl-plan-grid\">\n<article class=\"sl-plan\"><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">BIZ</span><h3>Business</h3><p>Essential operational control for growing South Africa DMCs.</p><div class=\"sl-plan-price\" data-monthly=\"$350\" data-yearly=\"$3,600\"><strong>$350</strong><small>/ month</small></div><div class=\"sl-plan-saving\" aria-live=\"polite\">Flexible monthly subscription</div><div class=\"sl-setup-fee\">One-time setup fee: None</div><a class=\"btn btn-outline\" href=\"contact.html#demo\">Request a Demo</a></div><div class=\"sl-plan-includes\"><h4>What’s included</h4><ul><li>Customer management for B2B and direct business</li><li>Supplier management</li><li>Tax and statutory setup</li><li>FIT and group booking management</li><li>Booking amendments and cancellations</li><li>Basic reservations</li><li>Guest vouchers</li><li>Guest itineraries and welcome letters</li><li>Proforma invoices</li><li>Movement setup management</li><li>Transportation management</li><li>U-Turn Management</li><li>Imprest Management with Cash Handover</li><li>Language Guide Selection</li><li>Park Fee Forecast Management</li><li>Duty slips for drivers and guides</li><li>Booking dashboard</li><li>Booking, sales and logistics reports</li><li>Implementation and setup in 3 days</li><li>Onboarding meeting</li><li>Up to 5 users and single-branch operations</li><li>4 training sessions included</li><li>7 days of system-adoption support</li><li>Basic WhatsApp support</li><li>Shared AWS server, 30 GB with backup</li></ul></div></article>\n<article class=\"sl-plan is-preferred\"><div class=\"sl-preferred\">Most Preferred</div><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">PRO</span><h3>Professional</h3><p>Advanced sales, supplier contracting and quotation management.</p><div class=\"sl-plan-price\" data-monthly=\"$550\" data-yearly=\"$6,000\"><strong>$550</strong><small>/ month</small></div><div class=\"sl-plan-saving\" aria-live=\"polite\">Flexible monthly subscription</div><div class=\"sl-setup-fee\">One-time setup fee: USD 1,200</div><a class=\"btn btn-primary\" href=\"contact.html#demo\">Request a Demo</a></div><div class=\"sl-plan-includes\"><h4>Everything in Business, plus</h4><ul><li>Contracting for different markets and seasons</li><li>Direct Offers and Circuit Offers</li><li>Lead management</li><li>CRM and follow-up management</li><li>Email and WhatsApp follow-up reminders</li><li>Business-market setup</li><li>FIT and group quotation builder</li><li>Multi-Nationality Quote Builder</li><li>Quotes for Charter Packages</li><li>Quote history and version management</li><li>AI itinerary builder in English</li><li>Email, PDF and digital itinerary proposals</li><li>Enquiry and CRM dashboard</li><li>Advance reservation module</li><li>Implementation and setup in 3 days</li><li>Onboarding meeting</li><li>Up to 10 users and single-branch operations</li><li>8 training sessions included</li><li>15 days of system-adoption support</li><li>Basic WhatsApp support</li><li>CRM and follow-up reports</li><li>Basic business-market analysis</li><li>Shared AWS server, 50 GB with backup</li><li>Google Maps setup by client</li><li>Gemini itinerary API setup by client</li></ul></div></article>\n<article class=\"sl-plan\"><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">PRO PLUS</span><h3>Professional Plus</h3><p>Financial control, multilingual output and multi-branch operations.</p><div class=\"sl-plan-price\" data-monthly=\"$950\" data-yearly=\"$10,800\"><strong>$950</strong><small>/ month</small></div><div class=\"sl-plan-saving\" aria-live=\"polite\">Flexible monthly subscription</div><div class=\"sl-setup-fee\">One-time setup fee: USD 2,000</div><a class=\"btn btn-outline\" href=\"contact.html#demo\">Request a Demo</a></div><div class=\"sl-plan-includes\"><h4>Everything in Professional, plus</h4><ul><li>Multilingual itineraries in 4 languages</li><li>Back-to-Back Brochure Product Management Module (Additional Cost)</li><li>Employee roles and rights</li><li>Deposit and tax invoices</li><li>Accounts receivable management</li><li>Manage Vatable and Non-Vatable Suppliers</li><li>Manage Withholding Taxes for Suppliers</li><li>Accounts payable management</li><li>Credit and debit notes</li><li>Outstanding management</li><li>Provisional and final P&amp;L</li><li>Monthly GP report</li><li>Travel diary</li><li>Customer and supplier database migration support</li><li>Implementation and setup in 7 days</li><li>Up to 20 users and multi-branch operations</li><li>Onboarding meeting</li><li>12 training sessions included</li><li>30 days of system-adoption support</li><li>Advanced WhatsApp and Freshdesk support</li><li>Finance reports</li><li>Basic business-market analysis</li><li>Shared AWS server, 100 GB with backup</li><li>Google Maps setup by client</li><li>Gemini itinerary API setup by client</li></ul></div></article>\n<article class=\"sl-plan sl-enterprise\"><div class=\"sl-plan-top\"><span class=\"sl-plan-code\">ENT</span><h3>Enterprise</h3><p>Integrations, distribution and advanced management for complex DMCs.</p><div class=\"sl-plan-price is-consult\"><strong>Request a Consultation</strong></div><div class=\"sl-plan-saving\">Configured to your operation</div><div class=\"sl-setup-fee\">One-time setup fee: USD 3,000</div><a class=\"btn btn-dark\" href=\"contact.html#demo\">Talk to Our Team</a></div><div class=\"sl-plan-includes\"><h4>Everything in Professional Plus, plus</h4><ul><li>Back-to-Back Brochure Product Management Module</li><li>Third-party API integrations</li><li>Finance-module integration from available options</li><li>Individual service booking for hotels, transfers, transport and activities</li><li>B2B booking-engine integration</li><li>Advanced business-market analysis</li><li>Payment-gateway integration</li><li>Management dashboard</li><li>Up to 30 users and multi-branch operations</li><li>Onboarding meeting</li><li>15 training sessions included</li><li>30 days of system-adoption support</li><li>Unlimited advanced WhatsApp and Freshdesk support</li><li>Dedicated virtual AWS server, 150 GB with backup</li><li>Google Maps setup by client</li><li>Gemini itinerary API setup by client</li></ul></div></article>\n</div></div></section>";};

function renderPlanVisibility(value){
 if(!Array.isArray(value.planVisibility))return;
 const root=document.querySelector('main #subscriptions');if(!root)return;
 const names=['Business','Professional','Professional Plus','Enterprise'];
 const cards=[...root.querySelectorAll('.sl-plan')];for(const card of cards){const i=names.indexOf(card.querySelector('h3')?.textContent.trim());if(i>=0){card.hidden=!value.planVisibility[i];const noPrice=value.setupFees?.[i]?.priceVisible===false;card.classList.toggle('sl-plan--price-hidden',noPrice);if(noPrice){card.classList.remove('sl-plan--over-limit');const a=card.querySelector('.sl-plan-top a');if(a?.dataset.originalHref){a.href=a.dataset.originalHref;a.removeAttribute('aria-disabled');a.removeAttribute('tabindex');}}}}
 const shown=cards.filter(c=>!c.hidden).length;root.querySelectorAll('.sl-plan-grid').forEach(g=>g.dataset.visiblePlans=shown);
 const recurring=value.plans.some(p=>p.enabled&&p.priceVisible!==false);root.querySelectorAll('.user-price-control,.sl-billing').forEach(c=>c.hidden=!recurring);
 let empty=root.querySelector('.plan-visibility-empty');if(!shown&&!empty){empty=document.createElement('p');empty.className='plan-visibility-empty';empty.setAttribute('role','status');empty.textContent='Please contact us to discuss the plans available for your destination.';root.querySelector('.sl-plan-grid').after(empty);}if(empty)empty.hidden=!!shown;
 const anyPrices=value.setupFees?.some(p=>p.enabled&&p.priceVisible!==false);root.querySelectorAll('.sl-price-footnote').forEach(n=>n.hidden=!anyPrices);
 if(!anyPrices){const lead=root.querySelector('.sl-plan-head .lead');if(lead)lead.textContent='Compare the available DMC24 editions for '+value.name+'. Contact us for pricing.';}
 else if(value.setupFees?.some(p=>p.visible===false)){const lead=root.querySelector('.sl-plan-head .lead');if(lead)lead.textContent='Compare the available DMC24 editions for '+value.name+'. All prices are in USD.';}
}
function renderDestinationSetupFees(fees){
 if(!Array.isArray(fees))return;
 const names=['Business','Professional','Professional Plus','Enterprise'];
 const usd=n=>'USD '+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
 for(const card of document.querySelectorAll('main .sl-plan')){
  const i=names.indexOf(card.querySelector('h3')?.textContent.trim()),fee=fees[i];if(!fee?.enabled||fee.priceVisible===false)continue;
  let line=card.querySelector('.sl-setup-fee');if(!line){line=document.createElement('div');line.className='sl-setup-fee';card.querySelector('.sl-plan-saving')?.after(line);}
  line.replaceChildren(document.createTextNode('One-time setup fee: '));
  if(fee.offerActive){const original=document.createElement('del');original.className='setup-original';original.textContent=usd(fee.fee);line.append(original,document.createTextNode(' '));}
  const amount=document.createElement('strong');amount.textContent=fee.effectiveFee===0?'No setup fee':usd(fee.effectiveFee);line.append(amount);
  if(fee.offerActive){const note=document.createElement('small');note.className='setup-offer-note';note.textContent=fee.discount+'% setup discount through '+fee.to+' · Save '+usd(fee.saving);line.append(note);}
 }
}
function unavailableSetupFees(){if(!document)return;document.querySelectorAll('main .sl-setup-fee').forEach(el=>el.textContent='Setup fee: please contact us to confirm.');}
modules['live-destination-pricing']=function(){
 const slug=document.body.dataset.page==='uae'?'dubai':document.body.dataset.page;
 let pricing=null;
 const labels=['Business','Professional','Professional Plus'];
 const money=n=>'$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
 function apply(){if(!pricing)return;const toggle=document.querySelector('main .sl-billing');const period=toggle?.querySelector('[aria-pressed="true"]')?.dataset.billing||'monthly';const cards=[...document.querySelectorAll('main .sl-plan')];
  for(const card of cards){const i=labels.indexOf(card.querySelector('h3')?.textContent.trim());if(i<0)continue;const p=pricing[i];if(!p?.enabled||p.priceVisible===false)continue;
   const price=card.querySelector('.sl-plan-price');price.dataset.monthly=money(p.effectiveMonthly);price.dataset.yearly=money(p.effectiveYearly);price.querySelector('strong').textContent=price.dataset[period];price.querySelector('small').textContent=period==='monthly'?'/ month':'/ year';
   let original=card.querySelector('.plan-original-price');if(!original){original=document.createElement('div');original.className='plan-original-price';price.before(original)}original.textContent=p.offerActive?'Standard price '+money(period==='monthly'?p.monthly:p.yearly)+' · '+p.discount+'% off through '+p.to:'';original.hidden=!p.offerActive;
   const saving=card.querySelector('.sl-plan-saving');saving.textContent=period==='yearly'?(p.saving>0?'Save '+money(p.saving)+' compared with 12 monthly payments':'Annual subscription'):'Flexible monthly subscription';
   const userLine=[...card.querySelectorAll('li')].find(li=>/(?:Up to|Minimum)\s+\d+\s+users|\d+ users included/i.test(li.textContent));if(userLine)userLine.textContent=userLine.textContent.replace(/(?:Up to|Minimum)\s+\d+\s+users/i,'Minimum '+p.users+' users');
   let extra=card.querySelector('.plan-additional-user');if(!extra){extra=document.createElement('div');extra.className='plan-additional-user';saving.after(extra)}const amount=period==='monthly'?p.extra:p.extraYearly;extra.textContent=amount===''?'':'Additional user: '+money(amount)+' / '+(period==='monthly'?'month':'year');extra.hidden=amount==='';
  }
  const badge=toggle?.querySelector('[data-billing="yearly"] span');if(badge)badge.textContent='Annual billing';
  document.querySelectorAll('main .sl-price-footnote').forEach(n=>{if(n.textContent.includes('Yearly subscriptions save'))n.textContent=n.textContent.replace(/Yearly subscriptions save[^.]+\./,'See each plan for its annual saving.');});
 }
 async function refresh(){try{const res=await fetch('/api/pricing/'+slug,{cache:'no-store'});if(!res.ok)throw Error('unavailable');const value=await res.json();pricing=value.plans;renderPlanVisibility(value);renderDestinationSetupFees(value.setupFees);apply();document.querySelector('.plan-pricing-error')?.remove();}catch{if(!pricing){const section=document.querySelector('main .sl-subscriptions');if(section&&!section.querySelector('.plan-pricing-error')){const note=document.createElement('p');note.className='plan-pricing-error';note.setAttribute('role','status');note.textContent='Current pricing is temporarily unavailable. Please contact us to confirm prices.';section.querySelector('.sl-plan-head')?.after(note);}document.querySelectorAll('main .sl-plan-price[data-monthly]').forEach(p=>{p.querySelector('strong').textContent='Please contact us';p.querySelector('small').textContent='';});}}}
 document.querySelector('main .sl-billing')?.addEventListener('click',()=>queueMicrotask(apply));refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
};

modules['plan-management']=function(){
function decorate(){if(!document)return;document.querySelectorAll('*').forEach(el=>{el.classList.add('pm-element','pm-'+el.tagName.toLowerCase())})}decorate();new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});

const labels=['Business','Professional','Professional Plus'];
const setupLabels=[...labels,'Enterprise'];
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let data={},current='Kenya',countries=[],state={},busy=false;
const $=s=>document.querySelector(s),money=n=>new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));$('#date').value=today();
function nav(){const list=countries.filter(c=>c.name.toLowerCase().includes($('#search').value.toLowerCase()));$('#count').textContent=countries.length;$('#countries').innerHTML=list.map(c=>`<div class="pm-country-row"><input type="checkbox" data-visible="${c.slug}" aria-label="Show ${esc(c.name)} on website" ${c.visible?'checked':''} ${busy?'disabled':''}><button data-country="${esc(c.name)}" class="${c.name===current?'pm-active':''}" ${busy?'disabled':''}>${esc(c.name)}${c.visible?'':' <small>Hidden</small>'}</button></div>`).join('')||'<p>No destinations found.</p>';$('#countries').querySelectorAll('button').forEach(b=>b.onclick=()=>loadCountry(b.dataset.country));$('#countries').querySelectorAll('[data-visible]').forEach(input=>input.onchange=async()=>{const c=countries.find(c=>c.slug===input.dataset.visible);try{lock(true);$('#visibility-message').textContent='Saving '+c.name+' visibility…';const r=await api(c.slug+'/visibility',{visible:input.checked,revision:c.visibilityRevision});c.visible=r.visible;c.visibilityRevision=r.revision;$('#visibility-message').textContent=$('#message').textContent=c.name+(c.visible?' is now shown on the website.':' is now hidden across the website. Its settings are preserved.');}catch(e){$('#visibility-message').textContent=$('#message').textContent=e.message;}finally{lock(false);nav();}});}

function field(p,i,key,label,type='number'){return `<label>${label}<input data-i="${i}" data-key="${key}" type="${type}" ${type==='number'?`min="${(key==='users'||key==='maxUsers')?1:0}" step="${(key==='users'||key==='maxUsers')?'1':'0.01'}" ${key==='discount'?'max="100"':''}`:''} value="${esc(p[key])}" ${(key==='extra'||key==='extraYearly')?'placeholder="Not configured"':''}></label>`}
function render(){nav();$('#name').textContent=current;$('#plans').innerHTML=data[current].map((p,i)=>`<article class="pm-plan"><div class="pm-planhead"><h2>${labels[i]}</h2><p>${['Essential operations','Sales, contracts & quotations','Finance & multi-branch control'][i]}</p></div><div class="pm-fields"><label class="pm-full"><input data-i="${i}" data-key="enabled" type="checkbox" ${p.enabled?'checked':''} disabled>Included in the feature matrix for ${esc(current)}</label>${field(p,i,'users','Included users')}${field(p,i,'maxUsers','Maximum users')}${field(p,i,'extra','Additional user · Monthly plan / month · USD')}${field(p,i,'extraYearly','Additional user · Yearly plan / year · USD')}${field(p,i,'monthly','Monthly plan · USD')}${field(p,i,'yearly','Yearly plan · USD')}<div class="pm-saving" id="saving${i}"></div><div class="pm-offer"><b>Plan offer</b><span class="pm-status">Percentage off monthly and yearly subscriptions</span></div>${field(p,i,'discount','Discount · %')}<div></div>${field(p,i,'from','Valid from','date')}${field(p,i,'to','Valid through','date')}</div></article>`).join('');$('#plans').querySelectorAll('input').forEach(el=>el.oninput=()=>{const p=data[current][el.dataset.i],k=el.dataset.key;p[k]=el.type==='checkbox'?el.checked:el.type==='number'?(el.value===''?'':Number(el.value)):el.value;state[current].dirty=true;$('#publish').disabled=true;$('#bulk-open').disabled=true;$('#message').textContent='Unsaved changes — Save Draft before publishing.';preview()});renderSetup();renderVisibility();preview()}
function renderVisibility(){
 $('#plan-visibility').innerHTML=state[current].setupFees.map((p,i)=>`<div class="pm-visibility-card"><strong>${setupLabels[i]}</strong><label><input type="checkbox" data-plan-visible="${i}" ${p.enabled&&p.visible!==false?'checked':''} ${!p.enabled?'disabled':''}> Show variant</label><label><input type="checkbox" role="switch" data-plan-price="${i}" ${p.priceVisible!==false?'checked':''} ${!p.enabled?'disabled':''}> Show pricing <span data-price-state="${i}">${p.priceVisible!==false?'ON':'OFF'}</span></label>${!p.enabled?'<small>Not offered in this destination</small>':''}</div>`).join('');
 $('#plan-visibility').querySelectorAll('input').forEach(el=>el.onchange=()=>{const isPrice=el.hasAttribute('data-plan-price'),i=isPrice?el.dataset.planPrice:el.dataset.planVisible;state[current].setupFees[i][isPrice?'priceVisible':'visible']=el.checked;if(isPrice)$('#plan-visibility [data-price-state="'+i+'"]').textContent=el.checked?'ON':'OFF';state[current].dirty=true;$('#publish').disabled=true;$('#bulk-open').disabled=true;$('#message').textContent='Unsaved display settings — Save Draft, then Publish Prices.';preview();});
}
function valid(p){return Number.isInteger(p.users)&&p.users>=1&&Number.isInteger(p.maxUsers)&&p.maxUsers>=p.users&&p.monthly!==''&&p.yearly!==''&&p.monthly>=0&&p.yearly>=0&&(p.extra===''||p.extra>=0)&&(p.extraYearly===''||p.extraYearly>=0)&&p.discount>=0&&p.discount<=100&&(!p.discount||(p.from&&p.to&&p.from<=p.to))}
function preview(){const day=$('#date').value||today();$('#asof').textContent=day+' · India time';$('#rows').innerHTML=data[current].map((p,i)=>{const s=p.monthly*12-p.yearly;$('#saving'+i).textContent=`Yearly saving: USD ${money(s)}${p.monthly>0?' · '+(s/(p.monthly*12)*100).toFixed(1)+'%':''}${s<0?' — yearly exceeds 12 monthly payments':''}`;const ok=valid(p),active=ok&&p.discount>0&&day>=p.from&&day<=p.to;const status=!ok?'Complete valid prices and offer dates':!p.discount?'No offer':day<p.from?'Scheduled':day>p.to?'Expired · original price':`Active · ${p.discount}% off`;return `<tr><td><strong>${labels[i]}</strong>${!p.enabled?'<span class="pm-status">Not offered</span>':state[current].setupFees[i].visible===false?'<span class="pm-status">Hidden on website</span>':''}</td><td>${p.enabled&&ok?`${active?'<del>'+money(p.monthly)+'</del><br>':''}${money(p.monthly*(active?1-p.discount/100:1))}`:'—'}</td><td>${p.enabled&&ok?`${active?'<del>'+money(p.yearly)+'</del><br>':''}${money(p.yearly*(active?1-p.discount/100:1))}`:'—'}</td><td>${p.enabled&&p.extra!==''?money(p.extra):'Not configured'}</td><td>${p.enabled&&p.extraYearly!==''?money(p.extraYearly):'Not configured'}</td><td>${p.users||'—'} included / ${p.maxUsers} maximum</td><td>${p.enabled?status:'Disabled'}</td></tr>`}).join('');previewSetup(day)}

function validSetup(p){return typeof p.fee==='number'&&Number.isFinite(p.fee)&&p.fee>=0&&p.fee<=10000000&&Math.abs(p.fee*100-Math.round(p.fee*100))<0.00001&&typeof p.discount==='number'&&p.discount>=0&&p.discount<=100&&(!p.discount||(p.from&&p.to&&p.from<=p.to));}
function setupField(p,i,key,label,type='number'){return `<label>${label}<input data-setup="${i}" data-key="${key}" type="${type}" ${type==='number'?`min="0" step="0.01" max="${key==='discount'?100:10000000}"`:''} value="${esc(p[key])}" ${!p.enabled?'disabled':''}></label>`;}
function renderSetup(){
 $('#setup-plans').innerHTML=state[current].setupFees.map((p,i)=>`<article class="pm-plan"><div class="pm-planhead"><h2>${setupLabels[i]}</h2><p>${p.enabled?'One-time setup · separate from subscriptions':'Not offered in this destination'}</p></div><div class="pm-fields">${setupField(p,i,'fee','Setup fee · USD')}${setupField(p,i,'discount','Setup discount · %')}${setupField(p,i,'from','Offer valid from','date')}${setupField(p,i,'to','Offer valid through','date')}<div class="pm-saving" id="setup-saving${i}"></div></div></article>`).join('');
 $('#setup-plans').querySelectorAll('input').forEach(el=>el.oninput=()=>{const p=state[current].setupFees[el.dataset.setup];p[el.dataset.key]=el.type==='number'?(el.value===''?'':Number(el.value)):el.value;state[current].dirty=true;$('#publish').disabled=true;$('#bulk-open').disabled=true;$('#message').textContent='Unsaved setup-fee changes — Save Draft before publishing.';preview();});
}
function previewSetup(day){
 $('#setup-rows').innerHTML=state[current].setupFees.map((p,i)=>{const ok=validSetup(p),active=ok&&p.discount>0&&day>=p.from&&day<=p.to,effective=Math.round(p.fee*(active?1-p.discount/100:1)*100)/100,saving=p.fee-effective;const status=!p.enabled?'Not offered':!ok?'Enter valid fee and offer dates':!p.discount?'No setup offer':day<p.from?'Scheduled':day>p.to?'Expired · standard setup fee':`Active · ${p.discount}% off`;
 $('#setup-saving'+i).textContent=!p.enabled?'Not offered':ok?'Payable setup: USD '+money(effective)+(active?' · Save USD '+money(saving):''):status;
 return `<tr><td><strong>${setupLabels[i]}</strong>${p.enabled&&p.visible===false?'<span class="pm-status">Hidden on website</span>':''}</td><td>${p.enabled&&ok?money(p.fee):'—'}</td><td>${p.enabled&&ok?money(effective):'—'}</td><td>${p.enabled&&ok?money(saving):'—'}</td><td>${esc(status)}</td></tr>`;
 }).join('');
}

async function api(path,body){const res=await fetch('/api/pricing/admin/'+path,{cache:'no-store',method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const result=await res.json();if(!res.ok)throw Error(result.error||'Request failed.');return result;}
function lock(yes){busy=yes;document.querySelectorAll('#plans input:not([type=checkbox]),#setup-plans input,#save,#reset,#import,#countries button,#countries input,#bulk-apply,#bulk-close').forEach(el=>el.disabled=yes);document.querySelectorAll('#setup-plans input').forEach(el=>el.disabled=yes||!state[current]?.setupFees?.[el.dataset.setup]?.enabled);document.querySelectorAll('#plan-visibility input').forEach(el=>el.disabled=yes||!state[current]?.setupFees?.[el.dataset.planVisible??el.dataset.planPrice]?.enabled);$('#publish').disabled=yes||!state[current]||state[current].dirty||!state[current].revision;$('#bulk-open').disabled=$('#publish').disabled;}
async function loadCountry(name,force=false){if(busy)return;try{lock(true);const item=countries.find(c=>c.name===name);if(!state[name]||force){const r=await api(item.slug);data[name]=r.plans;state[name]={...r,dirty:false};}current=name;render();$('#message').textContent='Draft revision '+state[name].revision+' · Published revision '+state[name].publishedRevision;}catch(e){$('#message').textContent=e.message;}finally{lock(false)}}
$('#search').oninput=nav;$('#date').oninput=preview;$('#today').onclick=()=>{$('#date').value=today();preview()};
$('#save').onclick=async()=>{if(busy)return;if(!data[current].every(p=>!p.enabled||valid(p))||!state[current].setupFees.every(p=>!p.enabled||validSetup(p))){$('#message').textContent='Correct invalid prices, user counts or offer dates before saving.';return}try{lock(true);const r=await api(countries.find(c=>c.name===current).slug+'/draft',{plans:data[current],setupFees:state[current].setupFees,revision:state[current].revision});state[current].revision=r.revision;state[current].dirty=false;$('#message').textContent='Draft saved securely. Publish Prices when ready to update '+current+'.';}catch(e){$('#message').textContent=e.message;}finally{lock(false)}};
$('#publish').onclick=async()=>{if(busy||state[current].dirty)return;if(!confirm('Publish the saved prices and plan visibility for '+current+' to its live destination page?'))return;try{lock(true);const r=await api(countries.find(c=>c.name===current).slug+'/publish',{revision:state[current].revision});state[current].publishedRevision=r.revision;$('#message').textContent='Published. '+current+' now uses these prices. Open or refresh its destination page to see them.';}catch(e){$('#message').textContent=e.message;}finally{lock(false)}};
$('#reset').onclick=()=>{if(!state[current]?.dirty||confirm('Discard unsaved edits for this destination and reload its saved draft?'))loadCountry(current,true)};
$('#import').onclick=()=>{try{const old=JSON.parse(localStorage.getItem('dmc24-plan-review-v1'));if(!old?.[current])throw Error('No browser draft found for '+current+' in this browser.');data[current]=old[current].map((p,i)=>({...p,enabled:data[current][i].enabled,extraYearly:p.extraYearly??'',maxUsers:p.maxUsers??Math.max(p.users,[5,20,50][i])}));state[current].dirty=true;render();lock(false);$('#message').textContent='Browser draft imported for review. Save Draft, then Publish Prices to make it live.';}catch(e){$('#message').textContent=e.message}};
let bulkCatalog=[];
$('#bulk-open').onclick=async()=>{if(busy||state[current]?.dirty||!state[current]?.revision)return;try{lock(true);bulkCatalog=(await api('catalog')).countries.filter(c=>c.name!==current);$('#bulk-source').textContent=current;$('#bulk-targets').innerHTML=bulkCatalog.map(c=>`<label><input type="checkbox" value="${c.slug}">${esc(c.name)}${c.visible?'':' (hidden)'}${state[c.name]?.dirty?' · unsaved edits will be replaced':''}</label>`).join('');$('#bulk-message').textContent='Select the destinations to update.';$('#bulk-dialog').showModal();}catch(e){$('#message').textContent=e.message;}finally{lock(false)}};
$('#bulk-close').onclick=()=>$('#bulk-dialog').close();$('#bulk-dialog').addEventListener('cancel',e=>{if(busy)e.preventDefault()});
$('#bulk-all').onclick=()=>$('#bulk-targets').querySelectorAll('input').forEach(i=>i.checked=true);$('#bulk-clear').onclick=()=>$('#bulk-targets').querySelectorAll('input').forEach(i=>i.checked=false);
$('#bulk-apply').onclick=async()=>{if(busy)return;const selected=[...$('#bulk-targets').querySelectorAll('input:checked')].map(i=>bulkCatalog.find(c=>c.slug===i.value));if(!selected.length){$('#bulk-message').textContent='Select at least one destination.';return}try{lock(true);const publish=$('#bulk-publish').checked;const r=await api('bulk-copy',{source:countries.find(c=>c.name===current).slug,sourceRevision:state[current].revision,targets:selected.map(c=>({slug:c.slug,revision:c.revision})),copySetup:$('#bulk-setup').checked,publish});selected.forEach(c=>{delete state[c.name];data[c.name]=[]});$('#bulk-dialog').close();$('#message').textContent='Copied '+current+' settings to '+r.count+' destinations'+(r.published?' and published their prices.':'. Saved as drafts; publish each country when ready.')+' Each country can now be edited independently.';}catch(e){$('#bulk-message').textContent=e.message;}finally{lock(false)}};
(async()=>{try{lock(true);const r=await api('catalog');countries=r.countries;data=Object.fromEntries(countries.map(c=>[c.name,[]]));nav();busy=false;await loadCountry(countries.some(c=>c.name==='Kenya')?'Kenya':countries[0].name);}catch(e){$('#message').textContent=e.message;$('#save').disabled=true;$('#publish').disabled=true;}})();
setInterval(()=>{if(data[current]?.length)preview()},60000);

};
modules['country-pricing-review']=function(){
 const form=document.getElementById('country-price-form');
 form?.querySelector('select').addEventListener('change',()=>form.requestSubmit());
 document.querySelectorAll('#subscriptions [data-billing]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('#subscriptions [data-billing]').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
 }));
};
modules['user-slider-review']=function(){
 const root=document.querySelector('main #subscriptions');if(!root)return;
 if(!root.querySelector('.user-price-control'))root.querySelector('.sl-plan-head').insertAdjacentHTML('afterend',"<div class=\"user-price-control\"><div class=\"user-price-heading\"><div><span class=\"kicker\">Build your team</span><h3>How many users does your team need?</h3></div><output id=\"plan-users-count\" for=\"plan-users\">Loading…</output></div><label class=\"user-slider-label\" for=\"plan-users\">Number of users</label><input id=\"plan-users\" class=\"user-price-slider\" type=\"range\" min=\"1\" max=\"50\" step=\"1\" value=\"1\" disabled=\"\" aria-describedby=\"user-price-status\"><div class=\"user-price-limits\"><span id=\"plan-users-min\">Loading minimum…</span><span>50 users</span></div><p id=\"user-price-status\" role=\"status\">Loading current plan settings…</p><p>Each plan charges for users above its own included allowance. Setup fees are separate from the subscription totals shown.</p></div>");
 const control=root.querySelector('.user-price-control'),billing=root.querySelector('.sl-billing');
 const controlFooter=document.createElement('div');controlFooter.className='user-price-footer';
 const controlNotes=document.createElement('div');controlNotes.className='user-price-notes';
 [...control.children].filter(el=>el.tagName==='P').forEach(el=>controlNotes.append(el));
 controlFooter.append(controlNotes);if(billing)controlFooter.append(billing);control.append(controlFooter);
 const range=document.querySelector('#plan-users'),out=document.querySelector('#plan-users-count'),status=document.querySelector('#user-price-status');
 const labels=['Business','Professional','Professional Plus'];const cards=[...root.querySelectorAll('.sl-plan')].filter(card=>labels.includes(card.querySelector('h3')?.textContent.trim()));let plans=null;
 const money=v=>'$'+Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
 function total(p,period,n){const extra=Math.max(0,n-p.users),rate=period==='monthly'?p.extra:p.extraYearly;return {extra,rate,known:extra===0||typeof rate==='number',base:period==='monthly'?p.effectiveMonthly:p.effectiveYearly,value:(period==='monthly'?p.effectiveMonthly:p.effectiveYearly)+extra*(typeof rate==='number'?rate:0)};}
 function update(){if(!plans)return;const n=Number(range.value),period=root.querySelector('[data-billing][aria-pressed=true]')?.dataset.billing||'monthly';out.textContent=n+' users';const badge=root.querySelector('[data-billing=yearly] span');if(badge)badge.textContent='Annual billing';root.querySelectorAll('.sl-price-footnote').forEach(note=>{note.textContent=note.textContent.replace(/Yearly subscriptions save[^.]+\./,'See each plan for its annual saving.');});range.setAttribute('aria-valuetext',n+' users');
 cards.forEach(card=>{const i=labels.indexOf(card.querySelector('h3').textContent.trim());const p=plans[i];if(!p?.enabled||p.priceVisible===false)return;const t=total(p,period,n),price=card.querySelector('.sl-plan-price');price.querySelector('strong').textContent=t.known?money(t.value):'Request a quote';price.querySelector('small').textContent=t.known?(period==='monthly'?'/ month':'/ year'):'';
 const limit=p.maxUsers??Math.max(p.users,[5,20,50][i]),over=n>limit;card.classList.toggle('sl-plan--over-limit',over);const action=card.querySelector('.sl-plan-top a');if(action){if(!action.dataset.originalHref)action.dataset.originalHref=action.getAttribute('href');if(over){action.removeAttribute('href');action.setAttribute('aria-disabled','true');action.tabIndex=-1;}else{action.href=action.dataset.originalHref;action.removeAttribute('aria-disabled');action.removeAttribute('tabindex');}}
 let breakdown=card.querySelector('.user-cost-breakdown');if(!breakdown){breakdown=document.createElement('p');breakdown.className='user-cost-breakdown';price.after(breakdown)}
 breakdown.textContent=p.users+' users included · '+t.extra+' additional users. '+(t.extra?(t.known?money(t.base)+' base + '+t.extra+' × '+money(t.rate)+' / '+(period==='monthly'?'month':'year'):'Additional-user '+period+' rate is not configured.'):money(t.base)+' base price; no additional-user charge.');
 const line=[...card.querySelectorAll('li')].find(li=>/(?:Up to|Minimum)\s+\d+\s+users|\d+ users included/i.test(li.textContent));if(line)line.textContent=line.textContent.replace(/(?:Up to|Minimum)\s+\d+\s+users|\d+ users included/i,p.users+' users included');
 const m=total(p,'monthly',n),y=total(p,'yearly',n);card.querySelector('.sl-plan-saving').textContent=m.known&&y.known?(m.value*12-y.value>=0?'Save '+money(m.value*12-y.value)+' per year at '+n+' users':'Yearly total exceeds 12 monthly payments'):'Configure both additional-user rates to compare yearly savings.';
 let offer=card.querySelector('.plan-original-price');if(!offer){offer=document.createElement('p');offer.className='plan-original-price';price.before(offer)}offer.textContent=p.offerActive?p.discount+'% offer on the base subscription through '+p.to+'. Additional users billed separately.':'';offer.hidden=!p.offerActive;
 if(over){price.querySelector('strong').textContent='User limit reached';price.querySelector('small').textContent='';breakdown.textContent='Supports up to '+limit+' users. '+(plans.some((next,j)=>j>i&&next.enabled&&next.priceVisible!==false&&n<=next.maxUsers)?'Choose '+labels.filter((label,j)=>j>i&&plans[j].enabled&&plans[j].priceVisible!==false&&n<=plans[j].maxUsers).join(' or ')+'.':(document.querySelector('main .sl-enterprise:not([hidden])')?'Contact us about Enterprise.':'Contact us to discuss your requirements.'));card.querySelector('.sl-plan-saving').textContent='Select '+limit+' or fewer users to use this plan.';offer.hidden=true;}else{breakdown.textContent+=' Maximum '+limit+' users.';}
 });
 }
 range.addEventListener('input',update);root.querySelector('.sl-billing').addEventListener('click',()=>queueMicrotask(update));
 function acceptPricing(v){if(v.offers){const block=document.querySelector('script[type="application/ld+json"]');try{const schema=JSON.parse(block.textContent),app=schema['@graph']?.find(n=>n['@type']==='SoftwareApplication');if(app){app.offers=v.offers;block.textContent=JSON.stringify(schema).replaceAll('<','\\u003c');}}catch{}}plans=v.plans;renderPlanVisibility(v);renderDestinationSetupFees(v.setupFees);if(!plans.some(p=>p.enabled&&p.priceVisible!==false)){range.disabled=true;out.textContent='By consultation';return;}const min=Math.min(...plans.filter(p=>p.enabled&&p.priceVisible!==false).map(p=>p.users));if(min>50)throw Error();range.min=min;range.max=50;range.value=Math.max(min,Math.min(50,Number(range.value)||min));document.querySelector('#plan-users-min').textContent=min+' users';range.disabled=false;status.textContent='Additional charges apply only above each plan’s included users, up to its maximum. '+(v.planVisibility?.[3]===false?'':'Enterprise is available by consultation.');update();}
 const snapshot=document.getElementById('published-pricing');if(snapshot){try{acceptPricing(JSON.parse(snapshot.textContent));root.querySelectorAll('.server-pricing-summary').forEach(n=>n.remove());}catch{}}
 async function refresh(){try{
 const r=await fetch('/api/pricing/'+(root.dataset.pricingCountry||(document.body.dataset.page==='kenya-users-review'?'kenya':document.body.dataset.page==='uae'?'dubai':document.body.dataset.page)),{cache:'no-store'});if(!r.ok)throw Error();const v=await r.json();acceptPricing(v);
 }catch{status.textContent='Current pricing could not be refreshed. Please contact us to confirm pricing.';if(!plans)unavailableSetupFees();if(!plans){range.disabled=true;cards.forEach(card=>{card.querySelector('.sl-plan-price strong').textContent='Please contact us';card.querySelector('.sl-plan-price small').textContent='';});}}
 }
 refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});

};

const pageModules={"user-management":["user-management"],"user-management-review":["user-management-review"],"email-automation":["email-automation"],"pricing-country-review":["73e346e53996f6c9","de188bc6968624b7","country-pricing-review","user-slider-review"],"vishal-shah":["73e346e53996f6c9","de188bc6968624b7"],"blog-management":["blog-management","blog-ordering"],"cms-article":["73e346e53996f6c9","de188bc6968624b7"],"blog-management-review":["blog-management-review"],"faqs-review":["73e346e53996f6c9","de188bc6968624b7","faq-review"],"case-study-uae":["73e346e53996f6c9","de188bc6968624b7"],"case-study-sri-lanka":["73e346e53996f6c9","de188bc6968624b7"],"case-study-maldives":["73e346e53996f6c9","de188bc6968624b7"],"case-study-mauritius":["73e346e53996f6c9","de188bc6968624b7"],"case-study-kerala":["73e346e53996f6c9","de188bc6968624b7"],"case-study-kenya":["73e346e53996f6c9","de188bc6968624b7"],"demo-requests":["demo-requests"],"seo-management":["seo-management"],"admin":["admin-dashboard"],"admin-login":["admin-login"],"website-analytics":["website-analytics"],"brochure-enquiries":["brochure-enquiries"],"kenya-users-review":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review"],"plan-management":["plan-management"],"namibia":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"zambia":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"zimbabwe":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"botswana":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"real-time-reports-dmc-leaders":["73e346e53996f6c9","de188bc6968624b7"],"why-dmcs-need-specialist-software":["73e346e53996f6c9","de188bc6968624b7"],"connected-dmc-workflow":["73e346e53996f6c9","de188bc6968624b7"],"b2b-distribution-agent-needs":["73e346e53996f6c9","de188bc6968624b7"],"local-sales-revenue-after-arrival":["73e346e53996f6c9","de188bc6968624b7"],"what-multi-dmc-really-means":["73e346e53996f6c9","de188bc6968624b7"],"why-file-wise-pnl-matters":["73e346e53996f6c9","de188bc6968624b7"],"enquiry-to-confirmation":["73e346e53996f6c9","de188bc6968624b7"],"file-wise-booking-profitability":["73e346e53996f6c9","de188bc6968624b7"],"ai-itinerary-creation":["73e346e53996f6c9","de188bc6968624b7"],"contracts-and-travel-api-inventory":["73e346e53996f6c9","de188bc6968624b7"],"grow-revenue-through-local-sales":["73e346e53996f6c9","de188bc6968624b7"],"international-market-control":["73e346e53996f6c9","de188bc6968624b7"],"benefits-preview":["73e346e53996f6c9","29d0a53ed969cf62","benefits-command-design","de188bc6968624b7"],"features-preview":["73e346e53996f6c9","eb1ebf9297930b5b","features-command-design","de188bc6968624b7"],"product-preview":["73e346e53996f6c9","product-lifecycle","de188bc6968624b7"],"home-preview":["command-preview"],"about-puratech":["2d292e7eaa536c10","d9ca512c7cb7a75c","de188bc6968624b7"],"about":["73e346e53996f6c9","de188bc6968624b7"],"b2b":["73e346e53996f6c9","de188bc6968624b7"],"b2c":["73e346e53996f6c9","de188bc6968624b7"],"bali":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"benefits":["73e346e53996f6c9","29d0a53ed969cf62","benefits-command-design","de188bc6968624b7"],"blogs":["73e346e53996f6c9","de188bc6968624b7","journal-browser"],"bookings-reservations":["73e346e53996f6c9","de188bc6968624b7"],"brochures":["73e346e53996f6c9","de188bc6968624b7"],"case-studies":["73e346e53996f6c9","de188bc6968624b7"],"contact":["73e346e53996f6c9","de188bc6968624b7"],"contracting-products":["73e346e53996f6c9","de188bc6968624b7"],"costing-quotations":["73e346e53996f6c9","de188bc6968624b7"],"dashboards-mis":["73e346e53996f6c9","de188bc6968624b7"],"destinations":["f8cb7c98de961688","de188bc6968624b7"],"dubai":["73e346e53996f6c9","gulf-subscription-plans","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"egypt":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"faqs":["73e346e53996f6c9","de188bc6968624b7","faq-review"],"features":["73e346e53996f6c9","eb1ebf9297930b5b","features-command-design","de188bc6968624b7"],"finance-profitability":["73e346e53996f6c9","de188bc6968624b7"],"hong-kong":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"how-to-adopt-dmc24":["8de0f2fcfd32c6e1","de188bc6968624b7","editorial-answers"],"icon-style-preview":[],"index":["73e346e53996f6c9","command-preview","de188bc6968624b7","destination-search"],"integrations":["73e346e53996f6c9","de188bc6968624b7"],"kenya":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"local-sales":["73e346e53996f6c9","de188bc6968624b7"],"malaysia":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"thailand":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"maldives":["73e346e53996f6c9","b1206a2f9e43669e","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"mauritius":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"mid-office":["73e346e53996f6c9","de188bc6968624b7"],"multi-dmc":["73e346e53996f6c9","de188bc6968624b7"],"oman":["73e346e53996f6c9","eef1df7d3d886af5","gulf-subscription-plans","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"operations-logistics":["73e346e53996f6c9","de188bc6968624b7"],"pricing":["73e346e53996f6c9","de188bc6968624b7","country-pricing-review","user-slider-review","editorial-answers"],"request-demo":["73e346e53996f6c9","de188bc6968624b7"],"resources":["73e346e53996f6c9","de188bc6968624b7","editorial-answers"],"rwanda":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"sales-crm":["73e346e53996f6c9","de188bc6968624b7"],"saudi-arabia":["2d292e7eaa536c10","eef1df7d3d886af5","gulf-subscription-plans","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"seychelles":["2d292e7eaa536c10","eef1df7d3d886af5","b1206a2f9e43669e","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"singapore":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"south-africa":["73e346e53996f6c9","eef1df7d3d886af5","south-africa-plans","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"sri-lanka":["73e346e53996f6c9","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"tanzania":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"uae":["73e346e53996f6c9","gulf-subscription-plans","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review"],"uganda":["73e346e53996f6c9","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"what-is-dmc24":["73e346e53996f6c9","product-lifecycle","de188bc6968624b7"],"why-dmc24":["73e346e53996f6c9","db4deda414869ea0","de188bc6968624b7"],"cambodia":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"],"vietnam":["73e346e53996f6c9","eef1df7d3d886af5","f4a0a88e162ee2fe","de188bc6968624b7","common-destination-pricing","user-slider-review","editorial-answers"]};
const page=document.body.dataset.page;
modules['site-breadcrumbs']=function(){
  const nav=document.querySelector('.site-breadcrumbs');
  const main=document.querySelector('main');
  if(nav && main) main.before(nav);
};
modules['destination-brochure']=function(){
 if(!(pageModules[page]||[]).includes('common-destination-pricing'))return;
 const slug=page==='uae'?'dubai':page==='kenya-users-review'?'kenya':page;
 const actions=document.querySelector('main .country-hero--command .hero-actions');
 if(actions&&!actions.querySelector('[data-brochure-download]')){const a=document.createElement('a');a.className='btn btn-outline';a.href='/api/brochures/'+slug+'.pdf';a.download='DMC24-'+slug+'-Brochure.pdf';a.dataset.brochureDownload='';a.textContent='Download Brochure (PDF)';actions.append(a);}
};
modules['complete-footer']=function(){
 const menu=document.querySelector('.dmc-master-links');if(!menu)return;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const groups=new Map(['Product','Mid Office','Solutions','Resources','Company'].map(n=>[n,[]]));
 const used=new Set();const countries=new Map();
 const slugOf=href=>{const s=new URL(href,location.href).pathname.split('/').pop().replace(/\.html$/,'');return s==='uae'?'dubai':s;};
 const add=(group,href,label)=>{if(!href||!label||used.has(href))return;used.add(href);if(!groups.has(group))groups.set(group,[]);groups.get(group).push({href,label});};
 const mid=new Set(['mid-office','sales-crm','contracting-products','costing-quotations','bookings-reservations','operations-logistics','finance-profitability','dashboards-mis']);
 add('Product','index.html','Home');
 for(const item of menu.children){
  const top=item.matches('a')?item:item.querySelector(':scope > a');if(!top)continue;
  const label=top.textContent.replace(/[▾→]/g,'').trim();
  const links=item.matches('a')?[item]:[top,...item.querySelectorAll('.dmc-master-drop a')];
  for(const a of links){const href=a.getAttribute('href');if(!href)continue;const slug=slugOf(href);const name=(a.querySelector('strong')?.textContent||a.textContent).replace(/[▾→]/g,'').trim();
   if(label==='Destinations'){if(slug!=='destinations'&&!hiddenDestinations.has(slug))countries.set(slug,name);continue;}
   const group=mid.has(slug)?'Mid Office':label==='Pricing'?'Solutions':groups.has(label)?label:label;
   add(group,href,a===top&&!item.matches('a')?({'Product':'What is DMC24?','Solutions':'B2B Booking Platform','Company':'About Puratech'}[label]||label):name);
  }
 }
 const catalog=JSON.parse(document.querySelector('#footer-countries')?.textContent||'[]');
 for(const c of catalog)if(!hiddenDestinations.has(c.slug))countries.set(c.slug,c.name);
 add('Company','request-demo.html','Request a Demo');
 const link=x=>`<a href="${esc(x.href)}">${esc(x.label)}</a>`;
 const columns=[...groups].map(([name,links])=>`<div class="site-footer-column"><h2>${esc(name)}</h2>${links.map(link).join('')}</div>`).join('');
 const countryLinks=[...countries].sort((a,b)=>a[1].localeCompare(b[1],'en')).map(([slug,name])=>link({href:slug+'.html',label:'DMC Software for '+name})).join('');
 const footer=document.createElement('footer');footer.className='site-footer';
 footer.innerHTML=`<div class="command-wrap"><div class="site-footer-brand"><a href="index.html"><img src="img/dmc24-logo.png" alt="DMC24" width="449" height="128" loading="lazy" decoding="async"></a><p>The connected platform for destination management companies.</p></div><nav class="site-footer-grid" aria-label="Footer navigation">${columns}</nav><nav class="site-footer-destinations" aria-label="Destination footer navigation"><div class="site-footer-heading"><h2>DMC24 for your destination</h2><a href="destinations.html">All Destinations →</a></div><div class="site-footer-countries">${countryLinks}</div></nav><p class="site-footer-copyright">© ${new Date().getFullYear()} DMC24. Puratech Consultancy Solutions Pvt Ltd.</p></div>`;
 const old=[...document.querySelectorAll('body > footer')];if(old.length){old[0].replaceWith(footer);old.slice(1).forEach(f=>f.remove());}else document.body.append(footer);
};

modules['brochure-gate']=function(){
 const fileIds={'DMC24_Comprehensive_Sales_Brochure.pdf':'overview','DMC24_Mid_Office_Brochure.pdf':'mid-office','DMC24_B2B_Booking_Platform_Brochure.pdf':'b2b','DMC24_B2C_Booking_Platform_Brochure.pdf':'b2c','DMC24_Local_Sales_Brochure.pdf':'local-sales','DMC24_Multi_DMC_Brochure.pdf':'multi-dmc'};
 const labels={overview:'Comprehensive DMC24', 'mid-office':'DMC24 Mid Office',b2b:'B2B Booking Platform',b2c:'B2C Booking Platform','local-sales':'Local Sales','multi-dmc':'Multi-DMC',dubai:'DMC24 for UAE',uae:'DMC24 for UAE'};
 const countries=[["AF","Afghanistan"],["AX","Åland Islands"],["AL","Albania"],["DZ","Algeria"],["AS","American Samoa"],["AD","Andorra"],["AO","Angola"],["AI","Anguilla"],["AQ","Antarctica"],["AG","Antigua & Barbuda"],["AR","Argentina"],["AM","Armenia"],["AW","Aruba"],["AU","Australia"],["AT","Austria"],["AZ","Azerbaijan"],["BS","Bahamas"],["BH","Bahrain"],["BD","Bangladesh"],["BB","Barbados"],["BY","Belarus"],["BE","Belgium"],["BZ","Belize"],["BJ","Benin"],["BM","Bermuda"],["BT","Bhutan"],["BO","Bolivia"],["BA","Bosnia & Herzegovina"],["BW","Botswana"],["BV","Bouvet Island"],["BR","Brazil"],["IO","British Indian Ocean Territory"],["VG","British Virgin Islands"],["BN","Brunei"],["BG","Bulgaria"],["BF","Burkina Faso"],["BI","Burundi"],["KH","Cambodia"],["CM","Cameroon"],["CA","Canada"],["CV","Cape Verde"],["BQ","Caribbean Netherlands"],["KY","Cayman Islands"],["CF","Central African Republic"],["TD","Chad"],["CL","Chile"],["CN","China"],["CX","Christmas Island"],["CC","Cocos (Keeling) Islands"],["CO","Colombia"],["KM","Comoros"],["CG","Congo - Brazzaville"],["CD","Congo - Kinshasa"],["CK","Cook Islands"],["CR","Costa Rica"],["CI","Côte d’Ivoire"],["HR","Croatia"],["CU","Cuba"],["CW","Curaçao"],["CY","Cyprus"],["CZ","Czechia"],["DK","Denmark"],["DJ","Djibouti"],["DM","Dominica"],["DO","Dominican Republic"],["EC","Ecuador"],["EG","Egypt"],["SV","El Salvador"],["GQ","Equatorial Guinea"],["ER","Eritrea"],["EE","Estonia"],["SZ","Eswatini"],["ET","Ethiopia"],["FK","Falkland Islands"],["FO","Faroe Islands"],["FJ","Fiji"],["FI","Finland"],["FR","France"],["GF","French Guiana"],["PF","French Polynesia"],["TF","French Southern Territories"],["GA","Gabon"],["GM","Gambia"],["GE","Georgia"],["DE","Germany"],["GH","Ghana"],["GI","Gibraltar"],["GR","Greece"],["GL","Greenland"],["GD","Grenada"],["GP","Guadeloupe"],["GU","Guam"],["GT","Guatemala"],["GG","Guernsey"],["GN","Guinea"],["GW","Guinea-Bissau"],["GY","Guyana"],["HT","Haiti"],["HM","Heard & McDonald Islands"],["HN","Honduras"],["HK","Hong Kong SAR China"],["HU","Hungary"],["IS","Iceland"],["IN","India"],["ID","Indonesia"],["IR","Iran"],["IQ","Iraq"],["IE","Ireland"],["IM","Isle of Man"],["IL","Israel"],["IT","Italy"],["JM","Jamaica"],["JP","Japan"],["JE","Jersey"],["JO","Jordan"],["KZ","Kazakhstan"],["KE","Kenya"],["KI","Kiribati"],["KW","Kuwait"],["KG","Kyrgyzstan"],["LA","Laos"],["LV","Latvia"],["LB","Lebanon"],["LS","Lesotho"],["LR","Liberia"],["LY","Libya"],["LI","Liechtenstein"],["LT","Lithuania"],["LU","Luxembourg"],["MO","Macao SAR China"],["MG","Madagascar"],["MW","Malawi"],["MY","Malaysia"],["MV","Maldives"],["ML","Mali"],["MT","Malta"],["MH","Marshall Islands"],["MQ","Martinique"],["MR","Mauritania"],["MU","Mauritius"],["YT","Mayotte"],["MX","Mexico"],["FM","Micronesia"],["MD","Moldova"],["MC","Monaco"],["MN","Mongolia"],["ME","Montenegro"],["MS","Montserrat"],["MA","Morocco"],["MZ","Mozambique"],["MM","Myanmar (Burma)"],["NA","Namibia"],["NR","Nauru"],["NP","Nepal"],["NL","Netherlands"],["NC","New Caledonia"],["NZ","New Zealand"],["NI","Nicaragua"],["NE","Niger"],["NG","Nigeria"],["NU","Niue"],["NF","Norfolk Island"],["KP","North Korea"],["MK","North Macedonia"],["MP","Northern Mariana Islands"],["NO","Norway"],["OM","Oman"],["PK","Pakistan"],["PW","Palau"],["PS","Palestinian Territories"],["PA","Panama"],["PG","Papua New Guinea"],["PY","Paraguay"],["PE","Peru"],["PH","Philippines"],["PN","Pitcairn Islands"],["PL","Poland"],["PT","Portugal"],["PR","Puerto Rico"],["QA","Qatar"],["RE","Réunion"],["RO","Romania"],["RU","Russia"],["RW","Rwanda"],["WS","Samoa"],["SM","San Marino"],["ST","São Tomé & Príncipe"],["SA","Saudi Arabia"],["SN","Senegal"],["RS","Serbia"],["SC","Seychelles"],["SL","Sierra Leone"],["SG","Singapore"],["SX","Sint Maarten"],["SK","Slovakia"],["SI","Slovenia"],["SB","Solomon Islands"],["SO","Somalia"],["ZA","South Africa"],["GS","South Georgia & South Sandwich Islands"],["KR","South Korea"],["SS","South Sudan"],["ES","Spain"],["LK","Sri Lanka"],["BL","St. Barthélemy"],["SH","St. Helena"],["KN","St. Kitts & Nevis"],["LC","St. Lucia"],["MF","St. Martin"],["PM","St. Pierre & Miquelon"],["VC","St. Vincent & Grenadines"],["SD","Sudan"],["SR","Suriname"],["SJ","Svalbard & Jan Mayen"],["SE","Sweden"],["CH","Switzerland"],["SY","Syria"],["TW","Taiwan"],["TJ","Tajikistan"],["TZ","Tanzania"],["TH","Thailand"],["TL","Timor-Leste"],["TG","Togo"],["TK","Tokelau"],["TO","Tonga"],["TT","Trinidad & Tobago"],["TN","Tunisia"],["TR","Türkiye"],["TM","Turkmenistan"],["TC","Turks & Caicos Islands"],["TV","Tuvalu"],["UM","U.S. Outlying Islands"],["VI","U.S. Virgin Islands"],["UG","Uganda"],["UA","Ukraine"],["AE","United Arab Emirates"],["GB","United Kingdom"],["US","United States"],["UY","Uruguay"],["UZ","Uzbekistan"],["VU","Vanuatu"],["VA","Vatican City"],["VE","Venezuela"],["VN","Vietnam"],["WF","Wallis & Futuna"],["EH","Western Sahara"],["YE","Yemen"],["ZM","Zambia"],["ZW","Zimbabwe"]];
 const users=['1–5','6–10','11–20','21–50','51–100','100+','Not sure yet'],timings=['Within 1 month','1–3 months','3–6 months','6–12 months','Just exploring'];
 const opts=items=>'<option value="">Please select</option>'+items.map(v=>'<option>'+v+'</option>').join('');
 let dlg,active,opener,busy=false;
 function create(){
  if(dlg)return;
  dlg=document.createElement('dialog');dlg.className='brochure-dialog';dlg.setAttribute('aria-labelledby','brochure-form-title');
  dlg.innerHTML=`<button type="button" class="brochure-close" aria-label="Close brochure form">×</button><div class="kicker">DMC24 · Product brochures</div><h2 id="brochure-form-title">Get your DMC24 brochure</h2><p>Explore what DMC24 can do for your business.</p><p class="brochure-selected" id="brochure-selected"></p><form class="brochure-form"><p class="brochure-note">Fields marked * are required.</p><div class="brochure-fields"><label>Full name *<input name="name" autocomplete="name" required minlength="2" maxlength="120"></label><label>Work email *<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label class="brochure-full">Company name *<input name="company" autocomplete="organization" required minlength="2" maxlength="160"></label><fieldset class="brochure-full brochure-countries"><legend>Countries of operation *</legend><details><summary>Select countries</summary><input class="brochure-country-search" type="search" placeholder="Search all countries…" aria-label="Search countries"><div class="brochure-country-list"></div></details><p class="brochure-country-count" aria-live="polite">Select one or more countries.</p></fieldset><label>Expected DMC24 users *<select name="users" required>${opts(users)}</select></label><label>When do you plan to implement? *<select name="timing" required>${opts(timings)}</select></label><label class="brochure-full">Phone / WhatsApp <span>(optional)</span><input name="phone" type="tel" autocomplete="tel" maxlength="40" placeholder="Include country code, e.g. +91" pattern="\\+[0-9][0-9 ()\\-]{5,37}"></label></div><label class="brochure-check"><input type="checkbox" name="demo"> I would like a personalised DMC24 demonstration.</label><div class="brochure-trap" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><details class="brochure-notice"><summary>How we use your details</summary><p>DMC24 will store your contact and company details, countries, expected users, implementation timing and brochure requests to understand your interest and handle your enquiry. Demo requests are recorded for follow-up. Submitting this form does not subscribe you to a newsletter.</p><p>A cookie remembers your submission in this browser for 90 days so you can download other brochures without completing the form again. Contact sales@dmc24.com to request a correction or removal of your enquiry details.</p></details><button type="submit" class="btn btn-primary">Download Brochure</button></form><p class="brochure-status" role="status" aria-live="polite"></p><div class="brochure-success" hidden><a class="btn btn-primary" data-ready-download>Download PDF again</a><p>You can now download other brochures in this browser without filling in the form again.</p><button type="button" class="btn btn-outline" data-brochure-done>Continue browsing</button></div>`;
  document.body.append(dlg);
  const list=dlg.querySelector('.brochure-country-list');
  countries.forEach(([code,name])=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.name='countries';input.value=code;label.append(input,document.createTextNode(name));list.append(label);});
  const search=dlg.querySelector('.brochure-country-search');search.addEventListener('input',()=>{for(const label of list.children)label.hidden=!label.textContent.toLowerCase().includes(search.value.trim().toLowerCase());});
  list.addEventListener('change',()=>{const selected=[...list.querySelectorAll('input:checked')].map(i=>i.parentElement.textContent);dlg.querySelector('.brochure-country-count').textContent=selected.length?selected.join(', '):'Select one or more countries.';dlg.querySelector('.brochure-countries summary').textContent=selected.length?selected.length+' countries selected':'Select countries';});
  dlg.querySelector('.brochure-close').onclick=close;dlg.querySelector('[data-brochure-done]').onclick=close;
  dlg.addEventListener('cancel',e=>{if(busy)e.preventDefault();});dlg.addEventListener('close',()=>opener?.focus());
  dlg.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;if(!f.reportValidity())return;const data=Object.fromEntries(new FormData(f));data.countries=[...f.querySelectorAll('[name=countries]:checked')].map(i=>i.value);data.demo=f.elements.demo.checked;if(!data.countries.length){status('Select at least one country of operation.');f.querySelector('.brochure-countries details').open=true;search.focus();return;}submit(data);});
 }
 function status(text){dlg.querySelector('.brochure-status').textContent=text;}
 function close(){if(!busy)dlg.close();}
 async function submit(data={}){
  if(busy)return;busy=true;const button=dlg.querySelector('[type=submit]');button.disabled=true;dlg.setAttribute('aria-busy','true');status('Preparing your download…');
  try{
   const res=await fetch('/api/brochure-requests',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,brochure:active,source:location.pathname})});
   const result=await res.json();if(!res.ok)throw Error(result.error||'Please try again.');
   document.dispatchEvent(new CustomEvent('dmc24-brochure-success',{detail:{brochure:active}}));
   const check=await fetch('/api/brochure-access',{credentials:'same-origin',cache:'no-store'});if(!check.ok||!(await check.json()).registered)throw Error('Please enable cookies for this website, then retry your download.');
   dlg.querySelector('form').hidden=true;dlg.querySelector('.brochure-success').hidden=false;status('Thank you. Your brochure is ready and the download has started.');
   const link=dlg.querySelector('[data-ready-download]');link.href=result.url;link.download=result.filename;link.click();
  }catch(e){dlg.querySelector('form').hidden=false;status(e.message||'We could not submit your request. Please try again.');}finally{busy=false;button.disabled=false;dlg.removeAttribute('aria-busy');}
 }
 async function open(id,trigger){
  if(busy)return;create();active=id;opener=trigger;dlg.querySelector('#brochure-selected').textContent=labels[id]||'DMC24 for '+id.split('-').map(v=>v[0].toUpperCase()+v.slice(1)).join(' ');dlg.querySelector('form').hidden=false;dlg.querySelector('.brochure-success').hidden=true;status('');if(!dlg.open)dlg.showModal();
  try{const r=await fetch('/api/brochure-access',{credentials:'same-origin',cache:'no-store'});if(r.ok&&(await r.json()).registered)await submit();}catch{/* Keep the form usable; submission reports connection failures. */}
 }
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');if(!a||a.hasAttribute('data-ready-download'))return;
  let u;try{u=new URL(a.href,location.href)}catch{return;}if(u.origin!==location.origin)return;
  const destination=u.pathname.match(/^\/api\/brochures\/([a-z-]+)\.pdf$/),file=fileIds[u.pathname.split('/').pop()];
  const id=destination?.[1]||file;if(!id)return;e.preventDefault();open(id,a);
 });
 const requested=new URLSearchParams(location.search).get('download');if(requested&&/^[a-z-]+$/.test(requested))open(requested,null);
};
modules['brochure-enquiries']=function(){
 const body=document.querySelector('#brochure-lead-rows');if(!body)return;
 let offset=0,total=0,sort="requested",direction="desc",loading=false;
 const status=document.querySelector('#brochure-admin-status'),prev=document.querySelector('#brochure-prev'),next=document.querySelector('#brochure-next');
 const names=new Intl.DisplayNames(['en'],{type:'region'});
 const countryNames=s=>{try{return JSON.parse(s).map(c=>names.of(c)).join(', ')}catch{return s}};
 async function pageRows(start,sortBy=sort,sortDirection=direction){const res=await fetch('/api/brochure-leads?offset='+start+'&sort='+sortBy+'&direction='+sortDirection,{cache:'no-store'});const data=await res.json();if(!res.ok)throw Error(data.error||'Unable to load enquiries.');return data;}
 async function load(){loading=true;document.querySelectorAll('[data-lead-sort]').forEach(b=>b.disabled=true);status.textContent='Loading enquiries…';prev.disabled=next.disabled=true;try{const data=await pageRows(offset);total=data.total;body.replaceChildren();for(const r of data.rows){const tr=document.createElement('tr');for(const v of [new Date(r.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),r.name,r.email,r.company,countryNames(r.countries),r.users,r.timing,r.phone||'—',r.demo?'Yes':'No',r.title,r.destination||'—',r.source]){const td=document.createElement('td');td.textContent=v;tr.append(td);}body.append(tr);}status.textContent=total?`${offset+1}–${Math.min(offset+100,total)} of ${total} brochure requests · Times shown in India time`:'No brochure enquiries yet.';prev.disabled=offset===0;next.disabled=offset+100>=total;}catch(e){status.textContent=e.message;}finally{loading=false;document.querySelectorAll('[data-lead-sort]').forEach(b=>b.disabled=false);}}
 document.querySelectorAll('[data-lead-sort]').forEach(button=>button.addEventListener('click',()=>{if(loading)return;const selected=button.dataset.leadSort;direction=sort===selected?(direction==='asc'?'desc':'asc'):(selected==='requested'?'desc':'asc');sort=selected;offset=0;document.querySelectorAll('[data-lead-sort]').forEach(b=>{const active=b.dataset.leadSort===sort;b.closest('th').setAttribute('aria-sort',active?(direction==='asc'?'ascending':'descending'):'none');b.querySelector('span').textContent=active?(direction==='asc'?'↑':'↓'):'↕';});load();}));
 prev.onclick=()=>{offset=Math.max(0,offset-100);load();};next.onclick=()=>{offset+=100;load();};document.querySelector('#brochure-refresh').onclick=load;
 document.querySelector('#brochure-export').onclick=async function(){this.disabled=true;status.textContent='Preparing CSV export…';try{const rows=[],exportSort=sort,exportDirection=direction;let n=0;while(true){const data=await pageRows(n,exportSort,exportDirection);rows.push(...data.rows);n+=data.rows.length;if(!data.rows.length||n>=data.total)break;}const fields=['Requested at (UTC)','Full name','Work email','Company','Countries of operation','Expected DMC24 users','Implementation timing','Phone / WhatsApp','Demo requested','Brochure','Destination','Source page'];const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,match=>"'"+match).replaceAll('"','""')+'"';const csv='\uFEFF'+[fields,...rows.map(r=>[r.created_at,r.name,r.email,r.company,countryNames(r.countries),r.users,r.timing,r.phone,r.demo?'Yes':'No',r.title,r.destination,r.source])].map(r=>r.map(cell).join(',')).join('\r\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='DMC24-Brochure-Enquiries.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);status.textContent='Exported '+rows.length+' brochure requests.';}catch(e){status.textContent=e.message;}finally{this.disabled=false;}};
 load();
};

modules['visitor-analytics']=function(){
 if(/admin|management|enquiries|demo-requests|analytics|preview|review|icon-style/.test(page))return;
 const key='dmc24-analytics-choice',visitorKey='dmc24-analytics-visitor',sessionKey='dmc24-analytics-visit';
 const storage={read(k,session=false){try{return JSON.parse((session?sessionStorage:localStorage).getItem(k))}catch{return null}},write(k,v,session=false){try{(session?sessionStorage:localStorage).setItem(k,JSON.stringify(v));return true}catch{return false}},remove(k,session=false){try{(session?sessionStorage:localStorage).removeItem(k)}catch{}}};
 let choice=storage.read(key),seen=false;
 if(choice&&choice.expires<Date.now())choice=null;
 const restricted=()=>navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true;
 function source(){const q=new URLSearchParams(location.search),s=(q.get('utm_source')||'').toLowerCase(),m=(q.get('utm_medium')||'').toLowerCase();let ref='';try{const u=new URL(document.referrer);if(u.origin!==location.origin)ref=u.hostname.toLowerCase()}catch{}if(m==='email'||s==='email')return 'Email';for(const [part,label] of [['google','Google'],['bing','Bing'],['facebook','Facebook'],['instagram','Instagram'],['youtube','YouTube'],['linkedin','LinkedIn']])if(s.includes(part)||ref.includes(part))return label;return s?'Other campaign':ref?'Other referral':'Direct';}
 function track(kind,target=''){
  if(choice?.value!=='allow'||restricted())return;
  const now=Date.now();let visitor=storage.read(visitorKey),visit=storage.read(sessionKey,true);
  if(!visitor||visitor.expires<now){visitor={id:crypto.randomUUID(),expires:now+90*86400000};visit=null;storage.write(visitorKey,visitor);}
  if(!visit||now-visit.last>1800000){visit={id:crypto.randomUUID(),last:now,returning:!!visitor.visited,source:source()};visitor.visited=true;storage.write(visitorKey,visitor);}
  visit.last=now;storage.write(sessionKey,visit,true);
  const path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
  const device=/ipad|tablet|android(?!.*mobile)/i.test(navigator.userAgent)?'Tablet':/mobi/i.test(navigator.userAgent)?'Mobile':'Desktop';
  fetch('/api/analytics/events',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),visitor:visitor.id,session:visit.id,returning:visit.returning,source:visit.source,device,kind,target,path,consent:true})}).catch(()=>{});
 }
 function start(){if(!seen&&choice?.value==='allow'&&!restricted()){seen=true;track('pageview');}}
 let panel;
 function preferences(){
  if(!panel){panel=document.createElement('section');panel.className='analytics-consent';panel.setAttribute('aria-label','Analytics preferences');panel.innerHTML='<div><strong>Help us improve DMC24?</strong><p>Allow anonymous analytics to understand pages visited, approximate country, device and brochure interest. No names or raw IP addresses are collected. Your choice is remembered for 90 days. You can change it anytime using Analytics preferences.</p></div><div class="analytics-consent-actions"><button class="btn btn-outline" data-choice="decline">Decline analytics</button><button class="btn btn-primary" data-choice="allow">Allow analytics</button></div>';document.body.append(panel);panel.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{choice={value:b.dataset.choice,expires:Date.now()+90*86400000};storage.write(key,choice);if(choice.value==='decline'){storage.remove(visitorKey);storage.remove(sessionKey,true);}panel.hidden=true;start();});}
  panel.hidden=false;if(restricted()){panel.querySelector('p').textContent='Analytics is disabled because your browser sends a Do Not Track or Global Privacy Control preference.';panel.querySelector('[data-choice=allow]').hidden=true;}
 }
 document.querySelectorAll('.analytics-preference-link').forEach(e=>e.remove());
 const settings=document.createElement('button');settings.type='button';settings.className='analytics-preference-link';settings.textContent='Analytics preferences';settings.onclick=preferences;(document.querySelector('footer')||document.body).append(settings);
 if(!choice&&!restricted())preferences();else start();
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;try{const u=new URL(a.href,location.href);if(u.origin===location.origin&&(/\/request-demo(?:\.html)?$/.test(u.pathname)||/\/contact(?:\.html)?$/.test(u.pathname)&&u.hash==='#demo'))track('demo','demo');}catch{}});
 document.addEventListener('dmc24-brochure-success',e=>track('brochure',e.detail?.brochure||''));
};
modules['website-analytics']=function(){
 const root=document.querySelector('[data-analytics-dashboard]');if(!root)return;
 const form=root.querySelector('form'),message=root.querySelector('[role=status]'),exportButton=root.querySelector('[data-analytics-export]');
 const names=new Intl.DisplayNames(['en'],{type:'region'}),country=c=>c==='ZZ'?'Unknown':names.of(c)||c;
 const today=()=>new Date(Date.now()+19800000).toISOString().slice(0,10);
 let filters='',report=null,requestVersion=0;
 const text=(tag,value,className)=>{const e=document.createElement(tag);e.textContent=value;if(className)e.className=className;return e;};
 const api=async query=>{const r=await fetch('/api/analytics/admin?'+query,{cache:'no-store'}),data=await r.json();if(!r.ok)throw Error(data.error||'Could not load analytics.');return data;};
 function options(select,values,label=v=>v){const current=select.value;select.replaceChildren(new Option('All',''));values.forEach(v=>select.add(new Option(label(v),v)));select.value=current;}
 function table(id,rows,label=v=>v){const body=root.querySelector('#'+id);body.replaceChildren();if(!rows.length){const tr=document.createElement('tr'),td=text('td','No data for these filters.');td.colSpan=4;tr.append(td);body.append(tr);return;}rows.forEach(r=>{const tr=document.createElement('tr');for(const v of [label(r.label),r.views,r.visits,r.brochures])tr.append(text('td',v));body.append(tr);});}
 function breakdown(id,rows){const box=root.querySelector('#'+id);box.replaceChildren();const max=Math.max(1,...rows.map(r=>r.visits));if(!rows.length)box.append(text('p','No data yet.','analytics-muted'));rows.forEach(r=>{const line=document.createElement('div');line.className='analytics-bar';line.append(text('span',r.label),text('strong',r.visits+' visits'));const meter=document.createElement('meter');meter.min=0;meter.max=max;meter.value=r.visits;meter.setAttribute('aria-label',r.label+': '+r.visits+' visits');line.append(meter);box.append(line);});}
 function chart(rows){const counts=new Map(rows.map(r=>[r.day,r.views]));if(report){const days=[];for(let d=new Date(report.from+'T00:00:00Z');d.toISOString().slice(0,10)<=report.to;d.setUTCDate(d.getUTCDate()+1)){const day=d.toISOString().slice(0,10);days.push({day,views:counts.get(day)||0});}if(rows.length)rows=days;}const box=root.querySelector('#analytics-trend');box.replaceChildren();if(!rows.length){box.append(text('p','Your first consenting visit will appear here.','analytics-empty'));return;}const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1000 210');svg.setAttribute('role','img');svg.setAttribute('aria-label','Daily page views in India time. Exact figures are listed below.');const max=Math.max(1,...rows.map(r=>r.views)),step=1000/rows.length;rows.forEach((r,i)=>{const rect=document.createElementNS(svg.namespaceURI,'rect');rect.setAttribute('x',i*step+2);rect.setAttribute('y',185-r.views/max*170);rect.setAttribute('width',Math.max(1,step-4));rect.setAttribute('height',r.views/max*170);rect.setAttribute('rx','3');const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=r.day+': '+r.views+' page views';rect.append(title);svg.append(rect);});box.append(svg);box.append(text('p',rows[0].day+' — '+rows.at(-1).day,'analytics-muted'));const detail=document.createElement('details');detail.append(text('summary','Daily figures'));const list=document.createElement('ul');rows.forEach(r=>list.append(text('li',r.day+' · '+r.views+' views')));detail.append(list);box.append(detail);}
 function journeys(rows){const box=root.querySelector('#analytics-journeys');box.replaceChildren();if(!rows.length){box.append(text('p','No visits for these filters.','analytics-empty'));return;}rows.forEach((v,i)=>{const details=document.createElement('details');details.className='analytics-journey';details.append(text('summary',`${new Date(v.started).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} · ${country(v.country)} · ${v.device} · ${v.source} · ${v.views} views${v.brochures?' · Brochure requested':''}`));const content=document.createElement('div');details.append(content);let loaded=false;details.addEventListener('toggle',async()=>{if(!details.open||loaded)return;loaded=true;content.textContent='Loading journey…';try{const data=await api(filters+'&mode=journey&session='+encodeURIComponent(v.session));content.replaceChildren();const list=document.createElement('ol');data.rows.forEach(r=>list.append(text('li',new Date(r.occurred_at).toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})+' · '+(r.kind==='pageview'?'Viewed '+r.path:r.kind==='brochure'?'Requested '+r.target+' brochure on '+r.path:'Clicked Request a Demo on '+r.path))));content.append(list);}catch(e){content.textContent=e.message;loaded=false;}});box.append(details);});}
 async function load(){const version=++requestVersion;message.textContent='Loading analytics…';form.querySelector('button[type=submit]').disabled=true;exportButton.disabled=true;filters=new URLSearchParams(new FormData(form)).toString();try{const data=await api(filters);if(version!==requestVersion)return;report=data;const s=report.summary;for(const key of ['views','visitors','visits','brochures','demos'])root.querySelector('[data-metric='+key+']').textContent=Number(s[key]||0).toLocaleString();root.querySelector('[data-metric=conversion]').textContent=(s.visits?100*s.convertedVisits/s.visits:0).toFixed(1)+'%';root.querySelector('#analytics-visit-types').textContent=`${s.newVisits||0} new visits · ${s.returningVisits||0} returning visits`;table('analytics-pages',report.pages);table('analytics-countries',report.countries,country);breakdown('analytics-sources',report.sources);breakdown('analytics-devices',report.devices);chart(report.daily);journeys(report.visits);options(form.elements.country,report.options.countries,country);options(form.elements.path,report.options.pages);options(form.elements.product,report.options.products);message.textContent=`${report.from} to ${report.to} · India time · Refreshed ${new Date().toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata'})}`;exportButton.disabled=false;}catch(e){message.textContent=e.message;}finally{form.querySelector('button[type=submit]').disabled=false;}}
 form.addEventListener('submit',e=>{e.preventDefault();load();});
 root.querySelectorAll('[data-days]').forEach(b=>b.onclick=()=>{form.elements.to.value=today();form.elements.from.value=new Date(Date.now()-(Number(b.dataset.days)-1)*86400000+19800000).toISOString().slice(0,10);load();});
 exportButton.onclick=async()=>{exportButton.disabled=true;const query=filters;message.textContent='Preparing filtered CSV…';try{const rows=[];let offset=0;while(true){const data=await api(query+'&mode=events&offset='+offset);rows.push(...data.rows);offset+=data.rows.length;if(data.rows.length<200)break;if(offset>=100000){throw Error('Please narrow the date range to export fewer than 100,000 events.');}}const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,m=>"'"+m).replaceAll('"','""')+'"';const csv='\uFEFF'+[['Time (UTC)','Anonymous visit','Event','Page','Product','Brochure / action','Country','Source','Device','Returning visit'],...rows.map(r=>[r.occurred_at,r.session,r.kind,r.path,r.product,r.target,country(r.country),r.source,r.device,r.returning?'Yes':'No'])].map(r=>r.map(cell).join(',')).join('\r\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='DMC24-Website-Analytics.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);message.textContent='Exported '+rows.length+' anonymous analytics events.';}catch(e){message.textContent=e.message;}finally{exportButton.disabled=false;}};
 form.elements.to.value=today();form.elements.from.value=new Date(Date.now()-29*86400000+19800000).toISOString().slice(0,10);load();
};

modules['user-management']=function(){
 const form=document.getElementById('um-form'),msg=document.getElementById('um-message');let users=[],catalog=[],selected=null,dirty=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function api(body){const r=await fetch('/api/admin/users',body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'});const v=await r.json();if(!r.ok)throw Error(v.error||'Unable to load users.');return v;}
 function perms(){const p={};form.querySelectorAll('[data-module]:checked').forEach(c=>(p[c.dataset.module]??=[]).push(c.value));return p;}
 function matrix(p={}){document.getElementById('um-permissions').innerHTML=catalog.map(m=>'<tr><th scope="row">'+esc(m.title)+'</th>'+['view','edit','publish','export','send'].map(a=>'<td>'+(m.actions.includes(a)?'<input type="checkbox" data-module="'+m.id+'" value="'+a+'" aria-label="'+esc(m.title+' '+a)+'" '+(p[m.id]?.includes(a)?'checked':'')+'>':'—')+'</td>').join('')+'</tr>').join('');}
 function edit(u){if(dirty&&!confirm('Discard unsaved user changes?'))return;selected=u||null;form.reset();form.elements.name.value=u?.name||'';form.elements.email.value=u?.email||'';form.elements.status.value=u?.status==='inactive'?'inactive':'active';document.getElementById('um-heading').textContent=u?'Edit '+u.name:'Add a user';matrix(u?.permissions);document.getElementById('um-reset').hidden=!u||u.status==='inactive';document.getElementById('um-setup').hidden=true;document.getElementById('um-link').value='';dirty=false;}
 function list(){const q=document.getElementById('um-search').value.toLowerCase();document.getElementById('um-list').innerHTML=users.filter(u=>(u.name+' '+u.email).toLowerCase().includes(q)).map(u=>'<button type="button" class="user-account-row" data-user="'+esc(u.id)+'"><strong>'+esc(u.name)+'</strong><span>'+esc(u.email)+'</span><small>'+esc(u.status)+' · '+Object.values(u.permissions).filter(x=>x.includes('view')).length+' modules</small></button>').join('')||'<p>No users found. Add your first team member.</p>';}
 async function load(){const v=await api();users=v.users;catalog=v.modules;list();const name=id=>id==='admin'?'Admin':users.find(u=>u.id===id)?.name||id;document.getElementById('um-audit').innerHTML=v.logs.map(l=>'<tr><td>'+esc(new Date(l.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}))+'</td><td>'+esc(name(l.actor))+'</td><td>'+esc(l.event)+'</td><td>'+esc(name(l.target))+'</td></tr>').join('');}
 function setup(v){if(v.setupPath){document.getElementById('um-setup').hidden=false;document.getElementById('um-link').value=location.origin+v.setupPath;}}
 form.oninput=()=>{dirty=true;};form.onchange=e=>{dirty=true;const c=e.target;if(c.dataset.module){const boxes=[...form.querySelectorAll('[data-module="'+c.dataset.module+'"]')];if(c.value==='view'&&!c.checked)boxes.forEach(x=>x.checked=false);else if(c.checked)boxes.find(x=>x.value==='view').checked=true;document.getElementById('um-preset').value='custom';}};
 document.getElementById('um-preset').addEventListener('change',e=>{const p={},type=e.target.value;if(type==='custom')return;for(const m of catalog){if(type==='read')p[m.id]=['view'];if(type==='sales'&&['demos','brochures'].includes(m.id))p[m.id]=m.actions;if(type==='marketing'&&['blogs','seo','analytics'].includes(m.id))p[m.id]=m.actions.filter(x=>['view','edit'].includes(x));if(type==='commercial'&&m.id==='plans')p[m.id]=['view','edit'];}matrix(p);dirty=true;});
 form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;msg.textContent='Saving…';try{const v=await api({action:'save',id:selected?.id,revision:selected?.revision||0,name:form.elements.name.value,email:form.elements.email.value,status:form.elements.status.value,permissions:perms()});const email=form.elements.email.value.trim().toLowerCase();dirty=false;await load();edit(users.find(u=>u.email===email));setup(v);msg.textContent='User saved. Existing sessions for this user have been revoked.';}catch(e){msg.textContent=e.message;}finally{button.disabled=false;}};
 document.getElementById('um-reset').onclick=async function(){if(!selected||!confirm('Revoke this user’s sessions and issue a new password setup link?'))return;this.disabled=true;try{const v=await api({action:'reset',id:selected.id,revision:selected.revision});const id=selected.id;dirty=false;await load();edit(users.find(u=>u.id===id));setup(v);msg.textContent='New setup link issued. Previous links and password are invalid.';}catch(e){msg.textContent=e.message;}finally{this.disabled=false;}};
 document.getElementById('um-new').onclick=()=>edit(null);document.getElementById('um-search').oninput=list;document.getElementById('um-list').onclick=e=>{const b=e.target.closest('[data-user]');if(b)edit(users.find(u=>u.id===b.dataset.user));};document.getElementById('um-copy').onclick=async()=>{try{await navigator.clipboard.writeText(document.getElementById('um-link').value);msg.textContent='Link copied. Share it privately with this user.';}catch{document.getElementById('um-link').select();msg.textContent='Select and copy the setup link.';}};
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});load().then(()=>edit(null)).catch(e=>msg.textContent=e.message);
};
modules['admin-login']=function(){
 const form=document.querySelector('[data-admin-login]');if(!form)return;
 const setupToken=new URLSearchParams(location.hash.slice(1)).get('setup');if(setupToken){history.replaceState(null,'',location.pathname);document.getElementById('admin-login-title').textContent='Set your password';form.elements.username.closest('label').hidden=true;form.elements.username.required=false;form.elements.password.minLength=12;form.elements.password.maxLength=128;form.elements.password.autocomplete='new-password';form.querySelector('[type=submit]').textContent='Save password';const note=document.createElement('p');note.textContent='Choose a password of 12–128 characters. After saving, sign in with your email address.';form.prepend(note);form.addEventListener('submit',async e=>{e.preventDefault();e.stopImmediatePropagation();const btn=form.querySelector('[type=submit]'),msg=form.querySelector('[role=status]');btn.disabled=true;try{const r=await fetch('/api/auth/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:setupToken,password:form.elements.password.value})}),v=await r.json();if(!r.ok)throw Error(v.error);form.elements.password.value='';location.assign('/admin/login');}catch(e){msg.textContent=e.message;}finally{btn.disabled=false;}});}
 const msg=form.querySelector('[role=status]'),submit=form.querySelector('[type=submit]'),password=form.elements.password;
 form.querySelector('[data-password-toggle]').onclick=function(){password.type=password.type==='password'?'text':'password';this.textContent=password.type==='password'?'Show':'Hide';this.setAttribute('aria-pressed',String(password.type==='text'));};
 form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;submit.disabled=true;msg.textContent='Signing in…';try{const r=await fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:form.elements.username.value.trim(),password:password.value,returnTo:new URLSearchParams(location.search).get('returnTo')||'/admin'})}),result=await r.json();if(!r.ok)throw Error(result.error||'Unable to sign in.');password.value='';location.assign(result.redirect);}catch(e){msg.textContent=e.message;}finally{submit.disabled=false;}});
};
modules['admin-dashboard']=function(){
 const box=document.querySelector('[data-admin-cards]');if(!box)return;
 const links=JSON.parse(document.querySelector('#admin-navigation')?.textContent||'[]');
 for(const item of links){const card=document.createElement('a');card.className='admin-hub-card';card.href=item.path;const icon=document.createElement('span');icon.className='admin-hub-icon';icon.textContent=item.icon;icon.setAttribute('aria-hidden','true');const h=document.createElement('h2');h.textContent=item.title;const p=document.createElement('p');p.textContent=item.description;const action=document.createElement('strong');action.textContent='Open '+item.title+' →';card.append(icon,h,p,action);box.append(card);}
};
modules['admin-shell']=function(){
 const boot=document.querySelector('#admin-navigation');if(!boot)return;
 const bar=document.createElement('nav');bar.className='admin-session-bar';bar.setAttribute('aria-label','Admin panel');
 bar.innerHTML='<a href="/admin" class="admin-session-brand">DMC24 <span>Admin panel</span></a><div class="admin-session-links"></div><div class="admin-session-actions"><span>Signed in as Admin</span><button type="button" data-admin-logout>Log out</button></div>';
 for(const item of JSON.parse(boot.textContent)){const a=document.createElement('a');a.href=item.path;a.textContent=item.title;if(location.pathname.replace(/\.html$/,'')===item.path)a.setAttribute('aria-current','page');bar.querySelector('.admin-session-links').append(a);}
 document.body.prepend(bar);document.body.classList.add('admin-authenticated');
 const realFetch=window.fetch.bind(window);let expired=false;
 function expiredMessage(){if(expired)return;expired=true;const notice=document.createElement('div');notice.className='admin-expiry-notice';notice.setAttribute('role','alert');const p=document.createElement('p');p.textContent='Your admin session has expired. Sign in again before continuing. Unsaved edits on this page have not been submitted.';const a=document.createElement('a');a.href='/admin/login?returnTo='+encodeURIComponent(location.pathname);a.textContent='Sign in again';a.className='btn btn-primary';notice.append(p,a);document.body.prepend(notice);}
 window.fetch=async function(input,options){const r=await realFetch(input,options);try{const u=new URL(typeof input==='string'?input:input.url,location.href);if(u.origin===location.origin&&/^\/api\/(?:admin|pricing\/admin|brochure-leads|analytics\/admin)/.test(u.pathname)&&r.status===401)expiredMessage();}catch{}return r;};
 const access=JSON.parse(document.getElementById('admin-permissions')?.textContent||'{}');bar.querySelector('.admin-session-actions span').textContent='Signed in as '+(access.name||'Admin');
 if(!access.superAdmin){const map={'website-analytics':'analytics','brochure-enquiries':'brochures','plan-management-review':'plans','plan-management':'plans','seo-management':'seo','demo-requests':'demos','blog-management':'blogs','email-automation':'email'},m=map[location.pathname.replace(/^\//,'').replace(/\.html$/,'')],rights=access.permissions?.[m]||[];const note=document.createElement('p');note.className='admin-access-note';note.textContent='Your permissions: '+(rights.join(', ')||'No modules assigned')+'. Contact your Super Admin to change access.';bar.after(note);
 function limitControls(){document.querySelectorAll('button,a[download]').forEach(b=>{if(b.closest('.admin-session-bar'))return;const t=(b.textContent||'').trim();let action=null;if(/export|download csv/i.test(t))action='export';else if(/publish|unpublish|archive/i.test(t))action='publish';else if(/^(save|create|add article|upload|delete|apply|copy to|update status)/i.test(t))action='edit';else if(m==='email'&&/^retry/i.test(t))action='send';if(action&&!rights.includes(action)){b.hidden=true;b.setAttribute('aria-hidden','true');}});if(m==='email')for(const id of ['em-senderName','em-sender','em-replyTo','em-tenantId','em-clientId','em-secret','em-enabled','em-test-recipient','em-test']){const e=document.getElementById(id);if(e)e.disabled=true;}}
 limitControls();new MutationObserver(limitControls).observe(document.querySelector('main')||document.body,{childList:true,subtree:true});}
 bar.querySelector('[data-admin-logout]').onclick=async function(){this.disabled=true;try{const r=await realFetch('/api/auth/logout',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error();location.replace('/admin/login');}catch{this.disabled=false;this.textContent='Retry logout';}};
 window.addEventListener('pagehide',()=>document.body.classList.add('admin-checking'));
 // A bfcache restore must re-check authentication before displaying private data.
 window.addEventListener('pageshow',async e=>{if(!e.persisted)return;document.body.classList.add('admin-checking');try{const r=await realFetch('/api/auth/session',{cache:'no-store'});if(!r.ok||!(await r.json()).authenticated){location.replace('/admin/login');return;}document.body.classList.remove('admin-checking');}catch{location.replace('/admin/login');}});
};

modules['published-page-seo']=function(){
 const node=document.getElementById('published-page-seo');if(!node)return;
 const settings=JSON.parse(node.textContent);
 if(settings.h1){const h=document.querySelector('h1');if(h)h.textContent=settings.h1;}
 if(settings.breadcrumb){const label=document.querySelector('.site-breadcrumbs [aria-current="page"]');if(label)label.textContent=settings.breadcrumb;}
};
modules['seo-management']=function(){
 const root=document.querySelector('[data-seo-manager]');if(!root)return;
 const q=s=>root.querySelector(s),form=q('[data-seo-form]'),status=q('[data-seo-status]'),list=q('[data-seo-pages]');
 const textFields=['title','description','h1','keyword','breadcrumb','canonical','ogTitle','ogDescription','ogImage','ogImageAlt'],booleans=['index','follow','sitemap'];
 let catalog=[],origin=location.origin,page=null,dirty=false,busy=false,requestId=0;
 const say=s=>status.textContent=s;
 async function api(path,body){const r=await fetch('/api/admin/seo/'+path,{cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to load SEO settings.');return data;}
 function values(){return Object.fromEntries([...textFields.map(k=>[k,form.elements[k].value.trim()]),...booleans.map(k=>[k,form.elements[k].checked])]);}
 function controls(){form.querySelectorAll('fieldset').forEach(f=>f.disabled=busy);q('[data-seo-save]').disabled=busy||!page||!dirty;q('[data-seo-publish]').disabled=busy||!page||dirty||page.revision===0||page.revision===page.publishedRevision;q('[data-seo-reset]').disabled=busy||!page;q('[data-seo-reload]').disabled=busy||!page;list.querySelectorAll('button').forEach(b=>b.disabled=busy);}
 function state(){if(!page)return;const when=page.publishedAt?' · Published '+new Date(page.publishedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST':'';q('[data-seo-state]').textContent=(dirty?'Unsaved changes':page.revision>page.publishedRevision?'Saved draft · Not yet published':page.publishedRevision?'Published settings':'Using original defaults')+when;controls();}
 function renderList(){
  const search=q('#seo-search').value.toLowerCase(),filter=q('#seo-filter').value;
  const visible=catalog.filter(p=>(p.label+' '+p.path+' '+p.title).toLowerCase().includes(search)&&(filter==='all'||filter==='draft'&&p.revision>p.publishedRevision||filter==='noindex'&&!p.index||p.category===filter));list.replaceChildren();
  for(const p of visible){const b=document.createElement('button');b.type='button';b.className='seo-page-option';if(p.slug===page?.slug)b.setAttribute('aria-current','page');const name=document.createElement('strong');name.textContent=p.label;const path=document.createElement('span');path.textContent=p.path;const badge=document.createElement('small');badge.textContent=[p.revision>p.publishedRevision?'Draft':p.publishedRevision?'Published':'Default',...(!p.index?['Noindex']:[]),...(!p.visible?['Hidden']:[])].join(' · ');b.append(name,path,badge);b.onclick=()=>selectPage(p.slug);list.append(b);}
  q('[data-seo-count]').textContent=visible.length+' of '+catalog.length+' pages';if(!visible.length){const p=document.createElement('p');p.textContent='No matching pages.';list.append(p);}controls();
 }
 async function loadCatalog(){const data=await api('catalog');catalog=data.pages;origin=data.origin;q('[data-seo-total]').textContent=catalog.length;q('[data-seo-drafts]').textContent=catalog.filter(p=>p.revision>p.publishedRevision).length;q('[data-seo-noindex]').textContent=catalog.filter(p=>!p.index).length;q('[data-seo-hidden]').textContent=catalog.filter(p=>!p.visible).length;
  const selected=form.elements.canonical.value;form.elements.canonical.replaceChildren(new Option('This page (automatic)',''));catalog.forEach(p=>form.elements.canonical.add(new Option(p.label+' · '+p.path,p.path)));form.elements.canonical.value=selected;renderList();
 }
 function fill(settings){for(const k of textFields)form.elements[k].value=settings[k];for(const k of booleans)form.elements[k].checked=settings[k];dirty=false;preview();state();}
 function preview(){if(!page)return;const v=values();q('[data-count=title]').textContent=v.title.length+' / 60';q('[data-count=description]').textContent=v.description.length+' / 160';q('[data-preview-url]').textContent=origin+(v.canonical||page.path);q('[data-preview-title]').textContent=v.title||'Your page title';q('[data-preview-description]').textContent=v.description||'Your page description';q('[data-preview-og-title]').textContent=v.ogTitle||v.title;q('[data-preview-og-description]').textContent=v.ogDescription||v.description;
  const box=q('[data-preview-image]');if(box.dataset.url!==v.ogImage){box.dataset.url=v.ogImage;box.replaceChildren();if(v.ogImage){try{const u=new URL(v.ogImage,origin);if(u.protocol!=='https:')throw Error();const img=document.createElement('img');img.src=u.href;img.alt=v.ogImageAlt||'Social sharing image preview';img.width=1200;img.height=630;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{if(box.dataset.url===v.ogImage)box.textContent='Image could not be loaded. Check its URL before publishing.';};box.append(img);}catch{box.textContent='Enter a valid HTTPS image URL.';}}else box.textContent='No social image selected';}
  const checks=[];checks.push(v.title.length<=60?'Title is within the editorial target.':'Title exceeds 60 characters; consider shortening it.');checks.push(v.description.length<=160?'Description is within the editorial target.':'Description exceeds 160 characters; consider shortening it.');
  if(catalog.some(p=>p.slug!==page.slug&&p.title.toLowerCase()===v.title.toLowerCase()))checks.push('Another published page uses this title. Make it distinct.');
  if(v.keyword){const key=v.keyword.toLowerCase();checks.push(v.title.toLowerCase().includes(key)?'Primary phrase appears in the title.':'Consider using the primary phrase naturally in the title.');checks.push(v.description.toLowerCase().includes(key)?'Primary phrase appears in the description.':'Consider using the primary phrase naturally in the description.');}
  if(!v.index)checks.push('Noindex: this page will be excluded from search indexing and sitemap.');else if(!v.sitemap)checks.push('Sitemap inclusion is off. The page may still be indexed.');
  if(v.canonical&&v.canonical!==page.path)checks.push('Canonical points to another page. This page will be excluded from the sitemap.');
  if(catalog.find(p=>p.slug===page.slug)?.visible===false)checks.push('Destination is hidden. SEO settings will not make it visible.');
  if(v.h1)checks.push('The H1 override will change the visible heading.');if(v.ogImage&&!v.ogImageAlt)checks.push('Add an image description for social accessibility.');
  const ul=q('[data-seo-checklist]');ul.replaceChildren();for(const t of checks){const li=document.createElement('li');li.textContent=t;ul.append(li);}
 }
 async function selectPage(slug,force=false){if(busy)return;if(dirty&&!force&&!window.confirm('Discard unsaved SEO edits and load this page?'))return;busy=true;controls();say('Loading page settings…');const id=++requestId;try{const result=await api(slug);if(id!==requestId)return;page=result;form.hidden=false;q('[data-seo-empty]').hidden=true;q('[data-seo-label]').textContent=page.label;q('[data-seo-category]').textContent=page.category;q('[data-seo-live]').href=page.path;form.elements.h1.placeholder=page.heading;form.elements.breadcrumb.placeholder=page.label;q('[data-seo-schema]').textContent=page.schemaTypes.join(' · ');fill(page.draft);history.replaceState(null,'','?page='+encodeURIComponent(slug));say('Settings loaded. Changes remain a draft until you publish.');}catch(e){say(e.message);}finally{busy=false;renderList();state();}}
 form.addEventListener('input',()=>{dirty=[...textFields,...booleans].some(k=>values()[k]!==page.draft[k]);preview();state();});form.addEventListener('change',()=>{dirty=[...textFields,...booleans].some(k=>values()[k]!==page.draft[k]);preview();state();});
 form.addEventListener('submit',async e=>{e.preventDefault();if(busy||!page||!form.reportValidity())return;const settings=values();busy=true;controls();say('Saving draft…');try{const result=await api(page.slug+'/draft',{revision:page.revision,settings});page.revision=result.revision;page.draft=settings;dirty=false;say('Draft saved. Review the previews, then publish to update the website.');try{await loadCatalog();}catch{say('Draft saved. Page list could not refresh; reload to refresh the list.');}}catch(e){say(e.message);}finally{busy=false;state();}});
 q('[data-seo-publish]').onclick=async()=>{if(busy||dirty||!page)return;busy=true;controls();say('Publishing saved draft…');try{await api(page.slug+'/publish',{revision:page.revision});page.published={...page.draft};page.publishedRevision=page.revision;page.publishedAt=new Date().toISOString();say('Published. The page HTML and sitemap now use these settings. Search engine updates depend on recrawling.');try{await loadCatalog();}catch{say('Published. Page list could not refresh; reload to refresh the list.');}}catch(e){say(e.message);}finally{busy=false;state();}};
 q('[data-seo-reset]').onclick=()=>{if(!page)return;fill(page.defaults);dirty=[...textFields,...booleans].some(k=>values()[k]!==page.draft[k]);state();say('Original defaults loaded into the editor. Save and publish to apply them.');};
 q('[data-seo-reload]').onclick=()=>page&&selectPage(page.slug);
 q('#seo-search').addEventListener('input',renderList);q('#seo-filter').addEventListener('change',renderList);
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 loadCatalog().then(()=>{const wanted=new URLSearchParams(location.search).get('page');return selectPage(catalog.some(p=>p.slug===wanted)?wanted:(catalog.find(p=>p.slug==='index')||catalog[0])?.slug);}).catch(e=>{say(e.message);const retry=document.createElement('button');retry.type='button';retry.className='btn btn-outline';retry.textContent='Retry loading';retry.onclick=()=>location.reload();q('[data-seo-empty]').append(retry);});
};

modules['shared-demo']=function(){
 const variants=['Business','Professional','Professional Plus','Enterprise'];
 const form=document.querySelector('#shared-demo-form');
 function contextLink(a){
  let u;try{u=new URL(a.getAttribute('href'),location.href)}catch{return;}
  if(u.origin!==location.origin||a.closest('.admin-shell'))return;
  const demo=/^\/request-demo(?:\.html)?\/?$/.test(u.pathname)||(/^\/contact(?:\.html)?\/?$/.test(u.pathname)&&u.hash==='#demo')||(u.pathname===location.pathname&&u.hash==='#demo'&&!form)||(/demo|demonstration/i.test(a.textContent)&&/^\/contact(?:\.html)?\/?$/.test(u.pathname));
  if(!demo||a.dataset.demoLinked)return;
  let variant=a.dataset.demoVariant||u.searchParams.get('variant')||'';const card=a.closest('.sl-plan,.price-card,.pricing-card,.plan-card,.pricing-grid > *');
  const title=card?.querySelector('h2,h3')?.textContent||'';if(/enterprise/i.test(title))variant='Enterprise';else if(/professional\s*(plus|pro)|pro\s*plus/i.test(title))variant='Professional Plus';else if(/professional/i.test(title))variant='Professional';else if(/business/i.test(title))variant='Business';
  const target=new URL('/request-demo',location.origin);target.searchParams.set('source',u.searchParams.get('source')||location.pathname);if(variant)target.searchParams.set('variant',variant);
  const country=a.dataset.demoDestination||u.searchParams.get('destination')||document.querySelector('[data-country]')?.dataset.country||page;target.searchParams.set('destination',country==='uae'?'dubai':country);
  a.href=target.pathname+target.search;a.dataset.demoLinked='true';
 }
 function scan(root){root.querySelectorAll?.('a[href]').forEach(contextLink);}
 scan(document);const observer=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes){if(n.nodeType===1){if(n.matches('a[href]'))contextLink(n);scan(n);}}});observer.observe(document.body,{childList:true,subtree:true});
 if(!form)return;
 const notice=document.querySelector('#demo-form-status'),submit=form.querySelector('[type=submit]'),retry=document.querySelector('#demo-retry-options');let config,countries=[],selected=new Set(),id=crypto.randomUUID(),sending=false,complete=false;
 form.noValidate=true;notice.tabIndex=-1;
 function showError(message,field){notice.textContent=message;notice.setAttribute('role','alert');notice.focus();field?.setAttribute('aria-invalid','true');}
 form.addEventListener('input',e=>e.target.removeAttribute('aria-invalid'));
 const params=new URLSearchParams(location.search);let source=params.get('source')||location.pathname,destination=params.get('destination')||'',variant=variants.includes(params.get('variant'))?params.get('variant'):'';
 if(!params.has('source')){try{const ref=new URL(document.referrer);if(ref.origin===location.origin)source=ref.pathname}catch{}}
 const label=(tag,value)=>{const el=document.createElement(tag);el.textContent=value;return el;};
 function code(value){return countries.find(x=>x.name.toLowerCase()===value.trim().toLowerCase()||x.code===value.trim().toUpperCase())?.code;}
 function chips(){const wrap=document.querySelector('#demo-selected-countries');wrap.replaceChildren();for(const c of selected){const b=label('button',countries.find(x=>x.code===c).name+' ×');b.type='button';b.className='demo-chip';b.setAttribute('aria-label','Remove '+countries.find(x=>x.code===c).name);b.onclick=()=>{selected.delete(c);chips()};wrap.append(b);}}
 document.querySelector('#demo-add-country').onclick=()=>{const input=document.querySelector('#demo-operating-search'),c=code(input.value);if(!c){notice.textContent='Choose a country from the country list.';input.focus();return;}selected.add(c);input.value='';chips();notice.textContent='';};
 document.querySelector('#demo-operating-search').addEventListener('change',e=>{const c=code(e.target.value);if(c){selected.add(c);e.target.value='';chips();notice.textContent='';}});
 document.querySelector('#demo-operating-search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.querySelector('#demo-add-country').click();}});
 async function options(){retry.hidden=true;submit.disabled=true;notice.textContent='Loading form options…';try{const res=await fetch('/api/demo-options',{cache:'no-store'});if(!res.ok)throw Error('Could not load the form. Please retry.');config=await res.json();const names=new Intl.DisplayNames(['en'],{type:'region'});countries=config.codes.map(c=>({code:c,name:names.of(c)})).sort((a,b)=>a.name.localeCompare(b.name));const list=document.querySelector('#demo-countries');list.replaceChildren(...countries.map(c=>{const o=document.createElement('option');o.value=c.name;return o}));
 for(const key of ['role','users','timing']){const el=form.elements[key],values=config[{role:'roles',users:'users',timing:'timings'}[key]];while(el.options.length>1)el.remove(1);for(const value of values)el.add(new Option(value,value));}
 const wrap=document.querySelector('#demo-solutions');wrap.replaceChildren();for(const value of config.solutions){const l=label('label','');l.className='demo-choice';const input=document.createElement('input');input.type='checkbox';input.name='solutions';input.value=value;l.append(input,label('span',value));wrap.append(l);}
 if(!config.destinations[destination])destination='';document.querySelector('#demo-context').textContent=[destination?'Destination: '+config.destinations[destination]:'',variant?'Variant: '+variant:''].filter(Boolean).join(' · ')||'A demonstration tailored to your business. Fields marked * are required.';
 notice.textContent='';submit.disabled=false;
 }catch(e){notice.textContent=e.message;retry.hidden=false;}}
 retry.onclick=options;options();
 form.addEventListener('submit',async e=>{e.preventDefault();if(sending||complete||!config)return;const invalid=[...form.elements].find(el=>el.willValidate&&!el.validity.valid);if(invalid){const label=document.querySelector('label[for="'+invalid.id+'"]')?.textContent|| (invalid.name==='consent'?'Contact consent':'Required field');showError(label.replace(/\s*\*$/, '')+': '+invalid.validationMessage,invalid);return;}const pending=document.querySelector('#demo-operating-search'),pendingCode=code(pending.value);if(pending.value.trim()&&!pendingCode){showError('Choose a valid operating country from the list.',pending);return;}if(pendingCode){selected.add(pendingCode);pending.value='';chips();}const data=Object.fromEntries(new FormData(form));const country=code(data.countryName),interests=[...form.querySelectorAll('[name=solutions]:checked')].map(x=>x.value);
 if(!country||!selected.size||!interests.length){showError(!country?'Select your company country from the list.':!selected.size?'Select at least one country you operate in.':'Select at least one solution of interest.',!country?form.elements.countryName:!selected.size?document.querySelector('#demo-operating-search'):form.querySelector('[name=solutions]'));return;}
 sending=true;submit.disabled=true;notice.setAttribute('role','status');notice.textContent='Saving your request…';try{const res=await fetch('/api/demo-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,id,country,destinations:[...selected],solutions:interests,source,destination,variant,consent:form.elements.consent.checked})});const result=await res.json();if(!res.ok)throw Error(result.error||'Unable to save your request. Please retry.');complete=true;notice.textContent='Thank you for your interest in DMC24. Our team will contact you to arrange a demonstration tailored to your business.';submit.textContent='Request received ✓';form.querySelectorAll('input,select,textarea,button').forEach(x=>x.disabled=true);notice.tabIndex=-1;notice.focus();}catch(e){showError(e.message);submit.disabled=false;}finally{sending=false;}});
};
modules['demo-requests']=function(){
 const body=document.querySelector('#demo-admin-rows');if(!body)return;const filter=document.querySelector('#demo-admin-filters'),notice=document.querySelector('#demo-admin-status'),prev=document.querySelector('#demo-admin-prev'),next=document.querySelector('#demo-admin-next');let offset=0,total=0,config={},query=new URLSearchParams(new FormData(filter)),generation=0;
 const names=new Intl.DisplayNames(['en'],{type:'region'}),country=c=>{try{return names.of(c)}catch{return c}},ist=v=>new Date(v).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),array=s=>{try{return JSON.parse(s)}catch{return []}};
 async function request(path,options){const r=await fetch(path,{cache:'no-store',...options}),v=await r.json();if(!r.ok)throw Error(v.error||'Could not load demo requests.');return v;}
 async function rows(start,q=query){return request('/api/admin/demo-requests?'+q+'&offset='+start);}
 async function load(){const turn=++generation;prev.disabled=next.disabled=true;notice.textContent='Loading requests…';try{const data=await rows(offset);if(turn!==generation)return;total=data.total;body.replaceChildren();for(const r of data.rows){const tr=document.createElement('tr');const values=[ist(r.created_at),r.name+'\n'+r.email+'\n'+r.phone,r.company+'\n'+country(r.country),config.destinations?.[r.destination]||r.destination||'Not specified',r.variant||'Not specified',r.users+' users\n'+r.timing];for(const value of values){const td=document.createElement('td');td.textContent=value;td.className='demo-request-detail';tr.append(td);}
 const td=document.createElement('td'),details=document.createElement('details'),summary=document.createElement('summary');details.className='enquiry-details';summary.textContent='View requirements';const text=document.createElement('p');text.className='demo-request-detail';text.textContent='Operates in: '+array(r.destinations).map(country).join(', ')+'\nRole: '+(r.role||'—')+'\nSolutions: '+array(r.solutions).join(', ')+'\nCurrent software: '+(r.software||'—')+'\nMessage: '+(r.message||'—')+'\nContact consent: '+ist(r.consent_at);details.append(summary,text);td.append(details);tr.append(td);
 const src=document.createElement('td');src.className='enquiry-source';src.textContent=r.source;tr.append(src);const state=document.createElement('td'),select=document.createElement('select');select.className='demo-status-select';select.setAttribute('aria-label','Status for '+r.company+' — '+r.name);for(const v of ['New','Contacted','Demo Scheduled','Completed','Closed'])select.add(new Option(v,v));select.value=r.status;select.onchange=async()=>{select.disabled=true;try{const result=await request('/api/admin/demo-requests/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:r.id,revision:r.revision,status:select.value})});r.revision=result.revision;r.status=select.value;notice.textContent='Status saved.';if(query.get('status'))load();}catch(e){select.value=r.status;notice.textContent=e.message;}finally{select.disabled=false;}};state.append(select);tr.append(state);body.append(tr);}
 notice.textContent=total?`${offset+1}–${Math.min(offset+50,total)} of ${total} requests · IST`:'No matching demo requests.';prev.disabled=offset===0;next.disabled=offset+50>=total;
 }catch(e){if(turn===generation){notice.textContent=e.message;body.replaceChildren();}}}
 filter.onsubmit=e=>{e.preventDefault();query=new URLSearchParams(new FormData(filter));offset=0;load();};prev.onclick=()=>{offset=Math.max(0,offset-50);load();};next.onclick=()=>{offset+=50;load();};document.querySelector('#demo-refresh').onclick=load;
 document.querySelector('#demo-export').onclick=async function(){this.disabled=true;notice.textContent='Preparing CSV…';try{const list=[],q=new URLSearchParams(query);let start=0;while(true){const data=await rows(start,q);list.push(...data.rows);start+=data.rows.length;if(!data.rows.length||start>=data.total)break;}
 const cols=['Requested (IST)','Name','Email','Phone','Company','Company country','Operating destinations','Role','Users','Solutions','Current software','Implementation','Message','Source','Destination','Variant','Status','Consent (IST)'];const cell=v=>'"'+String(v??'').replace(/^[\s]*[=+@-]/,m=>"'"+m).replaceAll('"','""')+'"';const data=[cols,...list.map(r=>[ist(r.created_at),r.name,r.email,r.phone,r.company,country(r.country),array(r.destinations).map(country).join(', '),r.role,r.users,array(r.solutions).join(', '),r.software,r.timing,r.message,r.source,config.destinations?.[r.destination]||r.destination,r.variant,r.status,ist(r.consent_at)])].map(r=>r.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+data],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='DMC24-Demo-Requests.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice.textContent='Exported '+list.length+' requests.';
 }catch(e){notice.textContent=e.message;}finally{this.disabled=false;}};
 request('/api/demo-options').then(c=>{config=c;for(const [slug,name] of Object.entries(c.destinations).sort((a,b)=>a[1].localeCompare(b[1])))filter.elements.destination.add(new Option(name,slug));load();}).catch(e=>{notice.textContent=e.message;load();});
};

modules['faq-review']=function(){
 const root=document.querySelector('#faq-results');if(!root)return;
 const input=document.querySelector('#faq-search'),status=document.querySelector('#faq-search-status'),groups=[...root.querySelectorAll('.faq-category')],items=[...root.querySelectorAll('.faq-item')];
 const normal=s=>s.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'');
 document.querySelector('.faq-tools').hidden=false;
 function filter(){const q=normal(input.value.trim());let count=0,categories=0;for(const group of groups){let matches=0;const title=normal(group.querySelector('h2').textContent);for(const item of group.querySelectorAll('.faq-item')){const match=!q||normal(item.textContent+' '+title).includes(q);item.hidden=!match;if(q)item.open=match;else item.open=false;if(match)matches++;}group.hidden=!matches;const link=document.querySelector('[data-faq-category-link="'+group.dataset.faqCategory+'"]');link.hidden=!matches;link.querySelector('.faq-nav-count').textContent=matches;group.querySelector('.faq-category-count').textContent=matches+(matches===1?' answer':' answers');count+=matches;if(matches)categories++;}document.querySelector('#faq-empty').hidden=count!==0;status.textContent=count+' '+(count===1?'answer':'answers')+' across '+categories+' '+(categories===1?'category':'categories')+(q?' matching your search':'');}
 input.addEventListener('input',filter);document.querySelector('#faq-search-clear').onclick=()=>{input.value='';filter();input.focus();};
 document.querySelector('#faq-expand').onclick=()=>items.filter(x=>!x.hidden).forEach(x=>x.open=true);document.querySelector('#faq-collapse').onclick=()=>items.forEach(x=>x.open=false);
 function revealHash(){const id=decodeURIComponent(location.hash.slice(1));const target=document.getElementById(id);if(target?.classList.contains('faq-item')){if(target.hidden){input.value='';filter();}target.open=true;}}
 window.addEventListener('hashchange',revealHash);revealHash();
};

modules['blog-management-review']=function(){
 const categories=['DMC24 Updates','Streamline Operations','Increase Revenue','AI & DMC24','Integrations'];const key='dmc24-blog-review-v1';const seeds=JSON.parse(document.querySelector('#cms-seeds').textContent);let articles=seeds,current,dirty=false;try{const saved=JSON.parse(sessionStorage.getItem(key));if(Array.isArray(saved)&&saved.length)articles=saved;}catch{}
 const $=id=>document.getElementById(id),form=$('cms-form'),notice=$('cms-status');const fields=['title','category','author','excerpt','body','seoTitle','description','slug','alt','related'];
 for(const c of categories){form.elements.category.add(new Option(c,c));$('cms-filter').add(new Option(c,c));}
 function message(s){notice.textContent=s;}
 function collect(){const a={...current};for(const k of fields)a[k]=form.elements[k].value.trim();return a;}
 function persist(){try{sessionStorage.setItem(key,JSON.stringify(articles));return true;}catch{message('Browser storage is full or unavailable. Download this draft to keep it; try a smaller image.');return false;}}
 function render(){const q=$('cms-search').value.toLowerCase(),category=$('cms-filter').value,list=$('cms-list');list.replaceChildren();const shown=articles.filter(a=>(!category||a.category===category)&&(a.title+' '+a.excerpt).toLowerCase().includes(q));$('cms-count').textContent=shown.length;for(const a of shown){const b=document.createElement('button');b.type='button';b.className='cms-list-item';b.setAttribute('aria-pressed',String(a.id===current?.id));const tag=document.createElement('small'),title=document.createElement('strong'),state=document.createElement('span');tag.textContent=a.category;title.textContent=a.title||'Untitled article';state.textContent=a.status;b.append(tag,title,state);b.onclick=()=>{if(dirty&&!confirm('Discard unsaved edits and open this article?'))return;select(a);};list.append(b);}if(!shown.length)list.textContent='No articles match this search.';}
 function image(){const img=$('cms-image');img.hidden=!current.image;if(current.image)img.src=current.image;else img.removeAttribute('src');img.alt=form.elements.alt.value;}
 function update(){const a=collect();$('cms-title-count').textContent=a.seoTitle.length+'/60 characters'+(a.seoTitle.length>60?' — shorten the title':'');$('cms-description-count').textContent=a.description.length+'/160 characters'+(a.description.length>160?' — shorten the description':'');$('cms-search-url').textContent=location.origin+'/'+a.slug;$('cms-search-title').textContent=a.seoTitle||a.title||'Your article title';$('cms-search-description').textContent=a.description||a.excerpt;}
 function select(a){current={...a};for(const k of fields)form.elements[k].value=a[k]||'';if(!categories.includes(a.category))form.elements.category.value='Streamline Operations';form.elements.slug.readOnly=seeds.some(s=>s.id===a.id);$('cms-state').textContent=a.status;dirty=false;image();update();render();}
 function validate(publishing=false){if(!form.reportValidity())return false;const a=collect();if(!a.title||!a.body){message('Add an article title and content before saving.');return false;}if(articles.some(x=>x.id!==a.id&&x.slug===a.slug)){message('That URL slug is already used. Choose another.');return false;}if(publishing&&(!a.seoTitle||a.seoTitle.length>60||!a.description||a.description.length>160||a.image&&!a.alt)){message('Before simulated publishing, add an SEO title (up to 60 characters), description (up to 160) and alt text for your image.');return false;}if(a.related.split('\n').some(p=>p&&!/^\/[a-z0-9/-]+(?:#[a-z0-9-]+)?$/.test(p))){message('Related links must be internal paths, such as /mid-office.');return false;}return true;}
 function save(status){if(!validate(status==='Published · simulation'))return;current={...collect(),status,updated:new Date().toISOString()};const i=articles.findIndex(a=>a.id===current.id);if(i<0)articles.unshift(current);else articles[i]=current;if(persist()){dirty=false;$('cms-state').textContent=status;message(status==='Published · simulation'?'Publishing simulated. Your live website has not changed.':'Review copy saved in this browser tab’s session.');}render();}
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',()=>{dirty=true;update();});$('cms-search').oninput=render;$('cms-filter').onchange=render;$('cms-save').onclick=()=>save('Draft · review');$('cms-publish').onclick=()=>save('Published · simulation');$('cms-archive').onclick=()=>save('Archived · review');
 $('cms-new').onclick=()=>{if(dirty&&!confirm('Discard unsaved edits and create an article?'))return;select({id:'draft-'+Date.now(),title:'',category:categories[0],author:'DMC24 Editorial Team',status:'Unsaved draft',image:''});form.elements.title.focus();};
 form.elements.title.addEventListener('input',()=>{if(!seeds.some(a=>a.id===current.id)&&!current.slug)form.elements.slug.value=form.elements.title.value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');update();});
 $('cms-upload').onchange=async function(){const f=this.files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>1024*1024){message('Choose a JPG, PNG or WebP image up to 1 MB.');this.value='';return;}const r=new FileReader();r.onload=()=>{current.image=r.result;dirty=true;image();message('Image added to the review copy. Add descriptive alt text.');};r.readAsDataURL(f);};$('cms-remove-image').onclick=()=>{current.image='';$('cms-upload').value='';dirty=true;image();};
 $('cms-download').onclick=()=>{const a=collect(),url=URL.createObjectURL(new Blob([JSON.stringify(a,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=(a.slug||'dmc24-blog-draft')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Draft exported as JSON. This does not publish the article.');};
 $('cms-preview').onclick=()=>{const a=collect(),box=$('cms-article');box.replaceChildren();const add=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;box.append(el);return el;};add('small',a.category+' · '+a.author);add('h1',a.title||'Untitled article');add('p',a.excerpt).className='lead';if(a.image){const i=document.createElement('img');i.src=a.image;i.alt=a.alt;box.append(i);}for(const block of a.body.split(/\n\s*\n/)){if(block.startsWith('### '))add('h3',block.slice(4));else if(block.startsWith('## '))add('h2',block.slice(3));else if(block.startsWith('- ')){const ul=document.createElement('ul');for(const line of block.split('\n')){const li=document.createElement('li');li.textContent=line.replace(/^- /,'');ul.append(li);}box.append(ul);}else add('p',block);}const links=a.related.split('\n').filter(p=>/^\/[a-z0-9/-]+(?:#[a-z0-9-]+)?$/.test(p));if(links.length){add('h2','Explore related pages');for(const path of links){const link=document.createElement('a');link.href=path;link.target='_blank';link.rel='noopener';link.textContent=path;add('p','').append(link);}}$('cms-dialog').showModal();};$('cms-close').onclick=()=>$('cms-dialog').close();window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});select(articles[0]);
};

modules['blog-management']=function(){
 const $=id=>document.getElementById(id),form=$('cms-form'),editor=$('cms-content'),notice=$('cms-status');let records=[],current=null,dirty=false,busy=false;const fields=['title','slug','category','author','authorBio','authorUrl','excerpt','seoTitle','description','alt','related','publishedDate','ogTitle','ogDescription'];const categories=['DMC24 Updates','Streamline Operations','Increase Revenue','AI & DMC24','Integrations'];for(const c of categories){form.elements.category.add(new Option(c,c));$('cms-filter').add(new Option(c,c));}
 const message=s=>notice.textContent=s;async function api(path,body){const r=await fetch(path,{credentials:'same-origin',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});let data;try{data=await r.json();}catch{throw Error('Could not read the server response. Please retry.');}if(!r.ok)throw Error(data.error||'Request failed');return data;}
 function clean(raw){const d=new DOMParser().parseFromString(raw,'text/html');d.querySelectorAll('script,style,iframe,object,svg,math,template').forEach(n=>n.remove());for(const e of [...d.body.querySelectorAll('*')]){if(e.tagName==='DIV'){const p=d.createElement('p');p.append(...e.childNodes);e.replaceWith(p);continue;}if(!['P','H2','H3','STRONG','B','EM','I','U','UL','OL','LI','A','BR','BLOCKQUOTE'].includes(e.tagName)){e.replaceWith(...e.childNodes);continue;}for(const a of [...e.attributes])if(!(a.name==='id'&&/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/.test(a.value))&&!(e.tagName==='A'&&a.name==='href'&&/^(https:\/\/|mailto:|\/(?!\/)|[a-z0-9-]+\.html(?:#|$)|#[a-z0-9-]+)/i.test(a.value)))e.removeAttribute(a.name);}return d.body.innerHTML;}
 function collect(){const a={...(current?.draft||{})};for(const k of fields)a[k]=form.elements[k].value.trim();a.bodyHtml=clean(editor.innerHTML);a.image=current?.draft.image||'';return a;}
 function state(r){return r?.hasPublished?(r.revision>r.publishedRevision?'Published · unpublished edits':'Published'):r?.state==='archived'?'Archived':'Draft';}
 function list(){const q=$('cms-search').value.toLowerCase(),category=$('cms-filter').value,box=$('cms-list');box.replaceChildren();const filter=$('cms-status-filter').value;const shown=records.filter(r=>(filter==='all'||filter==='published'&&r.hasPublished||filter==='draft'&&!r.hasPublished&&r.state!=='archived'||filter==='archived'&&!r.hasPublished&&r.state==='archived')&&(!category||r.draft.category===category)&&(r.draft.title+' '+r.draft.excerpt).toLowerCase().includes(q));$('cms-count').textContent=shown.length;for(const r of shown){const b=document.createElement('button');b.type='button';b.className='cms-list-item';b.setAttribute('aria-pressed',String(r.id===current?.id));const c=document.createElement('small'),h=document.createElement('strong'),s=document.createElement('span');c.textContent=r.draft.category;h.textContent=r.draft.title;s.textContent=state(r);b.append(c,h,s);b.onclick=()=>{if(busy||dirty&&!confirm('Discard unsaved edits and open this article?'))return;select(r);};box.append(b);}if(!shown.length)box.textContent='No articles match your search.';}
 function image(){const img=$('cms-image');img.hidden=!current?.draft.image;if(!img.hidden)img.src=current.draft.image;else img.removeAttribute('src');img.alt=form.elements.alt.value;}
 function update(){const a=collect();$('cms-title-count').textContent=a.seoTitle.length+'/60 characters';$('cms-description-count').textContent=a.description.length+'/160 characters';$('cms-search-url').textContent=location.origin+'/'+a.slug;$('cms-search-title').textContent=a.seoTitle||a.title;$('cms-search-description').textContent=a.description||a.excerpt;}
 function select(r){current=JSON.parse(JSON.stringify(r));for(const k of fields)form.elements[k].value=r.draft[k]||'';editor.innerHTML=clean(r.draft.bodyHtml||'');form.elements.slug.readOnly=!!r.revision;$('cms-state').textContent=state(r);dirty=false;image();update();list();}
 async function load(){const data=await api('/api/admin/blogs');records=data.articles;const selected=records.find(r=>r.id===current?.id)||records.find(r=>r.hasPublished)||records[0];if(selected){$('cms-status-filter').value=selected.hasPublished?'published':selected.state==='archived'?'archived':'draft';select(selected);}else fresh();message('Library loaded. Draft changes stay private until you publish.');}
 function fresh(){const draft=Object.fromEntries(fields.map(k=>[k,'']));draft.category=categories[0];Object.assign(draft,{"author": "Vishal Shah", "authorBio": "Empowering process and people | Technology entrepreneur and consultant | 20+ years of experience | Business process expert | Travel technology consultant | Banking solutions", "authorUrl": "https://www.linkedin.com/in/vishalcshah/"});draft.bodyHtml='';draft.image='';select({id:crypto.randomUUID(),revision:0,hasPublished:false,state:'draft',draft});form.elements.title.focus();}
 async function run(fn){if(busy)return;busy=true;const controls=[...document.querySelectorAll('.cms-workspace button,.cms-workspace input,.cms-workspace select,.cms-workspace textarea')].filter(c=>!c.closest('.cms-order,#order-dialog'));const old=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);editor.contentEditable='false';try{await fn();}catch(e){message(e.message);}finally{controls.forEach((c,i)=>c.disabled=old[i]);editor.contentEditable='true';busy=false;}}
 function accept(r){const i=records.findIndex(x=>x.id===r.id);if(i<0)records.unshift(r);else records[i]=r;$('cms-status-filter').value=r.hasPublished?'published':r.state==='archived'?'archived':'draft';select(r);window.dispatchEvent(new Event('cms-articles-changed'));}
 async function save(){const a=collect();if(!a.title||!a.bodyHtml||!a.slug)throw Error('Add a title, URL slug and article content.');const data=await api('/api/admin/blogs/'+current.id+'/save',{revision:current.revision,article:a});accept(data.article);}
 form.onsubmit=e=>e.preventDefault();form.addEventListener('input',()=>{dirty=true;update();});editor.addEventListener('input',()=>{dirty=true;update();});editor.addEventListener('paste',e=>{e.preventDefault();const raw=e.clipboardData.getData('text/html');if(raw)document.execCommand('insertHTML',false,clean(raw));else document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));dirty=true;});
 form.elements.title.oninput=()=>{if(!current.revision)form.elements.slug.value=form.elements.title.value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');};
 document.querySelectorAll('[data-format],[data-block]').forEach(b=>{b.onmousedown=e=>e.preventDefault();b.onclick=()=>{editor.focus();document.execCommand(b.dataset.block?'formatBlock':b.dataset.format,false,b.dataset.block||null);dirty=true;};});$('cms-link').onmousedown=e=>e.preventDefault();$('cms-link').onclick=()=>{const url=prompt('Enter an HTTPS URL or an internal path, such as /mid-office');if(url&&/^(https:\/\/|\/(?!\/))/.test(url)){editor.focus();document.execCommand('createLink',false,url);dirty=true;}};
 $('cms-save').onclick=()=>run(async()=>{await save();message('Draft saved to the database. The live article is unchanged.');});
 $('cms-publish').onclick=()=>{if(!confirm('Publish this article and its current edits to the live website?'))return;run(async()=>{await save();const data=await api('/api/admin/blogs/'+current.id+'/publish',{revision:current.revision});accept(data.article);message('Published successfully: '+location.origin+'/'+current.slug);});};
 for(const action of ['unpublish','archive'])$('cms-'+action).onclick=()=>{if(!current.revision){message('Save the article first.');return;}if(!confirm((action==='archive'?'Archive':'Unpublish')+' this article? It will be removed from the public website. Unsaved edits will be discarded.'))return;run(async()=>{const data=await api('/api/admin/blogs/'+current.id+'/'+action,{revision:current.revision});accept(data.article);message(action==='archive'?'Article archived. You can edit and republish it later.':'Article unpublished. Its saved draft is available.');});};
 $('cms-new').onclick=()=>{if(dirty&&!confirm('Discard unsaved edits?'))return;fresh();};$('cms-reload').onclick=()=>{if(dirty&&!confirm('Discard unsaved edits and reload?'))return;run(load);};$('cms-status-filter').onchange=list;$('cms-search').oninput=list;$('cms-filter').onchange=list;
 $('cms-upload').onchange=function(){const f=this.files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>2*1024*1024){message('Use JPG, PNG or WebP up to 2 MB.');return;}run(async()=>{const r=await fetch('/api/admin/blog-media',{method:'POST',credentials:'same-origin',headers:{'Content-Type':f.type},body:f});const data=await r.json();if(!r.ok)throw Error(data.error||'Image upload failed');current.draft.image=data.url;dirty=true;image();message('Image uploaded. Add alt text and save your draft.');});};$('cms-remove-image').onclick=()=>{current.draft.image='';$('cms-upload').value='';dirty=true;image();};
 $('cms-download').onclick=()=>{const a=collect(),url=URL.createObjectURL(new Blob([JSON.stringify(a,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download=(a.slug||'dmc24-blog')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('cms-preview').onclick=()=>{const a=collect(),box=$('cms-article');box.replaceChildren();const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;box.append(e);};add('small',a.category+' · '+a.author);add('h1',a.title||'Untitled');add('p',a.excerpt);const bio=document.createElement('div');bio.className='author-bio';const name=document.createElement('p'),details=document.createElement('p');name.className='author-bio-name';name.textContent='By '+a.author;details.textContent=a.authorBio;bio.append(name,details);try{const url=new URL(a.authorUrl);if(url.protocol==='https:'&&!url.username&&!url.password){const link=document.createElement('a');link.href=url.href;link.textContent='Author profile';link.target='_blank';link.rel='noopener noreferrer';bio.append(link);}}catch{}box.append(bio);if(a.image){const img=document.createElement('img');img.src=a.image;img.alt=a.alt;box.append(img);}const body=document.createElement('div');body.innerHTML=clean(a.bodyHtml);box.append(body);$('cms-dialog').showModal();};$('cms-close').onclick=()=>$('cms-dialog').close();window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});run(load);
};

modules['blog-ordering']=function(){
 const $=id=>document.getElementById(id),panel=$('cms-order-panel'),list=$('order-list'),scope=$('order-scope'),status=$('order-status');let articles=[],settings={overall:[],categories:{},featured:''},revision=0,dirty=false,busy=false,dragId='',generation=0;
 const say=s=>status.textContent=s;async function request(path,body){const r=await fetch(path,{credentials:'same-origin',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'Could not update display order.');return data;}
 function ordered(){const category=scope.value,ids=category?(settings.categories[category]||[]):settings.overall,rank=new Map(ids.map((id,i)=>[id,i]));return articles.filter(a=>!category||a.category===category).sort((a,b)=>{const x=rank.get(a.id)??Infinity,y=rank.get(b.id)??Infinity;return x!==y?(x<y?-1:1):(b.date||'').localeCompare(a.date||'')||a.slug.localeCompare(b.slug);});}
 function visible(){return ordered().filter(a=>scope.value||a.id!==settings.featured);}
 function change(ids){if(scope.value)settings.categories[scope.value]=ids;else settings.overall=ids;dirty=true;draw();say('Unsaved ordering changes. Preview, then save or publish.');}
 function move(id,offset){if(busy)return;const ids=visible().map(a=>a.id),from=ids.indexOf(id),to=from+offset;if(from<0||to<0||to>=ids.length)return;ids.splice(from,1);ids.splice(to,0,id);change(ids);list.querySelector('[data-order-id="'+CSS.escape(id)+'"] button[data-move="'+offset+'"]')?.focus();}
 function draw(){const rows=visible(),feature=articles.find(a=>a.id===settings.featured);$('order-feature-summary').textContent=!scope.value&&feature?'Featured above this list: '+feature.title:'';list.replaceChildren();rows.forEach((a,i)=>{const li=document.createElement('li');li.className='cms-order-row';li.draggable=true;li.dataset.orderId=a.id;const number=document.createElement('span');number.className='cms-order-position';number.textContent=i+1;const info=document.createElement('div'),title=document.createElement('strong'),category=document.createElement('small');title.textContent=a.title;category.textContent=a.category;info.append(title,category);const actions=document.createElement('div');actions.className='cms-order-moves';for(const [offset,label]of [[-1,'Move up'],[1,'Move down']]){const b=document.createElement('button');b.type='button';b.dataset.move=offset;b.textContent=label;b.setAttribute('aria-label',label+': '+a.title);b.disabled=busy||(offset===-1?i===0:i===rows.length-1);b.onclick=()=>move(a.id,offset);actions.append(b);}li.append(number,info,actions);li.ondragstart=e=>{if(busy){e.preventDefault();return;}dragId=a.id;e.dataTransfer.setData('text/plain',a.id);e.dataTransfer.effectAllowed='move';li.classList.add('cms-order-row--dragging');};li.ondragend=()=>{dragId='';li.classList.remove('cms-order-row--dragging');};li.ondragover=e=>{if(dragId&&!busy){e.preventDefault();e.dataTransfer.dropEffect='move';}};li.ondrop=e=>{e.preventDefault();if(!dragId||busy||dragId===a.id)return;const ids=visible().map(x=>x.id),from=ids.indexOf(dragId),to=ids.indexOf(a.id);if(from<0||to<0)return;ids.splice(from,1);ids.splice(to,0,dragId);change(ids);};list.append(li);});if(!rows.length){const li=document.createElement('li');li.textContent='No published articles in this view.';list.append(li);}}
 function prune(){const map=new Map(articles.map(a=>[a.id,a]));settings.overall=settings.overall.filter(id=>map.has(id));for(const c of Object.keys(settings.categories))settings.categories[c]=settings.categories[c].filter(id=>map.get(id)?.category===c);if(!map.has(settings.featured))settings.featured='';}
 async function load(){const g=++generation,data=await request('/api/admin/blogs/order');if(g!==generation)return;articles=data.articles;revision=data.revision;settings=JSON.parse(JSON.stringify(data.draft));prune();const category=scope.value;scope.replaceChildren(new Option('All Articles — overall order',''));for(const c of data.categories)scope.add(new Option(c,c));scope.value=category;const select=$('order-featured');select.replaceChildren(new Option('No featured article',''));for(const a of [...articles].sort((a,b)=>a.title.localeCompare(b.title)))select.add(new Option(a.title,a.id));select.value=settings.featured;$('order-excluded').textContent=data.excluded.drafts+' draft and '+data.excluded.archived+' archived articles are excluded from website ordering. Use the article library’s status filter to edit them.';dirty=false;draw();say(data.revision>data.publishedRevision?'Ordering draft loaded. It has not been published.':'Current ordering loaded.');}
 async function run(fn){if(busy)return;busy=true;const controls=[...panel.querySelectorAll('button,select')];const old=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);try{await fn();}catch(e){say(e.message);}finally{controls.forEach((c,i)=>c.disabled=old[i]);busy=false;draw();}}
 async function save(){const result=await request('/api/admin/blogs/order/draft',{revision,settings});revision=result.revision;settings=result.draft;dirty=false;}
 scope.onchange=draw;$('order-featured').onchange=function(){settings.featured=this.value;dirty=true;draw();say('Featured choice changed. Publish order to apply it to the website.');};$('order-reset').onclick=()=>change([]);$('order-reload').onclick=()=>{if(dirty&&!confirm('Discard unsaved ordering changes and reload?'))return;run(load);};$('order-save').onclick=()=>run(async()=>{await save();say('Ordering draft saved. The website order is unchanged.');});$('order-publish').onclick=()=>{if(!confirm('Publish the overall order, all category orders and featured article to the website?'))return;run(async()=>{await save();const result=await request('/api/admin/blogs/order/publish',{revision});revision=result.revision;dirty=false;say('Display order published. The website now uses these priorities.');});};
 $('order-preview').onclick=()=>{const box=$('order-preview-grid');box.replaceChildren();const feature=!scope.value&&articles.find(a=>a.id===settings.featured),rows=feature?[feature,...visible()]:visible();$('order-preview-title').textContent=(scope.value||'All Articles')+' — ordering preview';for(const a of rows){const card=document.createElement('article');card.className='journal-card'+(a===feature?' journal-card--featured':'');if(a===feature){const label=document.createElement('span');label.className='journal-featured-label';label.textContent='Featured insight';card.append(label);}if(a.image){const img=document.createElement('img');img.className='cms-card-image';img.src=a.image;img.alt=a.alt;card.append(img);}const category=document.createElement('small'),h=document.createElement('h3'),p=document.createElement('p');category.textContent=a.category;h.textContent=a.title;p.textContent=a.excerpt;card.append(category,h,p);box.append(card);}if(!rows.length)box.textContent='No published articles to display.';$('order-dialog').showModal();};$('order-close').onclick=()=>$('order-dialog').close();window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});window.addEventListener('cms-articles-changed',()=>say('Article library changed. Reload ordering to include newly published articles and category changes.'));run(load);
};


modules['editorial-answers']=function(){
 const destinationAnswers={"bali": "Bali is known for beaches, temples, living cultural traditions, wellness retreats, private villas and outdoor experiences. DMC programmes often combine these with neighbouring island stays.", "botswana": "Botswana is known for the Okavango Delta, Chobe wildlife experiences, the Makgadikgadi salt pans and Kalahari landscapes. Safari programmes often connect remote camps by air and road.", "cambodia": "Cambodia is known for Angkor’s temples, Khmer heritage, Phnom Penh, rural experiences and southern coastal stays.", "dubai": "The UAE is known for luxury hotels, Dubai and Abu Dhabi city experiences, desert safaris, cultural attractions, theme parks and international events.", "egypt": "Egypt is known for ancient monuments, Nile journeys, Cairo’s cultural attractions and Red Sea resorts. Touring programmes often combine heritage visits with cruise or beach stays.", "hong-kong": "Hong Kong is known for Victoria Harbour, its skyline, food, shopping and cultural neighbourhoods. DMC itineraries can also include regional extensions to Macau and the Greater Bay Area.", "kenya": "Kenya is known for wildlife safaris, national parks and reserves, coastal stays and cultural experiences. Safari itineraries connect camps, lodges, park visits and ground or air transport.", "malaysia": "Malaysia is known for its cities, cultural heritage, food, islands and nature experiences. DMC programmes combine city stays, guided touring and regional or island extensions.", "maldives": "The Maldives is known for island resorts, beaches, marine experiences and honeymoon holidays. Resort programmes require coordinated accommodation offers and island transfers.", "mauritius": "Mauritius is known for beach resorts, island excursions, cultural experiences, nature and water activities. DMC programmes often combine hotel stays with transfers and locally sold excursions.", "namibia": "Namibia is known for the Namib Desert, Sossusvlei, Etosha wildlife experiences and the Atlantic coast. Touring programmes connect these landscapes through long-distance routes and lodge stays.", "oman": "Oman is known for forts, souqs, desert landscapes, wadis, mountain villages and coastal experiences. Round tours combine these with hotels, camps, guides and road transport.", "rwanda": "Rwanda is known for gorilla and primate trekking, Kigali, Lake Kivu and conservation-focused wildlife experiences. Touring programmes combine permits, accommodation and ground services.", "saudi-arabia": "Saudi Arabia is known for religious destinations, heritage sites, AlUla, modern cities and Red Sea landscapes. Programmes can combine cultural touring, events and religious ground services.", "seychelles": "Seychelles is known for beaches, granite islands, nature reserves, marine experiences and island resorts. Multi-island programmes connect stays on Mahé, Praslin and La Digue with air, sea and ground transfers.", "singapore": "Singapore is known for its skyline, gardens, family attractions, food and multicultural neighbourhoods. It also supports business events, cruise stays and regional travel combinations.", "south-africa": "South Africa is known for wildlife safaris, Cape Town, cultural experiences, winelands, coastlines and scenic touring routes. DMC programmes often combine cities, lodges and regional journeys.", "sri-lanka": "Sri Lanka is known for cultural heritage, beaches, tea-country landscapes, wildlife, temples and wellness experiences. Touring programmes often link several regions within one itinerary.", "tanzania": "Tanzania is known for Serengeti safaris, Ngorongoro, Kilimanjaro and Zanzibar. DMC programmes can combine wildlife circuits, mountain experiences and coastal stays.", "thailand": "Thailand is known for temples, city experiences, food, northern cultural touring and island resorts. DMC programmes combine guided tours, transfers and mainland or island stays.", "uganda": "Uganda is known for gorilla and chimpanzee trekking, wildlife safaris, Nile experiences and lake landscapes. Itineraries combine permit-led activities with accommodation and transport.", "vietnam": "Vietnam is known for cultural cities, Ha Long Bay, regional cuisine, coastal stays and the Mekong Delta. Touring programmes often connect several regions through road and domestic-flight sectors.", "zambia": "Zambia is known for wildlife safaris, Victoria Falls near Livingstone and Zambezi river experiences. Programmes connect lodge stays, parks, river activities and ground or air services.", "zimbabwe": "Zimbabwe is known for Victoria Falls, Hwange and Mana Pools wildlife experiences, and Great Zimbabwe heritage. DMC programmes combine these with scenic and regional journeys."};
 const answers={"What Changes During Adoption?": "Adoption brings structured data, agreed workflows and role-based training into daily operations. As teams use the system consistently, booking status, supplier actions, costs and profitability become easier to review.", "How Ready Is Your DMC?": "Readiness depends on an implementation owner, accessible supplier data, agreed workflows, training time and management support. Use the checklist below to identify gaps before starting a controlled pilot.", "Need market-specific pricing?": "Each destination page shows its configured plans, user allowances, setup fees and billing options. Review the relevant country page or request a commercial discussion for a tailored scope.", "How to Adopt DMC24?": "Prepare supplier and product data, agree departmental workflows, nominate an implementation owner and train teams by role. Start with a controlled pilot, then expand the rollout as the team becomes ready."};
 const main=document.querySelector('main');if(!main)return;
 for(const h of main.querySelectorAll('h2,h3')){
  const heading=h.textContent.trim();
  const answer=heading.startsWith('What Is ')&&heading.endsWith(' Famous For?')?destinationAnswers[page]:answers[heading];
  if(!answer)continue;
  let p=h.nextElementSibling;
  if(['Need market-specific pricing?','How to Adopt DMC24?'].includes(heading)&&p?.tagName==='P')p.classList.add('editorial-answer');
  if(!p?.classList.contains('editorial-answer')){p=document.createElement('p');p.className='editorial-answer';h.after(p);}
  p.replaceChildren();const strong=document.createElement('strong');strong.textContent=answer;p.append(strong);
 }
};

modules['email-automation']=function(){
 const $=id=>document.getElementById(id),status=$('email-status');let config,revision=0,countries={},dirty=false,busy=false,currentTemplate='',currentProduct='',currentCountry='',offset=0;
 const say=message=>{status.textContent=message;};
 const mark=()=>{dirty=true;$('em-dirty').textContent='Unsaved changes';};
 async function api(action,body){const r=await fetch('/api/admin/email/'+action,{cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});if(r.status===401){location.href='/admin/login?returnTo=/email-automation';throw Error('Please log in again.');}const v=await r.json();if(!r.ok)throw Error(v.error||'Email operation failed');return v;}
 async function run(fn){if(busy)return;busy=true;document.querySelectorAll('.email-console button').forEach(b=>b.disabled=true);try{await fn();}catch(e){say(e.message);}finally{busy=false;document.querySelectorAll('.email-console button').forEach(b=>b.disabled=false);$('em-log-prev').disabled=offset===0;}}
 const lines=id=>$(id).value.split('\n').map(s=>s.trim()).filter(Boolean);
 function stash(){if(!config)return;if(currentTemplate){const t=config.templates[currentTemplate];for(const k of ['subject','intro','closing','cta','path'])t[k]=$('em-'+k).value;t.enabled=$('em-template-enabled').checked;}if(currentProduct)config.products[currentProduct]=lines('em-product-benefits');if(currentCountry&&$('em-country-benefits').dataset.changed==='true')config.countries[currentCountry]=lines('em-country-benefits');}
 function collect(){stash();for(const k of ['senderName','sender','replyTo','tenantId','clientId','signature'])config[k]=$('em-'+k).value;config.enabled=$('em-enabled').checked;return config;}
 function options(select,entries,empty=false){select.replaceChildren();if(empty)select.add(new Option('General / no destination',''));for(const [v,n]of entries)select.add(new Option(n,v));}
 function template(){currentTemplate=$('em-template').value;const t=config.templates[currentTemplate];for(const k of ['subject','intro','closing','cta','path'])$('em-'+k).value=t[k];$('em-template-enabled').checked=t.enabled;}
 function product(){currentProduct=$('em-product').value;$('em-product-benefits').value=config.products[currentProduct].join('\n');}
 function country(){currentCountry=$('em-country').value;$('em-country-benefits').value=(config.countries[currentCountry]||countries[currentCountry]?.benefits||[]).join('\n');$('em-country-benefits').dataset.changed='false';}
 async function load(){const v=await api('settings');config=v.config;revision=v.revision;countries=v.countries;for(const k of ['senderName','sender','replyTo','tenantId','clientId','signature'])$('em-'+k).value=config[k];$('em-enabled').checked=config.enabled;$('em-secret').value='';$('em-secret-status').textContent=v.hasSecret?'Encrypted secret saved. Leave blank to keep it.':'No secret saved.';$('email-connection').textContent=v.tested?'Microsoft 365 · Test accepted':v.hasSecret?'Microsoft 365 · Test required':'Microsoft 365 · Setup required';$('email-live-state').textContent=config.enabled?'Automatic responses enabled':'Automatic responses disabled';if(!v.keyReady)say('Server encryption key is missing. Contact the website administrator.');
 options($('em-template'),Object.entries(config.templates).map(([k,t])=>[k,t.name]));options($('em-product'),Object.keys(config.products).map(k=>[k,k]));options($('em-sample-product'),Object.keys(config.products).map(k=>[k,k]));const sorted=Object.entries(countries).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([k,c])=>[k,c.name]);options($('em-country'),sorted);options($('em-sample-country'),sorted,true);$('em-tokens').replaceChildren(...v.tokens.map(t=>{const e=document.createElement('code');e.textContent='{{'+t+'}}';return e;}));template();product();country();dirty=false;$('em-dirty').textContent='No unsaved changes';}
 async function preview(){const v=await api('preview',{config:collect(),sample:{trigger:currentTemplate,name:$('em-sample-name').value,company:$('em-sample-company').value,destination:$('em-sample-country').value,product:$('em-sample-product').value}});$('em-preview-subject').textContent='Subject: '+v.subject;$('em-preview-frame').srcdoc=v.html;say('Preview updated. Sample links do not send emails.');}
 async function logs(){const v=await api('logs?offset='+offset);$('em-log-rows').replaceChildren();for(const row of v.rows){const tr=document.createElement('tr');for(const text of [new Date(row.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}),row.recipient,row.trigger+(row.destination?' / '+(countries[row.destination]?.name||row.destination):''),row.subject,row.status+' · '+row.attempts]){const td=document.createElement('td');td.textContent=text;tr.append(td);}const td=document.createElement('td');td.textContent=row.status==='disabled'?'Automatic email was disabled when the request arrived. No later automatic send.':row.detail||'Waiting for processing.';if(['queued','failed'].includes(row.status)&&row.trigger!=='test'){const button=document.createElement('button');button.type='button';button.className='btn btn-outline';button.textContent='Retry send';button.onclick=()=>run(async()=>{const result=await api('retry',{id:row.id});say(result.detail||result.status);await logs();});td.append(document.createElement('br'),button);}tr.append(td);$('em-log-rows').append(tr);}if(!v.rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='No emails on this page. New form requests will appear here.';tr.append(td);$('em-log-rows').append(tr);}$('em-log-prev').disabled=offset===0;}
 document.querySelectorAll('[data-email-tab]').forEach(button=>button.onclick=()=>{const tab=button.dataset.emailTab;document.querySelectorAll('[data-email-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-email-panel]').forEach(p=>p.hidden=p.dataset.emailPanel!==tab);document.querySelector('.email-save-bar').hidden=tab==='history';if(tab==='history')run(logs);});
 for(const id of ['em-template','em-product','em-country'])$(id).addEventListener('change',()=>{stash();({ 'em-template':template,'em-product':product,'em-country':country}[id])();});
 $('em-country-benefits').addEventListener('input',()=>{$('em-country-benefits').dataset.changed='true';});
 $('email-editing').addEventListener('input',e=>{if(!e.target.id.startsWith('em-sample')&&e.target.id!=='em-test-recipient')mark();});
 $('em-country-reset').onclick=()=>{delete config.countries[currentCountry];country();mark();};
 $('em-save').onclick=()=>run(async()=>{await api('settings',{config:collect(),revision,secret:$('em-secret').value});await load();say('Email settings saved.');});
 $('em-reload').onclick=()=>run(async()=>{if(dirty&&!confirm('Discard unsaved email changes?'))return;await load();say('Saved settings loaded.');});
 $('em-preview').onclick=()=>run(preview);
 $('em-test').onclick=()=>run(async()=>{if(dirty)throw Error('Save your changes before sending a test.');const v=await api('test',{recipient:$('em-test-recipient').value,revision});await load();say(v.detail||v.status);});
 $('em-log-refresh').onclick=()=>run(logs);$('em-log-prev').onclick=()=>run(async()=>{offset=Math.max(0,offset-50);await logs();});$('em-log-next').onclick=()=>run(async()=>{offset+=50;await logs();});
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});run(load);
};

modules['user-management-review']=function(){
 const $=id=>document.getElementById(id),storeKey='dmc24-user-review-v1',actions=['view','edit','publish','export','send'];
 const registry=JSON.parse(document.getElementById('admin-navigation')?.textContent||'[]');
 const supported={'website-analytics':['view','export'],'brochure-enquiries':['view','export'],'plan-management-review':['view','edit','publish'],'seo-management':['view','edit','publish'],'demo-requests':['view','edit','export'],'blog-management':['view','edit','publish'],'email-automation':['view','edit','send']};
 const modules=registry.filter(r=>!['/blog-management-review','/user-management-review'].includes(r.path)).map(r=>({id:r.path.slice(1),title:r.title,description:r.description,actions:supported[r.path.slice(1)]||['view']}));
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn)=>{const b=el('button',text,'btn btn-outline');b.type='button';b.onclick=fn;return b;};
 let users=[],activity=[],editing=null,rights={},dirty=false,storageAvailable=true;
 const empty=()=>Object.fromEntries(modules.map(m=>[m.id,[]]));
 function preset(value){const p=empty();const grant=(id,a)=>{if(id in p)p[id]=a;};if(value==='sales'){grant('demo-requests',['view','edit','export']);grant('brochure-enquiries',['view','export']);}if(value==='marketing'){grant('blog-management',['view','edit']);grant('seo-management',['view','edit']);grant('website-analytics',['view']);}if(value==='commercial')grant('plan-management-review',['view','edit']);if(value==='readonly')modules.forEach(m=>p[m.id]=['view']);return p;}
 const seeds=()=>[{id:'sales-example',name:'Sales example',email:'sales@example.com',status:'Active',preset:'sales',rights:preset('sales')},{id:'marketing-example',name:'Marketing example',email:'marketing@example.com',status:'Invited',preset:'marketing',rights:preset('marketing')},{id:'commercial-example',name:'Commercial example',email:'commercial@example.com',status:'Active',preset:'commercial',rights:preset('commercial')}];
 function normalise(u){if(!u||typeof u.id!=='string'||typeof u.name!=='string'||typeof u.email!=='string'||!['Active','Invited','Inactive'].includes(u.status))return null;return {id:u.id.slice(0,100),name:u.name.slice(0,100),email:u.email.slice(0,254),status:u.status,preset:['sales','marketing','commercial','readonly','none','custom'].includes(u.preset)?u.preset:'custom',rights:Object.fromEntries(modules.map(m=>{const a=Array.isArray(u.rights?.[m.id])?u.rights[m.id].filter(a=>m.actions.includes(a)):[];return [m.id,a.includes('view')?[...new Set(a)]:[]];}))};}
 try{const saved=JSON.parse(sessionStorage.getItem(storeKey)||'null');users=Array.isArray(saved?.users)?saved.users.slice(0,100).map(normalise).filter(Boolean):seeds();activity=Array.isArray(saved?.activity)?saved.activity.filter(x=>typeof x==='string').slice(0,30):[];}catch{users=seeds();storageAvailable=false;}
 const say=s=>{$('ur-status').textContent=s;};
 function persist(){try{sessionStorage.setItem(storeKey,JSON.stringify({users,activity}));}catch{storageAvailable=false;}}
 function log(text){activity.unshift(new Date().toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+' IST — '+text);activity=activity.slice(0,30);persist();drawActivity();}
 function drawActivity(){$('ur-activity').replaceChildren(...(activity.length?activity:['No review actions yet. Add or edit a sample user to try the workflow.']).map(x=>el('li',x)));}
 function mark(){dirty=true;$('ur-dirty').textContent='Unsaved review changes';}
 function discard(){return !dirty||confirm('Discard unsaved review changes?');}
 function menuPreview(){const state=$('ur-active').value,name=$('ur-name').value.trim()||'New user';$('ur-preview-title').textContent=name+'’s workspace';const box=$('ur-preview-menu');box.replaceChildren();$('ur-preview-detail').replaceChildren();if(state!=='Active'){$('ur-preview-state').textContent=state==='Invited'?'Invitation pending: sign-in would be available after password setup.':'Account inactive: sign-in and all module access would be blocked.';return;}
 const allowed=modules.filter(m=>rights[m.id]?.includes('view'));$('ur-preview-state').textContent=allowed.length?allowed.length+' accessible modules. Unassigned modules stay hidden.':'No modules assigned. This user would see an empty workspace.';
 allowed.forEach(m=>box.append(button(m.title,()=>{$('ur-preview-detail').replaceChildren(el('strong',m.title),el('p',m.description),el('p','Allowed actions: '+rights[m.id].join(', ')+'.'));})));
 }
 function drawMatrix(){const body=$('ur-matrix');body.replaceChildren();for(const m of modules){const tr=el('tr');const th=el('th',m.title);th.scope='row';tr.append(th);for(const action of actions){const td=el('td');if(m.actions.includes(action)){const input=document.createElement('input');input.type='checkbox';input.dataset.module=m.id;input.dataset.action=action;input.checked=rights[m.id]?.includes(action)||false;input.setAttribute('aria-label',action[0].toUpperCase()+action.slice(1)+' '+m.title);input.onchange=()=>{let a=new Set(rights[m.id]||[]);if(input.checked){a.add(action);a.add('view');}else if(action==='view')a.clear();else a.delete(action);rights[m.id]=actions.filter(x=>a.has(x));$('ur-preset').value='custom';mark();drawMatrix();menuPreview();};td.append(input);}else{td.textContent='—';td.setAttribute('aria-label','Not applicable');}tr.append(td);}body.append(tr);}
 const tr=el('tr');const th=el('th','User Management');th.scope='row';const td=el('td','Super Admin only');td.colSpan=5;tr.append(th,td);body.append(tr);}
 function edit(user){if(!discard())return;editing=user?.id||null;rights=structuredClone(user?.rights||empty());$('ur-name').value=user?.name||'';$('ur-email').value=user?.email||'';$('ur-active').value=user?.status||'Invited';$('ur-preset').value=user?.preset||'none';$('ur-editor-title').textContent=user?'Edit '+user.name:'Create a review user';dirty=false;$('ur-dirty').textContent='No unsaved changes';drawMatrix();menuPreview();}
 function showLogin(user){$('ur-dialog-user').textContent='Login email: '+(user?.email||$('ur-email').value||'the user’s email address')+'. Passwords would be set privately by each user.';const d=$('ur-dialog');if(d.showModal)d.showModal();else d.setAttribute('open','');}
 function list(){const q=$('ur-search').value.toLowerCase(),filter=$('ur-filter').value,body=$('ur-users');body.replaceChildren();$('ur-count').textContent='1 protected Super Admin reference · '+users.length+' review users · '+users.filter(u=>u.status==='Active').length+' active in this simulation';
 if((!q||'admin super admin'.includes(q))&&(!filter||filter==='Active')){const tr=el('tr');for(const t of ['Admin · Existing account','Super Admin','Active','All current and future modules','Protected — unchanged'])tr.append(el('td',t));body.append(tr);}
 for(const u of users.filter(u=>(!q||(u.name+' '+u.email).toLowerCase().includes(q))&&(!filter||u.status===filter))){const tr=el('tr'),person=el('td');person.append(el('strong',u.name),el('small',u.email));tr.append(person,el('td','Module user'),el('td',u.status),el('td',Object.values(u.rights).filter(a=>a.includes('view')).length+' modules'));const td=el('td');td.append(button('Edit access',()=>{edit(u);$('ur-editor').scrollIntoView?.({behavior:'smooth',block:'start'});}),button('Preview setup',()=>showLogin(u)),button(u.status==='Inactive'?'Activate in review':'Deactivate in review',()=>{if(!discard())return;u.status=u.status==='Inactive'?'Active':'Inactive';dirty=false;log(u.name+': '+u.status.toLowerCase()+' in review only.');list();if(editing===u.id)edit(u);say('Review status updated. Live access is unchanged.');}));tr.append(td);body.append(tr);}
 if(!body.children.length){const tr=el('tr'),td=el('td','No matching users.');td.colSpan=5;tr.append(td);body.append(tr);}}
 $('ur-form').addEventListener('submit',e=>{e.preventDefault();const name=$('ur-name').value.trim(),email=$('ur-email').value.trim().toLowerCase();if(!name||!/^\S+@\S+\.\S+$/.test(email)){say('Enter a name and valid email for the review user.');return;}if(users.some(u=>u.id!==editing&&u.email===email)){say('That email already belongs to a review user.');return;}if(!editing&&users.length>=100){say('This review supports up to 100 sample users.');return;}const user={id:editing||crypto.randomUUID(),name,email,status:$('ur-active').value,preset:$('ur-preset').value,rights:structuredClone(rights)};const index=users.findIndex(u=>u.id===editing);if(index<0)users.push(user);else users[index]=user;dirty=false;log(name+': '+(index<0?'review account added':'review permissions saved')+'.');list();edit(user);say('Saved in this '+(storageAvailable?'browser tab':'page session')+' only. No login or live permission was created.');});
 $('ur-preset').onchange=()=>{if($('ur-preset').value==='custom')return;rights=preset($('ur-preset').value);mark();drawMatrix();menuPreview();};
 for(const id of ['ur-name','ur-email','ur-active'])$(id).addEventListener('input',()=>{mark();menuPreview();});
 $('ur-new').onclick=()=>{edit(null);$('ur-name').focus();};$('ur-search').oninput=list;$('ur-filter').onchange=list;$('ur-login-preview').onclick=()=>showLogin();$('ur-dialog-close').onclick=()=>{const d=$('ur-dialog');if(d.close)d.close();else d.removeAttribute('open');};
 $('ur-reset').onclick=()=>{if(!confirm('Reset all sample users and review activity in this tab? Live accounts are unaffected.'))return;users=seeds();activity=[];dirty=false;persist();list();drawActivity();edit(null);say('Sample data reset.');};
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});list();drawActivity();edit(null);
};

for(const key of ['admin-shell',...(pageModules[page]||[]),'site-breadcrumbs','destination-brochure','complete-footer','brochure-gate','shared-demo','visitor-analytics','published-page-seo']) {removeHiddenDestinations();modules[key]();removeHiddenDestinations();}
})();
