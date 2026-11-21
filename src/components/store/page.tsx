import type {ReactNode} from 'react';
import {Link} from '@tanstack/react-router';
import {ArrowLeft} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useSuspenseQuery} from '@tanstack/react-query';
import {settingsOptions,faqs} from '@/lib/settings';
export function Page({title,subtitle,children}:{title:string;subtitle?:string;children:ReactNode}){return <main className="page-width content-page"><div className="breadcrumb"><Link to="/">صفحه اصلی</Link><span>/</span><span>{title}</span></div><header className="page-heading"><span className="eyebrow">EDVARDO</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</header>{children}</main>;}
export function EmptyCatalog(){return <div className="empty-state catalog-empty"><span className="empty-number" dir="ltr">EDVARDO</span><h3>هنوز محصولی ثبت نشده است</h3><p>کالکشن تازه، به‌زودی اینجا خواهد بود.</p></div>;}
export function SectionHeading({title,eyebrow}:{title:string;eyebrow:string}){return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><Button asChild variant="link"><Link to="/products">مشاهده همه <ArrowLeft/></Link></Button></div>;}
export function FAQ(){const {data:settings}=useSuspenseQuery(settingsOptions);return <div className="faq-list">{faqs.map(([key,q,fallback])=><details key={key}><summary>{q}<span>+</span></summary><p>{settings[`faq_${key}`]||fallback}</p></details>)}</div>;}
