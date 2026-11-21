import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Page } from '@/components/store/page';
import { settingsOptions } from '@/lib/settings';
import { pageHead } from '@/lib/metadata';
import mountain from '@/assets/mountain.asset.json';

export const Route = createFileRoute('/about')({
  head: () => pageHead('درباره ما', 'داستان EDVARDO؛ سادگی در اوج زیبایی و انتخابی خاص برای هر سلیقه.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsOptions),
  component: About,
});

function About() {
  const { data: settings } = useSuspenseQuery(settingsOptions);
  return (
    <Page title="درباره EDVARDO" subtitle="سادگی، در اوج زیبایی.">
      <div className="editorial-grid">
        <img src={mountain.url} alt="کوهستان برفی؛ الهام هویت EDVARDO" loading="lazy" />
        <div className="prose-copy">
          <h2>داستان ما</h2>
          {settings['about_story'] ? (
            settings['about_story'].split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <>
              <p>EDVARDO نگاهی مدرن به پوشاک، انتخاب و شخصیت است؛ از سکوت کوهستان تا جزئیات استایل شما.</p>
              <p>ما دو دنیا را کنار هم ساخته‌ایم: پوشاک مردانه برای کسانی که به جزئیات اهمیت می‌دهند و پوشاک کودکانه‌ای راحت و دوست‌داشتنی.</p>
            </>
          )}
          <div className="flex gap-3" style={{ marginTop: 24 }}>
            <Button asChild><Link to="/men">کالکشن مردانه <ArrowLeft /></Link></Button>
            <Button asChild variant="outline"><Link to="/kids">کالکشن بچگانه</Link></Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
