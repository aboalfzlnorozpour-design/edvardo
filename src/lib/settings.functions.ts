import {createServerFn} from '@tanstack/react-start';
import {createClient} from '@supabase/supabase-js';
import type {Database} from '@/integrations/supabase/types';
export const getSettings=createServerFn({method:'GET'}).handler(async()=>{
 const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];
 if(!url||!key)return {} as Record<string,string>;
 const client=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const headers=new Headers(init?.headers);if(key.startsWith('sb_')&&headers.get('Authorization')===`Bearer ${key}`)headers.delete('Authorization');headers.set('apikey',key);return fetch(input,{...init,headers});}}});
 const {data}=await client.from('store_settings').select('key,value');return Object.fromEntries((data??[]).map(row=>[row.key,row.value])) as Record<string,string>;
});
