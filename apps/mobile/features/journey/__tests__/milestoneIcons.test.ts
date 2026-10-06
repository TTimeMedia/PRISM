import { Award, Calendar, Flag, Heart, PartyPopper, Sparkles } from 'lucide-react-native';
import { milestoneIconFor } from '../milestoneIcons';

describe('milestoneIconFor', () => {
  it('uses the icon the person picked', () => {
    expect(milestoneIconFor('heart', 'Legal')).toBe(Heart);
    expect(milestoneIconFor('calendar', null)).toBe(Calendar);
  });

  it('matches the typed category when the icon was left as the default', () => {
    expect(milestoneIconFor('sparkles', 'Birthday')).toBe(PartyPopper);
    expect(milestoneIconFor(null, 'Got the job')).toBe(Award);
    expect(milestoneIconFor('sparkles', 'Legal name change')).toBe(Flag);
    expect(milestoneIconFor(undefined, 'Family')).toBe(Heart);
  });

  it('falls back to Sparkles when nothing fits', () => {
    expect(milestoneIconFor('sparkles', 'Hair')).toBe(Sparkles);
    expect(milestoneIconFor(null, null)).toBe(Sparkles);
  });
});
