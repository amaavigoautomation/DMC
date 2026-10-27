import config from '../SEO_SITE_CONFIG.json' with {type:'json'};
export const siteOrigin=new URL(config.canonical_origin).origin;
export const pageUrl=slug=>siteOrigin+(slug==='index'?'/':'/'+slug);
