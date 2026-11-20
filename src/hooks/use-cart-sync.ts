import {useEffect} from 'react';
import {useCart} from '@/stores/cart';
export function useCartSync(){const sync=useCart(s=>s.sync);useEffect(()=>{void Promise.resolve(useCart.persist?.rehydrate()).then(sync);const visibility=()=>{if(document.visibilityState==='visible')void sync();};document.addEventListener('visibilitychange',visibility);return()=>document.removeEventListener('visibilitychange',visibility);},[sync]);}
