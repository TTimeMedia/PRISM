import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMChipGroup,
  PRISMDateInput,
  PRISMHeader,
  PRISMIconButton,
  PRISMInput,
  PRISMModal,
  PRISMSelect,
  PRISMTextArea,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { useMedications } from '../../../lib/care/queries';
import { useDeleteSupply, useSaveSupply, useSupplies } from '../../../lib/care/supplies';

const UNIT_CHOICES = ['mL', 'vials', 'syringes', 'needles', 'pills', 'patches', 'pumps'];
const NO_MEDICATION = 'none';

function parseAmount(text: string): number | null {
  const value = Number(text.replace(',', '.').trim());
  return text.trim() !== '' && Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * Add or edit a supply. Linking it to a medication with an amount per dose
 * lets Prism count it down each time a dose is logged.
 */
export function SupplyFormScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id && id !== 'add';
  const { data: supplies } = useSupplies();
  const { data: medications } = useMedications();
  const save = useSaveSupply();
  const remove = useDeleteSupply();
  const existing = editing ? supplies?.find((s) => s.id === id) : undefined;

  const [loaded, setLoaded] = useState(!editing);
  const [name, setName] = useState('');
  const [medicationId, setMedicationId] = useState<string>(NO_MEDICATION);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [perDose, setPerDose] = useState('');
  const [refillOn, setRefillOn] = useState('');
  const [pharmacy, setPharmacy] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existing || loaded) return;
    setName(existing.name);
    setMedicationId(existing.medication_id ?? NO_MEDICATION);
    setQuantity(String(existing.quantity));
    setUnit(existing.unit ?? '');
    setPerDose(existing.per_dose !== null ? String(existing.per_dose) : '');
    setRefillOn(existing.refill_on ?? '');
    setPharmacy(existing.pharmacy ?? '');
    setNotes(existing.notes ?? '');
    setLoaded(true);
  }, [existing, loaded]);

  const linked = medicationId !== NO_MEDICATION;

  const onSave = async () => {
    const amount = parseAmount(quantity);
    const per = linked && perDose.trim() ? parseAmount(perDose) : null;
    if (!name.trim()) return setError('Give it a name, like "Testosterone vial" or "Syringes".');
    if (amount === null) return setError('Enter how many you have now (0 is fine).');
    if (linked && perDose.trim() && (per === null || per <= 0))
      return setError('The amount per dose should be a number above 0.');
    setError(null);
    try {
      await save.mutateAsync({
        id: editing ? id : undefined,
        values: {
          name: name.trim(),
          medication_id: linked ? medicationId : null,
          quantity: amount,
          unit: unit.trim() || null,
          per_dose: per,
          refill_on: refillOn || null,
          pharmacy: pharmacy.trim() || null,
          notes: notes.trim() || null,
        },
      });
      router.back();
    } catch {
      showToast("Couldn't save this supply. Try again.", 'error');
    }
  };

  const onDelete = async () => {
    setConfirmDelete(false);
    try {
      await remove.mutateAsync(id!);
      router.back();
    } catch {
      showToast("Couldn't delete this supply. Try again.", 'error');
    }
  };

  const medicationOptions = [
    { value: NO_MEDICATION, label: 'Not linked' },
    ...(medications ?? []).map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={editing ? 'Edit supply' : 'Add a supply'}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {loaded ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <PRISMInput
              label="Name"
              placeholder="Testosterone vial, syringes…"
              defaultValue={name}
              onChangeText={setName}
              maxLength={100}
            />
            <PRISMSelect
              label="For which medication?"
              options={medicationOptions}
              value={medicationId}
              onChange={setMedicationId}
            />
            <PRISMInput
              label="How many you have now"
              keyboardType="decimal-pad"
              defaultValue={quantity}
              onChangeText={setQuantity}
            />
            <PRISMInput
              label="Unit (optional)"
              placeholder="mL, vials, syringes…"
              defaultValue={unit}
              key={`unit-${unit}`}
              onChangeText={setUnit}
              maxLength={30}
            />
            <PRISMChipGroup
              options={UNIT_CHOICES.map((u) => ({ value: u, label: u }))}
              value={unit ? [unit] : []}
              onChange={(next) => setUnit(next[next.length - 1] ?? '')}
            />
            {linked ? (
              <PRISMInput
                label="Used per dose (optional)"
                helperText="For example 0.25 for 0.25 mL per shot, or 1 for one syringe. Logging a dose then counts this down, and Undo puts it back."
                keyboardType="decimal-pad"
                defaultValue={perDose}
                onChangeText={setPerDose}
              />
            ) : null}
            <PRISMDateInput
              label="Refill date (optional)"
              value={refillOn}
              onChangeText={setRefillOn}
              helperText="Prism reminds you a week before."
            />
            <PRISMInput
              label="Pharmacy (optional)"
              defaultValue={pharmacy}
              onChangeText={setPharmacy}
              maxLength={200}
            />
            <PRISMTextArea
              label="Notes (optional)"
              defaultValue={notes}
              onChangeText={setNotes}
              maxLength={1000}
            />
            {error ? (
              <Text style={[styles.error, { color: theme.colors.text.primary }]}>{error}</Text>
            ) : null}
            <PRISMButton label="Save" loading={save.isPending} onPress={onSave} />
            {editing ? (
              <PRISMButton
                label="Delete supply"
                variant="destructive"
                onPress={() => setConfirmDelete(true)}
              />
            ) : null}
          </ScrollView>
        ) : null}
      </KeyboardAvoidingView>
      <PRISMModal
        visible={confirmDelete}
        title="Delete this supply?"
        onRequestClose={() => setConfirmDelete(false)}
        actions={[
          { label: 'Cancel', onPress: () => setConfirmDelete(false), variant: 'secondary' },
          { label: 'Delete', onPress: onDelete, variant: 'destructive' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  error: { fontSize: type.bodyS.fontSize, lineHeight: type.bodyS.lineHeight },
});
