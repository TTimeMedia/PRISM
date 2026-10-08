import { useAppStore } from '../store/appStore';

/**
 * Demo mode only (see ./demoFetch.ts). Sets the clock to a fixed time of
 * day (default 7:42 AM, or ?time=HH:MM) so screenshots always look the
 * same, and keeps one-time cards out of the way. ?palette= and ?theme=
 * pick the look.
 */

export const demoParams =
  typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);

// Only in the browser: the web server's own render has no window or storage.
if (typeof window !== 'undefined') {
  const RealDate = Date;
  const [hours, minutes] = (demoParams.get('time') ?? '07:42').split(':').map(Number);
  const target = new RealDate();
  target.setHours(hours, minutes, 0, 0);
  const shift = target.getTime() - RealDate.now();

  class DemoDate extends RealDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) super(RealDate.now() + shift);
      else super(...(args as [string]));
    }
    static now() {
      return RealDate.now() + shift;
    }
  }
  globalThis.Date = DemoDate as DateConstructor;

  const look = () => ({
    analyticsConsent: 'declined' as const,
    customizeTipDismissed: true,
    ...(demoParams.get('palette') ? { palette: demoParams.get('palette') as never } : {}),
    ...(demoParams.get('theme') ? { theme: demoParams.get('theme') as never } : {}),
  });
  useAppStore.setState(look());
  useAppStore.persist.onFinishHydration(() => useAppStore.setState(look()));
}
