import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import type { MealType } from '../../config';
import {
  copyDay,
  deleteMealEntry,
  getRangeDayTotals,
  groupMeals,
  sumEntries,
} from '../../db/repos/food';
import { getProfileBundle } from '../../db/repos/profile';
import { addDaysISO, startOfWeekISO, todayISO } from '../../domain/dates';
import { formatDate, formatKcal, formatNumber, formatWeekday, t } from '../../i18n';
import { useUi } from '../../state/ui';
import {
  AppModal,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  Header,
  IconButton,
  LoadingView,
  Row,
  Screen,
  Section,
  Txt,
  useConfirm,
} from '../../ui/components';
import { useTheme } from '../../ui/theme';
import { useQuery } from '../../ui/useQuery';

export default function FoodScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);
  const confirm = useConfirm();
  const [date, setDate] = useState(todayISO());
  const [copyOpen, setCopyOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const day = useQuery(() => {
    const groups = groupMeals(date);
    return {
      groups,
      totals: sumEntries(groups.flatMap((group) => group.entries)),
      target: getProfileBundle(date)?.target ?? null,
    };
  }, [date]);

  const history = useQuery(
    () =>
      copyOpen
        ? getRangeDayTotals(addDaysISO(date, -7), addDaysISO(date, -1)).filter(
            (row) => row.totals.entryCount > 0,
          )
        : [],
    [copyOpen, date],
  );

  // Weekly view: 7 days from start of week
  const weekStart = startOfWeekISO(date);
  const weekData = useQuery(
    () =>
      viewMode === 'week'
        ? getRangeDayTotals(weekStart, addDaysISO(weekStart, 6)).filter((row) => row.totals.entryCount > 0)
        : [],
    [viewMode, weekStart],
  );

  if (day.loading && !day.data) return <LoadingView />;
  if (day.error) {
    return (
      <Screen>
        <Banner tone="danger" title={t.errors.db}>
          {day.error}
        </Banner>
      </Screen>
    );
  }

  const data = day.data;
  if (!data) return null;
  const { groups, totals, target } = data;

  const openAdd = (mealType: MealType) =>
    router.push({ pathname: '/food-search', params: { date, meal: mealType } });

  const removeEntry = (id: string) =>
    confirm.show({
      title: t.food.deleteConfirm,
      confirmLabel: t.common.delete,
      destructive: true,
      onConfirm: () => {
        deleteMealEntry(id);
        bump();
      },
    });

  const doCopy = (from: string) => {
    const copied = copyDay(from, date);
    setCopyOpen(false);
    bump();
    if (copied === 0) confirm.show({ title: t.common.noData, message: t.food.emptyDay });
  };

  return (
    <Screen>
      <Header
        title={t.food.dailyTitle}
        subtitle={formatDate(date)}
        right={
          <IconButton name="copy-outline" label={t.food.copyDay} onPress={() => setCopyOpen(true)} />
        }
      />

      {viewMode === 'day' ? (
        <Row gap={8}>
          <IconButton
            name="chevron-back"
            label={t.common.yesterday}
            onPress={() => setDate(addDaysISO(date, -1))}
          />
          <Txt variant="h3" style={{ flex: 1, textAlign: 'center' }}>
            {formatWeekday(date)}
          </Txt>
          <IconButton
            name="chevron-forward"
            label={t.common.tomorrow}
            onPress={() => setDate(addDaysISO(date, 1))}
          />
          {date === todayISO() ? null : (
            <Button
              title={t.common.today}
              small
              fullWidth={false}
              variant="secondary"
              onPress={() => setDate(todayISO())}
            />
          )}
        </Row>
      ) : (
        <Row gap={8} style={{ alignItems: 'center' }}>
          <IconButton
            name="chevron-back"
            label={t.common.yesterday}
            onPress={() => setDate(addDaysISO(date, -7))}
          />
          <Txt variant="h3" style={{ flex: 1, textAlign: 'center' }}>
            {t.food.weekView}
          </Txt>
          <IconButton
            name="chevron-forward"
            label={t.common.tomorrow}
            onPress={() => setDate(addDaysISO(date, 7))}
          />
          {weekStart === startOfWeekISO(todayISO()) ? null : (
            <Button
              title={t.common.today}
              small
              fullWidth={false}
              variant="secondary"
              onPress={() => setDate(todayISO())}
            />
          )}
        </Row>
      )}

      {/* View mode toggle */}
      <Row gap={8}>
        <Chip
          label={t.food.dayView}
          selected={viewMode === 'day'}
          onPress={() => setViewMode('day')}
        />
        <Chip
          label={t.food.weekView}
          selected={viewMode === 'week'}
          onPress={() => setViewMode('week')}
        />
      </Row>

      {viewMode === 'week' ? (
        <Section title={t.food.weeklyHistory}>
          <Card>
            {(weekData.data ?? []).length === 0 ? (
              <EmptyState icon="calendar-outline" title={t.common.noData} body={t.food.emptyDay} />
            ) : (
              (weekData.data ?? []).map((row, index) => (
                <View key={row.date} style={{ gap: theme.spacing.sm }}>
                  {index > 0 ? <Divider /> : null}
                  <Row>
                    <View style={{ flex: 1 }}>
                      <Txt variant="small" weight="600">
                        {formatDate(row.date)}
                      </Txt>
                      <Txt variant="caption" color={theme.colors.textMuted}>
                        {row.totals.entryCount} {t.food.entries}
                      </Txt>
                    </View>
                    <Row gap={6}>
                      <Badge label={formatKcal(row.totals.kcal)} />
                      <Badge label={`P ${formatNumber(row.totals.proteinG)}`} />
                    </Row>
                  </Row>
                  {target ? (
                    <Txt variant="caption" color={row.totals.kcal > target.calories ? theme.colors.danger : theme.colors.textMuted}>
                      {row.totals.kcal > target.calories
                        ? `${formatKcal(row.totals.kcal - target.calories)} ${t.common.over}`
                        : `${formatKcal(target.calories - row.totals.kcal)} ${t.common.remaining}`}
                    </Txt>
                  ) : null}
                </View>
              ))
            )}
          </Card>
        </Section>
      ) : (
        <>
          {totals.entryCount === 0 ? (
            <EmptyState
              icon="restaurant-outline"
              title={t.food.emptyDay}
              action={
                <Row gap={8}>
                  {groups.slice(0, 2).map((group) => (
                    <Button
                      key={group.mealType}
                      title={t.meal[group.mealType]}
                      small
                      fullWidth={false}
                      variant="secondary"
                      onPress={() => openAdd(group.mealType)}
                    />
                  ))}
                </Row>
              }
            />
          ) : null}

          <Section title={t.food.title}>
            {groups.map((group) => (
              <Card key={group.mealType}>
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="h3">{t.meal[group.mealType]}</Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {formatKcal(group.totals.kcal)} · {group.entries.length} {t.food.entries}
                    </Txt>
                  </View>
                  <Button
                    title={t.common.add}
                    icon="add"
                    small
                    fullWidth={false}
                    onPress={() => openAdd(group.mealType)}
                  />
                </Row>
                {group.entries.length === 0 ? (
                  <Txt variant="caption" color={theme.colors.textMuted}>
                    {t.food.emptyMeal}
                  </Txt>
                ) : (
                  group.entries.map((entry, index) => (
                    <View key={entry.id} style={{ gap: theme.spacing.sm }}>
                      {index > 0 ? <Divider /> : null}
                      <Row>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Txt variant="small" weight="600" numberOfLines={1}>
                            {entry.nameSnapshot}
                          </Txt>
                          <Txt variant="caption" color={theme.colors.textMuted}>
                            {formatNumber(entry.grams)} {t.units.g} · {formatKcal(entry.kcal)}
                          </Txt>
                        </View>
                        <Badge label={`P ${formatNumber(entry.proteinG)}`} />
                        <IconButton
                          name="trash-outline"
                          label={`${t.common.delete} ${entry.nameSnapshot}`}
                          size={20}
                          onPress={() => removeEntry(entry.id)}
                        />
                      </Row>
                    </View>
                  ))
                )}
              </Card>
            ))}
          </Section>
        </>
      )}

      <AppModal visible={copyOpen} title={t.food.copyDay} onClose={() => setCopyOpen(false)}>
        <Txt variant="small" color={theme.colors.textMuted}>
          {t.food.historyTitle}
        </Txt>
        {(history.data ?? []).length === 0 ? (
          <EmptyState icon="calendar-outline" title={t.common.noData} body={t.food.emptyDay} />
        ) : (
          (history.data ?? []).map((row) => (
            <Card key={row.date} onPress={() => doCopy(row.date)}>
              <Row>
                <Txt variant="small" weight="600">
                  {formatDate(row.date)}
                </Txt>
                <Txt variant="caption" color={theme.colors.textMuted}>
                  {formatKcal(row.totals.kcal)} · {row.totals.entryCount} {t.food.entries}
                </Txt>
              </Row>
            </Card>
          ))
        )}
      </AppModal>

      {confirm.element}
    </Screen>
  );
}
