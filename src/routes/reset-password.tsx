import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/store/page';
import { pageHead } from '@/lib/metadata';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/reset-password')({
  head: () => pageHead('بازیابی رمز عبور', 'تعیین رمز عبور جدید برای حساب EDVARDO.'),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setStatus('رمز عبور باید حداقل ۸ نویسه باشد.');
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setStatus('تغییر رمز انجام نشد. لینک بازیابی را دوباره درخواست کنید.');
    setDone(true);
    setStatus('رمز عبور شما تغییر کرد.');
  };

  return (
    <Page title="تعیین رمز عبور جدید">
      <form className="stack-form" style={{ maxWidth: 420 }} onSubmit={submit}>
        <label>رمز عبور جدید
          <input type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <Button disabled={busy || done}>ذخیره رمز جدید</Button>
        {status && <p role="status" className="form-status">{status}</p>}
        {done && <Button asChild variant="outline"><Link to="/account">رفتن به حساب من</Link></Button>}
      </form>
    </Page>
  );
}
