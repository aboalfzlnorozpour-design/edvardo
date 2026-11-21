import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Page, FAQ } from '@/components/store/page';
import { settingsOptions } from '@/lib/settings';
import { pageHead } from '@/lib/metadata';
import { validContact } from '@/lib/commerce';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/contact')({
  head: () => pageHead('تماس با ما', 'پیام، پرسش یا پیشنهاد خود را برای تیم EDVARDO ارسال کنید.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsOptions),
  component: Contact,
});

function Contact() {
  const { data: settings } = useSuspenseQuery(settingsOptions);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim(), email = form.email.trim(), message = form.message.trim();
    if (name.length < 2) return setStatus('نام باید حداقل ۲ نویسه باشد.');
    if (!validContact(email)) return setStatus('ایمیل معتبر یا شماره موبایل ۱۱ رقمی وارد کنید.');
    if (message.length < 10) return setStatus('پیام باید حداقل ۱۰ نویسه باشد.');
    setBusy(true);
    const { error } = await supabase.from('contact_messages').insert({ name, email, message });
    setBusy(false);
    if (error) return setStatus('ارسال پیام انجام نشد. دوباره تلاش کنید.');
    setStatus('پیام شما ثبت شد. در اولین فرصت پاسخ می‌دهیم.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <Page title="تماس با ما" subtitle="صدای شما برای ما مهم است.">
      <div className="editorial-grid" style={{ alignItems: 'start' }}>
        <form className="stack-form" onSubmit={submit} noValidate>
          <label>نام<input value={form.name} maxLength={100} onChange={(e) => set('name', e.target.value)} required /></label>
          <label>ایمیل یا شماره موبایل
            <input dir="ltr" value={form.email} maxLength={254} onChange={(e) => set('email', e.target.value)} required />
          </label>
          <label>پیام
            <textarea rows={6} value={form.message} maxLength={5000} onChange={(e) => set('message', e.target.value)} required />
          </label>
          <Button disabled={busy}>ارسال پیام</Button>
          {status && <p role="status" className="form-status">{status}</p>}
        </form>
        <div className="prose-copy">
          <h2>راه‌های ارتباطی</h2>
          {settings['contact_phone'] && <p>تلفن: <span dir="ltr">{settings['contact_phone']}</span></p>}
          {settings['contact_email'] && <p>ایمیل: <span dir="ltr">{settings['contact_email']}</span></p>}
          {settings['contact_address'] && <p>نشانی: {settings['contact_address']}</p>}
          {!settings['contact_phone'] && !settings['contact_email'] && !settings['contact_address'] && (
            <p>اطلاعات تماس هنوز توسط فروشگاه اعلام نشده است؛ لطفاً از فرم استفاده کنید.</p>
          )}
        </div>
      </div>
      <section style={{ marginTop: 70 }}>
        <h2 style={{ marginBottom: 20 }}>پرسش‌های متداول</h2>
        <FAQ />
      </section>
    </Page>
  );
}
