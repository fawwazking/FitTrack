import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { getDashboard } from '../../db/repos/dashboard';
import {
  acceptRecalculation,
  getRecalculationSuggestion,
  rejectRecalculation,
} from '../../db/repos/profile';
import { todayISO } from '../../domain/dates';
import {
  formatDate,
  formatKcal,
  formatKg,
  formatNumber,
  t,
} from '../../i18n';
import { useUi } from '../../state/ui';
import {
  Badge,
  Banner,
  Button,
  CalorieRing,
  Card,
  Divider,
  EmptyState,
  Header,
  LoadingView,
  MacroBar,
  Row,
  Screen,
  Section,
  Stat,
  Txt,
  colorForMacro,
} from '../../ui/components';
import { useTheme } from '../../ui/theme';
import { useQuery } from '../../ui/useQuery';

export default function DashboardScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);
  const dashboard = useQuery(() => getDashboard(), []);
  const suggestion = useQuery(() => getRecalculationSuggestion(), []);

  if (dashboard.loading && !dashboard.data) return <LoadingView />;
  if (dashboard.error) {
    return (
      <Screen>
        <Banner tone="danger" title={t.errors.db}>
          {dashboard.error}
        </Banner>
      </Screen>
    );
  }
  const data = dashboard.data;
  if (!data || !data.bundle) return <Redirect href="/onboarding" />;

  const { bundle, totals } = data;
  const target = bundle.target;
  const targetKcal = target?.calories ?? 0;

  const accept = () => {
    acceptRecalculation();
    bump();
  };
  const reject = () => {
    rejectRecalculation();
    bump();
  };
  const recalc = suggestion.data;

  return (
    <Screen>
      <Header title={t.appName} subtitle={formatDate(todayISO())} />

      {recalc ? (
        <Card>
          <Row>
            <Txt variant="h3">{t.profile.targetUpdatePrompt}</Txt>
            <Badge label={t.common.auto} />
          </Row>
          <Txt variant="small" color={theme.colors.textMuted}>
            {t.profile.targetUpdateBody}
          </Txt>
          <Row>
            <Stat label={t.profile.oldTarget} value={formatKcal(targetKcal)} />
            <Stat
              label={t.profile.newTarget}
              value={formatKcal(recalc.computed.result.calories)}
              color={theme.colors.primary}
            />
          </Row>
          <Row gap={8}>
            <Button title={t.profile.acceptTarget} onPress={accept} small />
            <Button title={t.common.reject} onPress={reject} variant="secondary" small />
          </Row>
        </Card>
      ) : null}

      {target ? (
        <Card style={{ alignItems: 'center', gap: theme.spacing.md }}>
          <Row style={{ alignSelf: 'stretch' }}>
            <Txt variant="caption" color={theme.colors.textMuted}>
              {t.profile.currentTarget}
            </Txt>
            <Row gap={6}>
              {bundle.goal.manualOverride === 1 ? <Badge label={t.common.manual} /> : null}
              <Badge label={t.goal[bundle.goal.goal as 'bulking' | 'cutting' | 'recomp']} />
            </Row>
          </Row>
          <CalorieRing consumed={totals.kcal} target={targetKcal} />
          <View style={{ alignSelf: 'stretch', gap: theme.spacing.md }}>
            <MacroBar
              label={t.nutrition.protein}
              consumed={totals.proteinG}
              target={target.proteinG}
              color={colorForMacro(theme, 'protein')}
            />
            <MacroBar
              label={t.nutrition.carbs}
              consumed={totals.carbsG}
              target={target.carbsG}
              color={colorForMacro(theme, 'carbs')}
            />
            <MacroBar
              label={t.nutrition.fat}
              consumed={totals.fatG}
              target={target.fatG}
              color={colorForMacro(theme, 'fat')}
            />
          </View>
          <Txt variant="caption" color={theme.colors.textMuted}>
            {t.food.targetNote}
          </Txt>
        </Card>
      ) : (
        <Banner tone="warning" title={t.common.noData}>
          {t.nutrition.estimateNote}
        </Banner>
      )}

      <Section title={t.workout.todaySession}>
        <Card>
          {data.todayProgram ? (
            <>
              <Row>
                <Txt variant="h3">{data.todayProgram.dayName}</Txt>
                <Badge label={data.todayProgram.programName} />
              </Row>
              <Txt variant="small" color={theme.colors.textMuted}>
                {data.todayProgram.exerciseCount} {t.workout.exercises.toLowerCase()}
              </Txt>
            </>
          ) : (
            <>
              <Txt variant="h3">{t.workout.restDay}</Txt>
              <Txt variant="small" color={theme.colors.textMuted}>
                {t.workout.restDayBody}
              </Txt>
            </>
          )}
          {data.activeSessionId ? (
            <Banner tone="success" title={t.workout.resumeSession}>
              {t.workout.resumeBody}
            </Banner>
          ) : null}
        </Card>
      </Section>

      <Section title={t.progress.latestWeight}>
        <Card>
          {data.latestWeight ? (
            <Stat
              label={formatDate(data.latestWeight.date)}
              value={formatKg(data.latestWeight.weightKg)}
            />
          ) : (
            <EmptyState icon="scale-outline" title={t.progress.noWeightData} />
          )}
        </Card>
      </Section>

      <Section title={t.progress.prRecent}>
        <Card>
          {data.recentPrs.length === 0 ? (
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.progress.noPr}
            </Txt>
          ) : (
            data.recentPrs.slice(0, 3).map((pr, index) => (
              <View key={`${pr.sessionId}-${pr.exerciseId}-${pr.type}`} style={{ gap: theme.spacing.sm }}>
                {index > 0 ? <Divider /> : null}
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="small" weight="600">
                      {pr.exerciseName}
                    </Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {formatDate(pr.date)}
                    </Txt>
                  </View>
                  <Badge label={t.prType[pr.type]} tone="warning" />
                  <Txt variant="small">
                    {formatNumber(pr.weightKg, 1)} {t.units.kg} × {pr.reps}
                  </Txt>
                </Row>
              </View>
            ))
          )}
        </Card>
      </Section>

      <Card>
        <Txt variant="h3">{t.common.why}</Txt>
        <Txt variant="small" color={theme.colors.textMuted}>
          {t.nutrition.whyCalories}
        </Txt>
        <Txt variant="small" color={theme.colors.textMuted}>
          {t.nutrition.whyTdee}
        </Txt>
      </Card>

      <Txt variant="caption" color={theme.colors.textMuted} center>
        {t.disclaimerShort}
      </Txt>
    </Screen>
  );
}
