import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/store/page';
import { ProductCard } from '@/components/store/product-card';
import { useAuth } from '@/components/store/auth';
import { productsOptions } from '@/lib/shopify';
import { pageHead } from '@/lib/metadata';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/wishlist')({
  head: () => pageHead('علاقه‌مندی‌ها', 'محصولات ذخیره‌شده شما در EDVARDO.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsOptions),
  component: Wishlist,
});

function Wishlist() {
  const { user, ready } = useAuth();
  const { data: products } = useSuspenseQuery(productsOptions);
  const [handles, setHandles] = useState<string[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { setHandles(null); return; }
    void supabase.from('wishlist').select('product_handle').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setError('دریافت علاقه‌مندی‌ها انجام نشد.');
      else setHandles((data ?? []).map((r) => r.product_handle));
    });
  }, [user]);

  const remove = async (handle: string) => {
    const { error } = await supabase.from('wishlist').delete().eq('product_handle', handle);
    if (error) setError('حذف انجام نشد.');
    else setHandles((h) => (h ?? []).filter((x) => x !== handle));
  };

  if (ready && !user) {
    return (
      <Page title="علاقه‌مندی‌ها" subtitle="محصولات مورد علاقه خود را ذخیره کنید.">
        <div className="empty-state">
          <h3>برای دیدن علاقه‌مندی‌ها وارد شوید</h3>
          <Button asChild><Link to="/account">ورود / ثبت‌نام</Link></Button>
        </div>
      </Page>
    );
  }
  const items = (handles ?? []).map((h) => products.find((p) => p.handle === h)).filter(Boolean) as typeof products;
  return (
    <Page title="علاقه‌مندی‌ها" subtitle="محصولاتی که برای بعد نگه داشته‌اید.">
      {error && <p role="alert" className="form-status text-destructive">{error}</p>}
      {handles && !items.length ? (
        <div className="empty-state">
          <h3>هنوز محصولی ذخیره نکرده‌اید</h3>
          <Button asChild variant="outline"><Link to="/products">مشاهده محصولات</Link></Button>
        </div>
      ) : (
        <div className="product-grid">
          {items.map((p) => (
            <div key={p.id}>
              <ProductCard product={p} />
              <Button variant="ghost" size="sm" onClick={() => remove(p.handle)}><Trash2 /> حذف از علاقه‌مندی‌ها</Button>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}
