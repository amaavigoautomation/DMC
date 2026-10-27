import {siteOrigin} from './site-config.mjs';
import {PDFDocument,StandardFonts,rgb,PDFName,PDFString,pushGraphicsState,popGraphicsState,rectangle,clip,endPath} from 'pdf-lib';
const W=595.28,H=841.89,M=44,CW=W-88;
const colors={navy:'#152134',pink:'#C52665',muted:'#596679',pale:'#F3F5F9',line:'#DEE3EB',white:'#FFFFFF'};
const color=s=>{s=colors[s]||s;return rgb(parseInt(s.slice(1,3),16)/255,parseInt(s.slice(3,5),16)/255,parseInt(s.slice(5,7),16)/255)};
const clean=t=>String(t||'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—‑]/g,'-').replace(/→/g,'to').replace(/[^\x20-\x7e\n]/g,'');
export async function renderBrochure(data,qr,loadAsset){
 const pdf=await PDFDocument.create();pdf.setTitle(`DMC24 for ${data.name} | Destination brochure`);pdf.setAuthor('Puratech Consultancy Solutions Pvt Ltd');pdf.setSubject('Destination management software - sales, operations, finance and distribution');
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const asset=async(path,kind='jpg')=>{const bytes=await loadAsset(path);return kind==='png'?pdf.embedPng(bytes):pdf.embedJpg(bytes)};
 const logo=await asset('img/dmc24-logo.png','png'),screen=await asset('img/brochures/dmc24-sales-overview-dashboard.jpg');
 let hero;try{hero=await asset('img/brochures/'+data.slug+'.jpg')}catch{hero=screen}
 let page,number=0;
 const box=(x,y,w,h,fill)=>page.drawRectangle({x,y:H-y-h,width:w,height:h,color:color(fill)});
 function lines(t,font,size,width){const result=[];for(const para of clean(t).split('\n')){let current='';for(const word of para.split(/\s+/)){let next=current?current+' '+word:word;if(font.widthOfTextAtSize(next,size)>width&&current){result.push(current);current=word}else current=next;}result.push(current)}return result}
 function text(t,x,y,width=CW,size=11,fill='navy',heavy=false,maxHeight=150){const font=heavy?bold:regular;let rows=lines(t,font,size,width);while(rows.length*size*1.35>maxHeight&&size>8){size-=.25;rows=lines(t,font,size,width)}if(rows.length*size*1.35>maxHeight+1)throw Error('Brochure text overflow '+data.slug+': '+t);rows.forEach((row,i)=>page.drawText(row,{x,y:H-y-size-i*size*1.35,size,font,color:color(fill)}));return rows.length*size*1.35}
 function image(im,x,y,w,h,contain=false){if(contain){const scale=Math.min(w/im.width,h/im.height);page.drawImage(im,{x:x+(w-im.width*scale)/2,y:H-y-h+(h-im.height*scale)/2,width:im.width*scale,height:im.height*scale})}else {const scale=Math.max(w/im.width,h/im.height);page.pushOperators(pushGraphicsState(),rectangle(x,H-y-h,w,h),clip(),endPath());page.drawImage(im,{x:x+(w-im.width*scale)/2,y:H-y-h+(h-im.height*scale)/2,width:im.width*scale,height:im.height*scale});page.pushOperators(popGraphicsState());}}
 function link(url,x,y,w,h){const a=pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[x,H-y-h,x+w,H-y],Border:[0,0,0],A:{Type:'Action',S:'URI',URI:PDFString.of(url)}});const ref=pdf.context.register(a);page.node.addAnnot(ref)}
 function start(kicker,title,sub){page=pdf.addPage([W,H]);number++;image(logo,M,28,116,32,true);text('DESTINATION MANAGEMENT SOFTWARE',300,38,250,7.5,'muted');text(kicker.toUpperCase(),M,105,CW,9,'pink',true,30);text(title,M,130,CW,29,'navy',true,86);text(sub,M,220,CW,11,'muted',false,44);footer()}
 function footer(){box(M,798,CW,1,'line');text(`${data.name.toUpperCase()} EDITION  /  DMC24  /  DESTINATION BROCHURE`,M,811,CW-30,7,'muted',false,12);text(String(number).padStart(2,'0'),W-66,809,25,9,'navy',true,16)}
 // 1 - cover
 page=pdf.addPage([W,H]);number++;image(logo,M,28,134,38,true);text(data.name.toUpperCase()+' EDITION',390,40,162,9,'pink',true,30);image(hero,0,102,W,347);box(M,431,188,32,'pink');text('BUILT FOR INBOUND DMCs',M+12,442,170,8.5,'white',true,14);
 text(`Run your ${data.name} DMC.\nConnect every operation.`,M,490,CW,32,'navy',true,92);text('From the first enquiry to the final file margin.',M,594,CW,15,'pink',true,42);text(data.lead||`Connect sales, bookings, destination operations and financial control for your ${data.name} DMC.`,M,646,CW,12,'muted',false,82);text('SALES & CRM  /  OPERATIONS  /  FINANCE  /  DISTRIBUTION',M,753,CW,8,'navy',true,14);footer();
 // 2 - destination pitch
 start('The commercial case','Destination expertise.\nConnected control.',`Your ${data.name} expertise creates the journey. DMC24 helps connect the people, services and commercial decisions behind it.`);
 let pitch=data.role.length>=4?data.role.slice(0,4):[...data.role,...data.tourism].slice(0,4);
 const benefits=['Bring product and supplier details into one operating workflow.','Connect the enquiry, quotation and confirmed booking.','Give teams a shared view of services and responsibilities.','Follow the journey through to reporting and financial control.'];
 pitch.forEach((r,i)=>{const y=287+i*109;box(M,y,4,88,'pink');text(r.title,M+18,y,153,14,'navy',true,80);text(r.body,M+180,y,325,10.5,'muted',false,49);text(benefits[i],M+180,y+52,325,10.3,'navy',false,40)});
 text('Less fragmentation. Clearer ownership. Better visibility.',M,754,CW,12,'pink',true,30);
 // 3 - features
 start('Built around '+data.name,'Features that understand\nyour operating day.','A destination-specific selection from the DMC24 feature set. Plan inclusions and optional modules are detailed on your destination page.');
 data.features.forEach((f,i)=>{const x=M+i%2*263,y=284+Math.floor(i/2)*120;box(x,y,244,108,'pale');box(x,y,244,3,'pink');text(f.title,x+14,y+13,216,12,'navy',true,43);text(f.body,x+14,y+60,216,9.5,'muted',false,42)});
 text('Explore the complete feature set on the destination website.',M,778,CW,8,'muted',false,12);
 // 4 - whole product
 start('The complete product','One platform.\nA connected journey.','Connect the mid-office workflow with the channels through which your DMC sells.');
 const steps=[['Sales & CRM','Capture enquiries and follow up.'],['Contracts & quotations','Build offers and cost itineraries.'],['Bookings & reservations','Confirm services and suppliers.'],['Operations & logistics','Coordinate movements and teams.'],['Finance & profitability','Track balances and file results.'],['Dashboards & MIS','Review performance and priorities.']];
 steps.forEach(([a,b],i)=>{const y=281+i*73;box(M,y,220,63,'pale');text(String(i+1).padStart(2,'0'),M+10,y+12,28,11,'pink',true,22);text(a,M+44,y+10,165,10.5,'navy',true,22);text(b,M+44,y+31,164,9,'muted',false,28)});
 image(screen,286,281,265,197,true);text('DMC24 sales overview - product screen',286,488,265,7.5,'muted',false,15);text('Extend your reach',286,523,265,17,'navy',true,28);
 [['B2B agent platform','Connect travel-agent sales with your operation.'],['B2C booking engine','Support direct online discovery and bookings.'],['Local Sales','Support in-destination sales through your representatives.']].forEach(([a,b],i)=>{const y=560+i*64;text(a,286,y,265,11,'pink',true,20);text(b,286,y+21,265,10,'muted',false,37)});
 text('Extensions and integrations are scoped separately; inclusion depends on the selected solution.',M,767,CW,8,'muted',false,21);
 // 5 - actual available plans
 start('Choose your level of control','Start with your needs.\nBuild for your next stage.',`A focused comparison of the plans offered for ${data.name}. Check the website for complete inclusions and commercial terms.`);
 const height=data.plans.length===3?136:108;
 data.plans.forEach((p,i)=>{const y=283+i*height;box(M,y,CW,height-12,i===1?'#FBEAF1':'pale');text(p.name.toUpperCase(),M+14,y+15,145,10,'pink',true,38);text(p.intro,M+180,y+12,312,11,'navy',true,32);text(p.highlights.slice(0,data.plans.length===3?5:4).join(' | '),M+180,y+48,310,9.5,'muted',false,height-66)});
 text('Prices, included users, offers and setup fees can change. Refer to the live country page before purchasing. Optional items remain subject to the selected plan.',M,728,CW,9,'muted',false,38);
 const pricing=`${siteOrigin}/${data.slug}#subscriptions`;text(`View current ${data.name} plans & pricing`,M,773,CW,11,'pink',true,17);link(pricing,M,768,CW,25);
 // 6 - tailored demo
 start('See it in your operation','Bring a real enquiry.\nSee the complete flow.',`Use a representative ${data.name} itinerary to explore how DMC24 could support your team.`);
 image(hero,M,281,CW,164);text(`Your ${data.name} demo agenda`,M,471,CW,18,'navy',true,42);
 ['Build a quotation around your products and markets.','Review bookings, supplier reservations and movements.','Explore the destination controls highlighted in this brochure.','Trace collections, supplier balances and file profitability.'].forEach((t,i)=>text(String(i+1).padStart(2,'0')+'   '+t,M,517+i*31,390,10.5,'navy',false,29));
 text('A supported start',M,658,320,14,'navy',true,27);text('Agree your onboarding, training, data migration, integrations and rollout scope with the DMC24 team. Service inclusions depend on your selected plan.',M,689,337,10,'muted',false,60);
 const cell=105/(qr.size+8),qx=439,qy=632;box(qx,qy,105,105,'white');qr.data.forEach((v,i)=>{if(v)box(qx+(i%qr.size+4)*cell,qy+(Math.floor(i/qr.size)+4)*cell,cell,cell,'navy')});text('SCAN TO REQUEST A DEMO',430,740,128,7,'pink',true,14);
 const demo=siteOrigin+'/request-demo';text(`Request your ${data.name} demo`,M,767,375,13,'pink',true,25);link(demo,M,760,375,30);
 return pdf.save();
}
