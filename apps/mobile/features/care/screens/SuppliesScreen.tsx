import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Package, Plus } from 'lucide-react-native';
import {
  PRIZMEmptyState,
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMSkeleton,
  spacing,
  type,
  useTheme,
} from '@prizm/ui';
import { useMedications } from '../../../lib/care/queries';
import { useSupplies } from '../../../lib/care/supplies';
import { outlookLabel, supplyOutlook } from '../../../lib/care/supplyOutlook';
import { ItemRow } from '../../../components/home';

/** Supplies and refills: what's left of each, and when to restock. */
export function SuppliesScreen() {
  const theme = useTheme();
  const { data: supplies, isLoading, isError, refetch } = useSupplies();
  const { data: medications } = useMedications();

  const rows = (supplies ?? []).map((supply) => {
    const medication = medications?.find((m) => m.id === supply.medication_id);
    const outlook = supplyOutlook(supply, medication);
    return { supply, medication, outlook };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Supplies"
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
        trailing={
          <PRIZMIconButton
            accessibilityLabel="Add a supply"
            onPress={() => router.push('/care/supplies/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <PRIZMSkeleton height={56} />
        ) : isError ? (
          <PRIZMErrorState onRetry={() => refetch()} />
        ) : rows.length === 0 ? (
          <PRIZMEmptyState
            title="No supplies yet."
            subtitle="Add a vial, syringes or pills. Linked to a medication, Prizm counts them down as you log doses and reminds you before you run out."
            action={{ label: 'Add a supply', onPress: () => router.push('/care/supplies/add') }}
          />
        ) : (
          <>
            <Text style={[styles.intro, { color: theme.colors.text.secondary }]}>
              Prizm reminds you a week before something runs out or is due for a refill.
            </Text>
            <View style={styles.list}>
              {rows.map(({ supply, medication, outlook }) => (
                <ItemRow
                  key={supply.id}
                  icon={Package}
                  tint={outlook.low || outlook.refillSoon ? 'pink' : 'violet'}
                  title={outlook.low ? `${supply.name} · running low` : supply.name}
                  subtitle={[outlookLabel(supply, outlook), medication?.name]
                    .filter(Boolean)
                    .join(' · ')}
                  onPress={() => router.push(`/care/supplies/${supply.id}`)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  intro: { fontSize: type.bodyS.fontSize, lineHeight: type.bodyS.lineHeight },
  list: { gap: spacing.sm },
});
