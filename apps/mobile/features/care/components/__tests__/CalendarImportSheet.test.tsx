import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { CalendarImportSheet } from '../CalendarImportSheet';
import { calendarProvider } from '../../../../lib/calendar';
import { useAppointments } from '../../../../lib/care/queries';
import { useCreateAppointment } from '../../../../lib/care/mutations';

jest.mock('../../../../lib/calendar', () => ({
  calendarProvider: {
    requestReadPermission: jest.fn(),
    listUpcomingEvents: jest.fn(),
  },
}));

jest.mock('../../../../lib/care/queries', () => ({
  useAppointments: jest.fn(),
}));

jest.mock('../../../../lib/care/mutations', () => ({
  useCreateAppointment: jest.fn(),
}));

const provider = calendarProvider as jest.Mocked<typeof calendarProvider>;
const mockedUseAppointments = useAppointments as jest.MockedFunction<typeof useAppointments>;
const mockedUseCreateAppointment = useCreateAppointment as jest.MockedFunction<
  typeof useCreateAppointment
>;

const EVENTS = [
  {
    id: 'e1',
    title: 'Endocrinology',
    location: 'Riverside Clinic',
    notes: null,
    startsAt: '2026-10-05T14:30:00.000Z',
    endsAt: '2026-10-05T15:00:00.000Z',
    allDay: false,
  },
  {
    id: 'e2',
    title: 'Team lunch',
    location: null,
    notes: null,
    startsAt: '2026-10-06T17:00:00.000Z',
    endsAt: null,
    allDay: false,
  },
  {
    id: 'e3',
    title: 'Primary care',
    location: null,
    notes: null,
    startsAt: '2026-10-07T13:00:00.000Z',
    endsAt: null,
    allDay: false,
  },
];

describe('CalendarImportSheet', () => {
  const createMutateAsync = jest.fn().mockResolvedValue(undefined);
  const onClose = jest.fn();
  const onImported = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAppointments.mockReturnValue({
      data: [{ title: 'Primary care', starts_at: '2026-10-07T13:00:00.000Z' }],
    } as never);
    mockedUseCreateAppointment.mockReturnValue({ mutateAsync: createMutateAsync } as never);
    createMutateAsync.mockResolvedValue(undefined);
    provider.requestReadPermission.mockResolvedValue(true);
    provider.listUpcomingEvents.mockResolvedValue(EVENTS);
  });

  const open = () =>
    renderWithProviders(<CalendarImportSheet visible onClose={onClose} onImported={onImported} />);

  it('reads nothing until the person chooses to', () => {
    open();

    expect(screen.getByText('Choose from my calendar')).toBeTruthy();
    expect(provider.requestReadPermission).not.toHaveBeenCalled();
    expect(provider.listUpcomingEvents).not.toHaveBeenCalled();
  });

  it('adds only the events that were ticked', async () => {
    open();
    fireEvent.press(screen.getByText('Choose from my calendar'));

    fireEvent.press(await screen.findByLabelText('Endocrinology'));
    fireEvent.press(screen.getByText('Add 1 appointment'));

    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith({
        title: 'Endocrinology',
        location: 'Riverside Clinic',
        notes: null,
        starts_at: '2026-10-05T14:30:00.000Z',
        ends_at: '2026-10-05T15:00:00.000Z',
        reminder_enabled: false,
      }),
    );
    expect(createMutateAsync).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onImported).toHaveBeenCalledWith(1));
    expect(onClose).toHaveBeenCalled();
  });

  it('cannot add an appointment that is already in Prism', async () => {
    open();
    fireEvent.press(screen.getByText('Choose from my calendar'));

    expect(await screen.findByText('Already in Prism')).toBeTruthy();
    expect(screen.getByLabelText('Primary care').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('Pick appointments to add')).toBeTruthy();
  });

  it('filters the list as the person searches', async () => {
    open();
    fireEvent.press(screen.getByText('Choose from my calendar'));
    await screen.findByLabelText('Team lunch');

    fireEvent.changeText(screen.getByLabelText('Search events'), 'clinic');

    expect(screen.queryByLabelText('Team lunch')).toBeNull();
    expect(screen.getByLabelText('Endocrinology')).toBeTruthy();
  });

  it('explains what to do when calendar access is refused, and reads nothing', async () => {
    provider.requestReadPermission.mockResolvedValue(false);
    open();
    fireEvent.press(screen.getByText('Choose from my calendar'));

    expect(await screen.findByText(/Calendar access wasn.t allowed/)).toBeTruthy();
    expect(provider.listUpcomingEvents).not.toHaveBeenCalled();
  });
});
