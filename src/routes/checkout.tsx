import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/store/page';
import { useAuth } from '@/components/store/auth';
import { AddressFields, emptyAddress, validateAddress, useAddresses, type AddressDraft } from '@/components/store/account-panels';
import { useCart } from '@/stores/cart';
import { formatMoney } from '@/lib/commerce';
import { pageHead } from '@/lib/metadata';

export const Route = createFileRoute('/checkout')({
  head: () => pageHead('تسویه‌حساب', 'بررسی آدرس و خلاصه سفارش در EDVARDO.'),
  component: Checkout,
});

function Checkout() {
  const { user } = useAuth();
  const { cart, busy, sync } = useCart();
  const { addresses } = useAddresses(user?.id);
  const [selected, setSelected] = useState<string>('new');
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress);
  const [status, setStatus] = useState('');
  useEffect(() => { void sync(); }, [sync]);
  useEffect(() => { if (addresses[0]) setSelected(addresses[0].id); }, [addresses]);

  const lines = cart?.lines.edges.map((e) => e.node) ?? [];
  if (!lines.length) {
    return (
      <Page title="تسویه‌حساب">
        <div className="empty-state">
          <h3>سبد خرید شما خالی است</h3>
          <Button asChild><Link to="/products">مشاهده محصولات <ArrowLeft /></Link></Button>
        </div>
      </Page>
    );
  }

  const chosen = addresses.find((a) => a.id === selected);
  const proceed = () => {
    if (!chosen) {
      const problem = validateAddress(draft);
      if (problem) return setStatus(problem);
    }
    setStatus('');
    window.open(cart!.checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Page title="تسویه‌حساب" subtitle="آدرس و خلاصه سفارش خود را بررسی کنید.">
      <div className="checkout-layout">
        <section>
          <h2 style={{ marginBottom: 20 }}>آدرس تحویل</h2>
          {user && addresses.length > 0 && (
            <div className="address-list">
              {addresses.map((a) => (
                <label key={a.id} className="address-item" style={{ cursor: 'pointer' }}>
                  <div>
                    <strong>{a.full_name}</strong>
                    <p>{a.province}، {a.city}، {a.address}</p>
                    <p>کد پستی: <span dir="ltr">{a.postal_code}</span></p>
                  </div>
                  <input type="radio" name="address" checked={selected === a.id} onChange={() => setSelected(a.id)} aria-label={`انتخاب آدرس ${a.full_name}`} />
                </label>
              ))}
              <label className="address-item" style={{ cursor: 'pointer' }}>
                <strong>آدرس دیگر</strong>
                <input type="radio" name="address" checked={selected === 'new'} onChange={() => setSelected('new')} aria-label="آدرس دیگر" />
              </label>
            </div>
          )}
          {(!user || selected === 'new' || !addresses.length) && <AddressFields value={draft} onChange={setDraft} />}
          {!user && <p className="form-note" style={{ marginTop: 14 }}><Link to="/account" className="text-primary">وارد حساب شوید</Link> تا آدرس‌هایتان ذخیره شود.</p>}
          <div className="notice">آدرس نهایی در مرحله تسویه‌حساب فروشگاه نیز دریافت و تأیید می‌شود.</div>
        </section>
        <aside className="order-summary">
          <h2 style={{ marginBottom: 12 }}>خلاصه سفارش</h2>
          {lines.map((l) => (
            <div className="summary-line" key={l.id}>
              <span>{l.merchandise.product.title}<br /><small>{l.merchandise.selectedOptions.map((o) => o.value).join(' / ')} × {new Intl.NumberFormat('fa').format(l.quantity)}</small></span>
              <span>{formatMoney({ amount: String(Number(l.merchandise.price.amount) * l.quantity), currencyCode: l.merchandise.price.currencyCode })}</span>
            </div>
          ))}
          <div className="summary-line"><span>جمع جزء</span><span>{formatMoney(cart!.cost.subtotalAmount)}</span></div>
          <div className="summary-line"><span>هزینه ارسال</span><small>در مرحله بعد محاسبه می‌شود</small></div>
          <div className="summary-line"><strong>مبلغ نهایی</strong><strong>{formatMoney(cart!.cost.totalAmount)}</strong></div>
          <div className="notice">
            وضعیت پرداخت: درگاه پرداخت ایرانی هنوز فعال نیست. تا زمانی که پرداخت انجام و تأیید نشود، سفارش شما ثبت‌شده محسوب نمی‌شود.
          </div>
          {status && <p role="alert" className="form-status text-destructive">{status}</p>}
          <Button className="w-full" disabled={busy} onClick={proceed}>
            {busy ? <Loader2 className="animate-spin" /> : <>ادامه به تسویه‌حساب فروشگاه <ArrowLeft /></>}
          </Button>
        </aside>
      </div>
    </Page>
  );
}
