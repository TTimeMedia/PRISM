import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { EditProfileScreen } from '../EditProfileScreen';
import { useProfile, useUpdateProfile } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
}));

jest.mock('../../../../lib/auth/AuthProvider', () => ({
  useSession: () => ({ session: { user: { id: 'u1' } } }),
}));

jest.mock('../../../../lib/you/profilePhoto', () => ({
  pickProfilePhoto: jest.fn(),
  uploadProfilePhoto: jest.fn(),
}));

jest.mock('../../../../lib/you/useSignedProfilePhotoUrl', () => ({
  useSignedProfilePhotoUrl: () => ({ data: null }),
}));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;

const mutateAsync = jest.fn().mockResolvedValue(undefined);

describe('EditProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProfile.mockReturnValue({
      data: {
        display_name: null,
        pronouns: null,
        gender: null,
        birthday: null,
        journey_start_date: null,
        profile_photo_url: null,
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync, isPending: false } as never);
  });

  it('does not ask for a journey start date', () => {
    renderWithProviders(<EditProfileScreen />);

    expect(screen.getByText('Birthday')).toBeTruthy();
    expect(screen.queryByText('Journey start date')).toBeNull();
  });

  it('saves with every field left empty', async () => {
    renderWithProviders(<EditProfileScreen />);

    fireEvent.press(screen.getByText('Save changes'));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mutateAsync.mock.calls[0][0]).not.toHaveProperty('journey_start_date');
    expect(mutateAsync.mock.calls[0][0].birthday).toBeNull();
    expect(router.back).toHaveBeenCalled();
  });
});
