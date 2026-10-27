import fs from 'node:fs';
import crypto from 'node:crypto';
const files={
 'overview':['DMC24_Comprehensive_Sales_Brochure.pdf','Comprehensive DMC24'],
 'mid-office':['DMC24_Mid_Office_Brochure.pdf','DMC24 Mid Office'],
 'b2b':['DMC24_B2B_Booking_Platform_Brochure.pdf','B2B Booking Platform'],
 'b2c':['DMC24_B2C_Booking_Platform_Brochure.pdf','B2C Booking Platform'],
 'local-sales':['DMC24_Local_Sales_Brochure.pdf','Local Sales'],
 'multi-dmc':['DMC24_Multi_DMC_Brochure.pdf','Multi-DMC']
};
export function securePdfs(){
 const data={};fs.mkdirSync('website/protected-brochures',{recursive:true});
 for(const [id,[file,title]] of Object.entries(files)){
  const key=crypto.randomBytes(32),iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const encrypted=Buffer.concat([iv,cipher.update(fs.readFileSync('brochure-assets/'+file)),cipher.final(),cipher.getAuthTag()]);
  const asset='/protected-brochures/'+id+'.bin';fs.writeFileSync('website'+asset,encrypted);
  data[id]={file,title,asset,key:[...key]};
 }
 fs.writeFileSync('server/secured-pdfs-generated.mjs','export const securedPdfs='+JSON.stringify(data)+';');
}
