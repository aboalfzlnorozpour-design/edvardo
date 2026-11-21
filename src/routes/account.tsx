import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/store/page';
import { useAuth } from '@/components/store/auth';
import { AddressesPanel, AdminPanel, OrdersPanel, ProfilePanel } from '@/components/store/account-panels';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { pageHead } from '@/lib/metadata';
import men from '@/assets/men.asset.json';

export const Route = createFileRoute('/account')({
  head: () => pageHead('حساب من', 'ورود، ثبت‌نام و مدیریت حساب کاربری EDVARDO.'),
  component: Account,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

type Mode = 'login' | 'signup' | 'forgot';

function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setStatus('ایمیل معتبر وارد کنید.');
    if (mode !== 'forgot' && password.length < 8) return setStatus('رمز عبور باید حداقل ۸ نویسه باشد.');
    setBusy(true); setStatus('');
    const origin = window.location.origin;
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setStatus('ایمیل یا رمز عبور درست نیست.');
    } else if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${origin}/account` } });
      if (error) setStatus('ثبت‌نام انجام نشد. اطلاعات را بررسی کنید.');
      else if (!data.session) setStatus('لینک تأیید به ایمیل شما ارسال شد.');
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/reset-password` });
      setStatus(error ? 'ارسال لینک بازیابی انجام نشد.' : 'اگر این ایمیل ثبت شده باشد، لینک بازیابی برایش ارسال می‌شود.');
    }
    setBusy(false);
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/account` });
    if (result.error) setStatus('ورود با گوگل انجام نشد.');
  };

  return (
    <div className="auth-layout">
      <div>
        <div className="auth-tabs">
          <Button variant={mode === 'login' ? 'default' : 'ghost'} onClick={() => { setMode('login'); setStatus(''); }}>ورود</Button>
          <Button variant={mode === 'signup' ? 'default' : 'ghost'} onClick={() => { setMode('signup'); setStatus(''); }}>ثبت‌نام</Button>
        </div>
        <form className="stack-form" onSubmit={submit} noValidate>
          <label>ایمیل<input type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          {mode !== 'forgot' && (
            <label>رمز عبور
              <input type="password" dir="ltr" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          )}
          <Button disabled={busy}>{mode === 'login' ? 'ورود' : mode === 'signup' ? 'ایجاد حساب' : 'ارسال لینک بازیابی'}</Button>
          {status && <p role="status" className="form-status">{status}</p>}
          {mode === 'login' && <Button type="button" variant="link" onClick={() => { setMode('forgot'); setStatus(''); }}>رمز عبور را فراموش کرده‌ام</Button>}
          {mode === 'forgot' && <Button type="button" variant="link" onClick={() => { setMode('login'); setStatus(''); }}>بازگشت به ورود</Button>}
        </form>
        <div className="providers">
          <Button type="button" variant="provider" onClick={google}><GoogleIcon /> ادامه با گوگل</Button>
        </div>
      </div>
      <img className="auth-photo" src={men.url} alt="" loading="lazy" />
    </div>
  );
}

type Tab = 'profile' | 'addresses' | 'orders' | 'admin';

function Dashboard({ userId, email }: { userId: string; email: string }) {
  const [tab, setTab] = useState<Tab>('profile');
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    void supabase.from('user_roles').select('role').eq('user_id', userId).then(({ data }) => setIsAdmin(!!data?.some((r) => r.role === 'admin')));
  }, [userId]);
  const tabs: [Tab, string][] = [['profile', 'اطلاعات حساب'], ['addresses', 'آدرس‌ها'], ['orders', 'سفارش‌ها']];
  if (isAdmin) tabs.push(['admin', 'مدیریت فروشگاه']);
  return (
    <div className="account-layout">
      <nav className="account-nav" aria-label="منوی حساب">
        {tabs.map(([key, label]) => <Button key={key} variant={tab === key ? 'default' : 'ghost'} onClick={() => setTab(key)}>{label}</Button>)}
        <Button asChild variant="ghost" className="justify-start"><Link to="/wishlist">علاقه‌مندی‌ها</Link></Button>
        <Button variant="outline" onClick={() => void supabase.auth.signOut()}>خروج از حساب</Button>
      </nav>
      <div className="account-body">
        {tab === 'profile' && <ProfilePanel userId={userId} email={email} />}
        {tab === 'addresses' && <AddressesPanel userId={userId} />}
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'admin' && isAdmin && <AdminPanel />}
      </div>
    </div>
  );
}

function Account() {
  const { user, ready } = useAuth();
  return (
    <Page title={user ? 'حساب من' : 'ورود / ثبت‌نام'} subtitle={user ? undefined : 'برای ذخیره آدرس‌ها و علاقه‌مندی‌ها وارد شوید.'}>
      {!ready ? <p className="form-note">در حال بارگذاری…</p> : user ? <Dashboard userId={user.id} email={user.email ?? ''} /> : <AuthForm />}
    </Page>
  );
}
