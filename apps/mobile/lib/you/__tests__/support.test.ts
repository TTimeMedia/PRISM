import { SUPPORT_EMAIL, supportMailto } from '../support';

const device = { appVersion: '0.3.0', platform: 'ios', osVersion: '18.2' };

function parse(url: string) {
  const [address, query] = url.replace('mailto:', '').split('?');
  const params = new URLSearchParams(query);
  return { address, subject: params.get('subject'), body: params.get('body') ?? '' };
}

describe('supportMailto', () => {
  it('addresses the published support email with a subject per topic', () => {
    expect(parse(supportMailto('contact', device))).toMatchObject({
      address: SUPPORT_EMAIL,
      subject: 'Prism support',
    });
    expect(parse(supportMailto('problem', device)).subject).toBe('Prism problem report');
    expect(parse(supportMailto('privacy', device)).subject).toBe('Prism privacy concern');
  });

  it('adds the app version and platform, and nothing else about the person', () => {
    const { body } = parse(supportMailto('problem', device));
    expect(body).toContain('Prism 0.3.0 · ios 18.2');
    expect(body).toContain('Please leave out anything about your medications or health.');
  });
});
