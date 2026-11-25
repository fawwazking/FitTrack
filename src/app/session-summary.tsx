import { useLocalSearchParams, router, useCanGoBack } from 'expo-router';
import { Alert, View } from 'react-native';
import { deleteSession, getSessionSummary } from '../db/repos/workout';
import { formatDate, formatDuration, formatNumber, t } from '../i18n';
import { useUi } from '../state/ui';
import {
  Badge,
  Banner,
  Button,
  Card,
  Divider,
  Header,
  IconButton,
  LoadingView,
  Row,
  Screen,
  Section,
  Stat,
  Txt,
} from '../ui/components';
import { useTheme } from '../ui/theme';
import { useQuery } from '../ui/useQuery';

export default function SessionSummaryScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);
  const params = useLocalSearchParams<{ id?: string }>();
  const sessionId = typeof params.id === 'string' ? params.id : '';
  const canGo = useCanGoBack();

  const summary = useQuery(() => (sessionId ? getSessionSummary(sessionId) : null), [sessionId]);

  const goBack = () => {
    if (canGo) router.back();
    else router.replace('/(tabs)/workout');
  };

  if (summary.loading && !summary.data) return <LoadingView />;
  if (summary.error || !summary.data) {
    return (
      <Screen>
        <Header title={t.workout.sessionSummary} onBack={goBack} />
        <Banner tone="danger" title={t.errors.notFound}>
          {summary.error ?? t.errors.notFound}
        </Banner>
      </Screen>
    );
  }

  const { session, totalVolume, totalWorkingSets, durationSeconds, prs } = summary.data;

  const confirmDelete = () =>
    Alert.alert(t.workout.deleteSessionConfirm, undefined, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          deleteSession(session.id);
          bump();
          router.replace('/(tabs)/workout');
        },
      },
    ]);

  return (
    <Screen>
      <Header
        title={t.workout.sessionSummary}
        subtitle={`${session.programDayName ?? t.workout.title} · ${formatDate(session.date)}`}
        onBack={goBack}
        right={
          <IconButton name="trash-outline" label={t.common.delete} onPress={confirmDelete} />
        }
      />

      <Card>
        <Row>
          <Stat label={t.workout.totalVolume} value={`${formatNumber(totalVolume)} ${t.units.kg}`} />
          <Stat label={t.workout.setsShort} value={String(totalWorkingSets)} />
          <Stat label={t.workout.duration} value={formatDuration(durationSeconds)} />
        </Row>
      </Card>

      <Section title={t.workout.prList}>
        <Card>
          {prs.length === 0 ? (
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.workout.noPr}
            </Txt>
          ) : (
            prs.map((pr, idx) => (
              <View key={`${pr.exerciseId}-${pr.type}-${idx}`} style={{ gap: theme.spacing.sm }}>
                {idx > 0 ? <Divider /> : null}
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="small" weight="600">
                      {pr.exerciseName}
                    </Txt>
                    {pr.weightKg > 0 ? (
                      <Txt variant="caption" color={theme.colors.textMuted}>
                        {formatNumber(pr.weightKg, 1)} {t.units.kg} × {pr.reps}
                      </Txt>
                    ) : null}
                  </View>
                  <Badge label={t.prType[pr.type]} tone="warning" />
                </Row>
              </View>
            ))
          )}
        </Card>
      </Section>

      <Button title={t.common.done} onPress={() => router.replace('/(tabs)/workout')} />
    </Screen>
  );
}
