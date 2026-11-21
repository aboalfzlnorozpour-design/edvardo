import {createFileRoute} from '@tanstack/react-router';
import {Catalog} from '@/components/store/catalog';
import {productsOptions} from '@/lib/shopify';
import {pageHead} from '@/lib/metadata';
export const Route=createFileRoute('/offers')({head:()=>pageHead('پیشنهادهای ویژه','پیشنهادهای ویژه EDVARDO؛ پوشاک خاص و انتخابی برای استایل شما.'),loader:({context})=>context.queryClient.ensureQueryData(productsOptions),component:()=> <Catalog department="all" sale={true}/>});
