import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Page } from '@/components/store/page';
import { settingsOptions } from '@/lib/settings';
import { pageHead } from '@/lib/metadata';

export const Route = createFileRoute('/policies')({
  head: () => pageHead('قوانین و مقررات', 'قوانین، حریم خصوصی، شرایط ارسال و تعویض در EDVARDO.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsOptions),
  component: Policies,
});

const blocks = [
  ['policy_terms', 'قوانین و مقررات', 'قوانین استفاده از فروشگاه هنوز توسط EDVARDO منتشر نشده است.'],
  ['policy_privacy', 'حریم خصوصی', 'اطلاعات حساب شما فقط برای ارائه خدمات فروشگاه نگهداری می‌شود.'],
  ['policy_shipping', 'شرایط ارسال', 'زمان و هزینه ارسال هنوز توسط فروشگاه اعلام نشده است.'],
  ['policy_returns', 'تعویض و بازگشت', 'شرایط تعویض هنوز توسط فروشگاه اعلام نشده است. پیش از خرید از پشتیبانی بپرسید.'],
] as const;

function Policies() {
  const { data: settings } = useSuspenseQuery(settingsOptions);
  return (
    <Page title="قوانین و مقررات">
      {blocks.map(([key, title, fallback]) => (
        <section className="policy-block" key={key} id={key.replace('policy_', '')}>
          <h2>{title}</h2>
          {(settings[key] || fallback).split('\n').filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: 12 }}>{p}</p>)}
        </section>
      ))}
    </Page>
  );
}
