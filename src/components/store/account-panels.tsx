import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { settingFields } from '@/lib/setting-fields';
import { settingsOptions } from '@/lib/settings';
import type { Tables } from '@/lib/db-types';

export type Address = Tables<'addresses'>;
export const emptyAddress = { full_name: '', phone: '', province: '', city: '', address: '', postal_code: '' };
export type AddressDraft = typeof emptyAddress;

export function validateAddress(a: AddressDraft): string {
  if (a.full_name.trim().length < 2) return 'نام گیرنده را وارد کنید.';
  if (!/^09\d{9}$/.test(a.phone.trim())) return 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.';
  if (!a.province.trim() || !a.city.trim()) return 'استان و شهر را وارد کنید.';
  if (a.address.trim().length < 10) return 'نشانی کامل‌تر وارد کنید.';
  if (!/^\d{10}$/.test(a.postal_code.trim())) return 'کد پستی باید ۱۰ رقم باشد.';
  return '';
}

export function AddressFields({ value, onChange }: { value: AddressDraft; onChange: (v: AddressDraft) => void }) {
  const set = (k: keyof AddressDraft, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="form-grid">
      <label>نام گیرنده<input value={value.full_name} onChange={(e) => set('full_name', e.target.value)} maxLength={100} /></label>
      <label>موبایل<input dir="ltr" inputMode="numeric" value={value.phone} onChange={(e) => set('phone', e.target.value)} maxLength={11} /></label>
      <label>استان<input value={value.province} onChange={(e) => set('province', e.target.value)} /></label>
      <label>شهر<input value={value.city} onChange={(e) => set('city', e.target.value)} /></label>
      <label className="wide">نشانی کامل<textarea rows={3} value={value.address} onChange={(e) => set('address', e.target.value)} /></label>
      <label>کد پستی<input dir="ltr" inputMode="numeric" value={value.postal_code} onChange={(e) => set('postal_code', e.target.value)} maxLength={10} /></label>
    </div>
  );
}

export function useAddresses(userId: string | undefined) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState('');
  const reload = async () => {
    if (!userId) return setAddresses([]);
    const { data, error } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });
    if (error) setError('دریافت آدرس‌ها انجام نشد.');
    else { setError(''); setAddresses(data ?? []); }
  };
  useEffect(() => { void reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId]);
  return { addresses, error, reload };
}

export function ProfilePanel({ userId, email }: { userId: string; email: string }) {
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  const [status, setStatus] = useState('');
  useEffect(() => {
    void supabase.from('profiles').select('full_name,phone').eq('id', userId).maybeSingle().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [userId]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.phone && !/^09\d{9}$/.test(profile.phone)) return setStatus('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.');
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...profile });
    setStatus(error ? 'ذخیره انجام نشد.' : 'اطلاعات شما ذخیره شد.');
  };
  return (
    <form className="stack-form" onSubmit={save}>
      <h2>اطلاعات حساب</h2>
      <label>ایمیل<input dir="ltr" value={email} readOnly /></label>
      <label>نام و نام خانوادگی<input value={profile.full_name} maxLength={100} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} /></label>
      <label>موبایل<input dir="ltr" inputMode="numeric" value={profile.phone} maxLength={11} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
      <Button>ذخیره</Button>
      {status && <p role="status" className="form-status">{status}</p>}
    </form>
  );
}

export function AddressesPanel({ userId }: { userId: string }) {
  const { addresses, error, reload } = useAddresses(userId);
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress);
  const [status, setStatus] = useState('');
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validateAddress(draft);
    if (problem) return setStatus(problem);
    const { error } = await supabase.from('addresses').insert({ ...draft, user_id: userId });
    if (error) return setStatus('ذخیره آدرس انجام نشد.');
    setDraft(emptyAddress); setStatus('آدرس ذخیره شد.'); void reload();
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) setStatus('حذف انجام نشد.'); else void reload();
  };
  return (
    <div>
      <h2>آدرس‌های من</h2>
      {error && <p role="alert" className="form-status text-destructive">{error}</p>}
      <div className="address-list">
        {!addresses.length && <p className="form-note">هنوز آدرسی ثبت نکرده‌اید.</p>}
        {addresses.map((a) => (
          <div className="address-item" key={a.id}>
            <div>
              <strong>{a.full_name}</strong>
              <p>{a.province}، {a.city}، {a.address}</p>
              <p>کد پستی: <span dir="ltr">{a.postal_code}</span> — موبایل: <span dir="ltr">{a.phone}</span></p>
            </div>
            <Button variant="ghost" size="icon" aria-label="حذف آدرس" title="حذف آدرس" onClick={() => remove(a.id)}><Trash2 /></Button>
          </div>
        ))}
      </div>
      <form className="stack-form" onSubmit={add}>
        <h3>افزودن آدرس جدید</h3>
        <AddressFields value={draft} onChange={setDraft} />
        <Button>ذخیره آدرس</Button>
        {status && <p role="status" className="form-status">{status}</p>}
      </form>
    </div>
  );
}

export function OrdersPanel() {
  return (
    <div>
      <h2>سفارش‌ها</h2>
      <div className="notice">
        نمایش سفارش‌ها و پیگیری آن‌ها هنوز فعال نشده است؛ این بخش پس از اتصال حساب فروشگاه (Admin API) و درگاه پرداخت تکمیل می‌شود. سفارشی که پرداخت آن تأیید نشده باشد، ثبت‌شده در نظر گرفته نمی‌شود.
      </div>
    </div>
  );
}

export function AdminPanel() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'settings' | 'messages' | 'subs'>('settings');
  const [values, setValues] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Tables<'contact_messages'>[]>([]);
  const [subs, setSubs] = useState<Tables<'newsletter_subscriptions'>[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    void supabase.from('store_settings').select('key,value').then(({ data }) => setValues(Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))));
    void supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data }) => setMessages(data ?? []));
    void supabase.from('newsletter_subscriptions').select('*').order('created_at', { ascending: false }).then(({ data }) => setSubs(data ?? []));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const rows = settingFields.map((f) => ({ key: f.key as string, value: (values[f.key] ?? '').trim() }));
    const { error } = await supabase.from('store_settings').upsert(rows, { onConflict: 'key' });
    setStatus(error ? 'ذخیره تنظیمات انجام نشد.' : 'تنظیمات ذخیره شد.');
    if (!error) void qc.invalidateQueries({ queryKey: settingsOptions.queryKey });
  };
  const removeMessage = async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (!error) setMessages((m) => m.filter((x) => x.id !== id));
  };
  const removeSub = async (id: string) => {
    const { error } = await supabase.from('newsletter_subscriptions').delete().eq('id', id);
    if (!error) setSubs((m) => m.filter((x) => x.id !== id));
  };

  return (
    <div>
      <h2>مدیریت فروشگاه</h2>
      <div className="admin-tabs">
        <Button variant={tab === 'settings' ? 'default' : 'outline'} onClick={() => setTab('settings')}>تنظیمات و متن‌ها</Button>
        <Button variant={tab === 'messages' ? 'default' : 'outline'} onClick={() => setTab('messages')}>پیام‌ها ({messages.length})</Button>
        <Button variant={tab === 'subs' ? 'default' : 'outline'} onClick={() => setTab('subs')}>خبرنامه ({subs.length})</Button>
      </div>
      {tab === 'settings' && (
        <form className="stack-form" onSubmit={save}>
          {settingFields.map((f) => (
            <label key={f.key}>{f.label}
              {f.long
                ? <textarea rows={4} value={values[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                : <input value={values[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />}
            </label>
          ))}
          <Button>ذخیره تنظیمات</Button>
          {status && <p role="status" className="form-status">{status}</p>}
        </form>
      )}
      {tab === 'messages' && (messages.length ? messages.map((m) => (
        <div className="admin-row" key={m.id}>
          <div><strong>{m.name}</strong> — <span dir="ltr">{m.email}</span><p>{m.message}</p><p>{new Date(m.created_at).toLocaleString('fa-IR')}</p></div>
          <Button variant="ghost" size="icon" aria-label="حذف پیام" onClick={() => removeMessage(m.id)}><Trash2 /></Button>
        </div>
      )) : <p className="form-note">پیامی وجود ندارد.</p>)}
      {tab === 'subs' && (subs.length ? subs.map((s) => (
        <div className="admin-row" key={s.id}>
          <div><span dir="ltr">{s.contact}</span><p>{new Date(s.created_at).toLocaleString('fa-IR')}</p></div>
          <Button variant="ghost" size="icon" aria-label="حذف عضو" onClick={() => removeSub(s.id)}><Trash2 /></Button>
        </div>
      )) : <p className="form-note">عضوی وجود ندارد.</p>)}
    </div>
  );
}
