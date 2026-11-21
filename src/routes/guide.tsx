import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Page } from '@/components/store/page';
import { settingsOptions } from '@/lib/settings';
import { pageHead } from '@/lib/metadata';

export const Route = createFileRoute('/guide')({
  head: () => pageHead('راهنمای خرید و سایز', 'راهنمای انتخاب سایز و مراحل خرید از EDVARDO.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsOptions),
  component: Guide,
});

const steps = [
  'محصول را انتخاب کنید و سایز و رنگ را مشخص کنید.',
  'محصول را به سبد خرید اضافه کنید و در صورت داشتن کد تخفیف، آن را اعمال کنید.',
  'آدرس تحویل و خلاصه سفارش را در صفحه تسویه‌حساب بررسی کنید.',
  'پرداخت و وضعیت سفارش را مطابق اطلاعاتی که فروشگاه اعلام می‌کند دنبال کنید.',
];

// size_chart setting format, one row per line: "سایز|دور سینه|دور کمر"
function Guide() {
  const { data: settings } = useSuspenseQuery(settingsOptions);
  const rows = (settings['size_chart'] || '')
    .split('\n')
    .map((l) => l.split('|').map((c) => c.trim()))
    .filter((r) => r.length >= 2 && r[0]);
  return (
    <Page title="راهنمای خرید و سایز" subtitle="چند نکته برای انتخابی مطمئن‌تر.">
      <section className="policy-block">
        <h2>مراحل خرید</h2>
        <ol style={{ paddingInlineStart: 20, listStyle: 'decimal' }} className="text-muted-foreground">
          {steps.map((s) => <li key={s} style={{ marginBottom: 10 }}>{s}</li>)}
        </ol>
      </section>
      <section className="policy-block">
        <h2>راهنمای سایز</h2>
        {rows.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="guide-table">
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>{r.map((c, j) => (i === 0 ? <th key={j}>{c}</th> : <td key={j}>{c}</td>))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="notice">
            جدول اندازه هنوز توسط فروشگاه منتشر نشده است. پیش از خرید از <Link to="/contact" className="text-primary">پشتیبانی</Link> بپرسید.
          </div>
        )}
        <p className="form-note" style={{ marginTop: 14 }}>
          نکته: اندازه‌های خود را با راهنمای همان محصول مقایسه کنید.
        </p>
      </section>
    </Page>
  );
}
