import { useLocalSearchParams, router, useCanGoBack } from 'expo-router';
import { View } from 'react-native';
import { getExercise, getExerciseStats } from '../db/repos/workout';
import { formatDate, formatNumber, t } from '../i18n';
import {
  Banner,
  Card,
  Divider,
  EmptyState,
  Header,
  LoadingView,
  Row,
  Screen,
  Section,
  Stat,
  Txt,
} from '../ui/components';
import { useTheme } from '../ui/theme';
import { useQuery } from '../ui/useQuery';

export default function ExerciseDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const exerciseId = typeof params.id === 'string' ? params.id : '';
  const canGo = useCanGoBack();

  const data = useQuery(() => {
    if (!exerciseId) return null;
    const exercise = getExercise(exerciseId);
    if (!exercise) return null;
    return { exercise, stats: getExerciseStats(exerciseId) };
  }, [exerciseId]);

  const goBack = () => {
    if (canGo) router.back();
    else router.replace('/(tabs)/workout');
  };

  if (data.loading && !data.data) return <LoadingView />;
  if (data.error || !data.data) {
    return (
      <Screen>
        <Header title={t.workout.exerciseDetail} onBack={goBack} />
        <Banner tone="danger" title={t.errors.notFound}>
          {data.error ?? t.errors.notFound}
        </Banner>
      </Screen>
    );
  }

  const { exercise, stats } = data.data;
  const bestWeight = stats.reduce((max, s) => Math.max(max, s.topWeightKg), 0);
  const bestE1rm = stats.reduce((max, s) => Math.max(max, s.bestE1rm ?? 0), 0);

  return (
    <Screen>
      <Header
        title={exercise.name}
        subtitle={`${exercise.muscleGroup} · ${exercise.equipment}`}
        onBack={goBack}
      />

      <Card>
        <Row>
          <Stat
            label={t.workout.topSet}
            value={bestWeight > 0 ? `${formatNumber(bestWeight, 1)} ${t.units.kg}` : '–'}
          />
          <Stat
            label={t.workout.estimated1rm}
            value={bestE1rm > 0 ? `${formatNumber(bestE1rm, 1)} ${t.units.kg}` : '–'}
            color={theme.colors.primary}
          />
        </Row>
      </Card>

      <Section title={t.workout.recentSessions}>
        {stats.length === 0 ? (
          <EmptyState icon="barbell-outline" title={t.progress.noExerciseData} />
        ) : (
          <Card>
            {stats.slice(0, 15).map((item, idx) => (
              <View key={item.sessionId} style={{ gap: theme.spacing.sm }}>
                {idx > 0 ? <Divider /> : null}
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="small" weight="600">
                      {formatDate(item.date)}
                    </Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {t.workout.volume}: {formatNumber(item.volume)} {t.units.kg}
                    </Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Txt variant="small" weight="600">
                      {formatNumber(item.topWeightKg, 1)} {t.units.kg} × {item.topReps}
                    </Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {item.bestE1rm !== null
                        ? `e1RM ${formatNumber(item.bestE1rm, 1)}`
                        : t.workout.notEstimated}
                    </Txt>
                  </View>
                </Row>
              </View>
            ))}
          </Card>
        )}
      </Section>
    </Screen>
  );
}
