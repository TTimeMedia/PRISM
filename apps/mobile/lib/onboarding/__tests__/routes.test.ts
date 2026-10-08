import { isOnboardingBack, onboardingBackHref, onboardingStepHref } from '../routes';

describe('onboarding back navigation', () => {
  it('marks a screen reached by Back so it slides in backwards', () => {
    expect(onboardingBackHref('identity')).toBe('/(onboarding)/identity?back=1');
    expect(onboardingStepHref('identity')).toBe('/(onboarding)/identity');
  });

  it('only treats the back marker as going back', () => {
    expect(isOnboardingBack({ back: '1' })).toBe(true);
    expect(isOnboardingBack({})).toBe(false);
    expect(isOnboardingBack(undefined)).toBe(false);
  });
});
