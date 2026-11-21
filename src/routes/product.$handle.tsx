import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productOptions } from '@/lib/shopify';
import { pageHead } from '@/lib/metadata';
import { formatMoney, discountPercent } from '@/lib/commerce';
import { ProductSelection } from '@/components/store/product-selection';
import { useAuth } from '@/components/store/auth';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/product/$handle')({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(productOptions(params.handle));
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) =>
    pageHead(
      loaderData?.title ?? 'محصول',
      loaderData?.description?.slice(0, 150) || 'جزئیات محصول EDVARDO؛ پوشاک خاص و انتخابی.',
    ),
  notFoundComponent: () => (
    <main className="page-width content-page">
      <div className="empty-state">
        <h3>این محصول پیدا نشد</h3>
        <Button asChild variant="outline"><Link to="/products">بازگشت به محصولات</Link></Button>
      </div>
    </main>
  ),
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState('');
  const images = product.images.edges.map((e) => e.node);
  const current = images[index];
  const variant = product.variants.edges[0]?.node;

  const saveFavorite = async () => {
    if (!user) { setMessage('برای ذخیره، ابتدا وارد حساب خود شوید.'); return; }
    const { error } = await supabase
      .from('wishlist')
      .upsert({ user_id: user.id, product_handle: product.handle }, { onConflict: 'user_id,product_handle' });
    setMessage(error ? 'ذخیره انجام نشد.' : 'به علاقه‌مندی‌ها اضافه شد.');
  };

  return (
    <main className="page-width content-page">
      <div className="breadcrumb">
        <Link to="/">صفحه اصلی</Link><span>/</span>
        <Link to="/products">محصولات</Link><span>/</span>
        <span>{product.title}</span>
      </div>
      <div className="product-detail" style={{ marginTop: 32 }}>
        <div className="product-gallery">
          {current ? (
            <img className="main-photo" src={current.url} alt={current.altText || product.title} />
          ) : (
            <div className="main-photo no-photo">تصویر محصول ثبت نشده</div>
          )}
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button key={img.url} type="button" aria-label={`تصویر ${i + 1}`} onClick={() => setIndex(i)}
                  style={{ outline: i === index ? '2px solid var(--primary)' : 'none' }}>
                  <img src={img.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-info">
          <span className="eyebrow">{product.productType || 'EDVARDO'}</span>
          <h1>{product.title}</h1>
          <div className="flex gap-3 items-center">
            <strong className="text-xl">{formatMoney(product.priceRange.minVariantPrice)}</strong>
            {variant?.compareAtPrice && <del className="text-muted-foreground">{formatMoney(variant.compareAtPrice)}</del>}
            {discountPercent(variant) > 0 && (
              <span className="discount-badge" style={{ position: 'static' }}>
                {new Intl.NumberFormat('fa').format(discountPercent(variant))}٪
              </span>
            )}
          </div>
          {product.description && <p>{product.description}</p>}
          <ProductSelection product={product} />
          <div className="gallery-tools">
            <Button variant="ghost" onClick={saveFavorite}><Heart /> افزودن به علاقه‌مندی‌ها</Button>
          </div>
          {message && <p role="status" className="form-status">{message}</p>}
          <details>
            <summary>راهنمای سایز و ارسال</summary>
            <p className="form-note" style={{ marginTop: 12 }}>
              اندازه‌ها را با <Link to="/guide" className="text-primary">راهنمای سایز</Link> مقایسه کنید. شرایط ارسال و تعویض در{' '}
              <Link to="/policies" className="text-primary">قوانین و مقررات</Link> آمده است.
            </p>
          </details>
        </div>
      </div>
    </main>
  );
}
