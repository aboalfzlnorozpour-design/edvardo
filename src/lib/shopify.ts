import { queryOptions } from '@tanstack/react-query';
import type {Product, Money, Variant} from './commerce';
export const SHOP_DOMAIN='pixel-perfect-replica-tagnz-cbqayamv.myshopify.com';
const TOKEN='e033a2ccd4369f3d0043dbd54f6713fd';
export async function storefrontApiRequest<T>(query:string,variables:Record<string,unknown>={}) :Promise<T> {
 const response=await fetch(`https://${SHOP_DOMAIN}/api/2026-10/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Storefront-Access-Token':TOKEN},body:JSON.stringify({query,variables})});
 if(!response.ok) throw new Error('ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.');
 const result=await response.json() as {data:T;errors?:{message:string}[]}; if(result.errors?.length) throw new Error('دریافت اطلاعات فروشگاه با مشکل مواجه شد.'); return result.data;
}
const PRODUCT_FIELDS=`id handle title description productType tags createdAt availableForSale priceRange { minVariantPrice { amount currencyCode } } images(first:8) { edges { node { url altText } } } variants(first:100) { edges { node { id title availableForSale price { amount currencyCode } compareAtPrice { amount currencyCode } selectedOptions { name value } } } } options { name values }`;
export const productsOptions=queryOptions({queryKey:['products'],queryFn:async()=>{const data=await storefrontApiRequest<{products:{edges:{node:Product}[]}}>(`query { products(first:100) { edges { node { ${PRODUCT_FIELDS} } } } }`);return data.products.edges.map(e=>e.node);},staleTime:60000});
export const productOptions=(handle:string)=>queryOptions({queryKey:['product',handle],queryFn:async()=>{const data=await storefrontApiRequest<{product:Product|null}>(`query($handle:String!) { product(handle:$handle) { ${PRODUCT_FIELDS} } }`,{handle});return data.product;},staleTime:60000});
export interface CartLine {id:string; quantity:number; merchandise:Variant & {product:{title:string;handle:string;featuredImage:{url:string}|null}}}
export interface ShopifyCart {id:string;checkoutUrl:string;totalQuantity:number;lines:{edges:{node:CartLine}[]};cost:{subtotalAmount:Money;totalAmount:Money};discountCodes:{code:string;applicable:boolean}[]}
const CART_FIELDS=`id checkoutUrl totalQuantity lines(first:100) { edges { node { id quantity merchandise { ... on ProductVariant { id title availableForSale selectedOptions { name value } price { amount currencyCode } product { title handle featuredImage { url } } } } } } } cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } } discountCodes { code applicable }`;
export async function fetchCart(id:string) {return (await storefrontApiRequest<{cart:ShopifyCart|null}>(`query($id:ID!){cart(id:$id){${CART_FIELDS}}}`,{id})).cart;}
export type CartOperation='cartCreate'|'cartLinesAdd'|'cartLinesUpdate'|'cartLinesRemove'|'cartDiscountCodesUpdate';
export async function mutateCart(operation:CartOperation,variables:Record<string,unknown>) {
 const signatures:Record<CartOperation,string>={cartCreate:'$input:CartInput!',cartLinesAdd:'$cartId:ID!, $lines:[CartLineInput!]!',cartLinesUpdate:'$cartId:ID!, $lines:[CartLineUpdateInput!]!',cartLinesRemove:'$cartId:ID!, $lineIds:[ID!]!',cartDiscountCodesUpdate:'$cartId:ID!, $discountCodes:[String!]!'};
 const args:Record<CartOperation,string>={cartCreate:'input:$input',cartLinesAdd:'cartId:$cartId,lines:$lines',cartLinesUpdate:'cartId:$cartId,lines:$lines',cartLinesRemove:'cartId:$cartId,lineIds:$lineIds',cartDiscountCodesUpdate:'cartId:$cartId,discountCodes:$discountCodes'};
 const data=await storefrontApiRequest<Record<CartOperation,{cart:ShopifyCart|null;userErrors:{message:string}[]}>>(`mutation(${signatures[operation]}){${operation}(${args[operation]}){cart{${CART_FIELDS}}userErrors{message}}}`,variables);
 const result=data[operation]; if(result.userErrors.length) { if(result.userErrors.some(e=>/cart not found|does not exist/i.test(e.message)))throw new Error('CART_EXPIRED'); throw new Error('این تغییر قابل انجام نیست؛ موجودی یا اطلاعات انتخاب‌شده را بررسی کنید.'); } if(!result.cart)throw new Error('CART_EXPIRED'); const url=new URL(result.cart.checkoutUrl);url.searchParams.set('channel','online_store');return {...result.cart,checkoutUrl:url.toString()};
}
