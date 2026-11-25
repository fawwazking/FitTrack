import Constants from 'expo-constants';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import {
  ACTIVITY_LEVELS,
  PACES,
  PROFILE_LIMITS,
  SEXES,
  type ActivityLevel,
  type Goal,
  type Pace,
  type Sex,
} from '../../config';
import {
  acceptRecalculation,
  ageFromBirthDate,
  computeTarget,
  getProfileBundle,
  getRecalculationSuggestion,
  getTargetHistory,
  rejectRecalculation,
  setManualTarget,
  updateGoalAndTarget,
  updateProfile,
} from '../../db/repos/profile';
import { getSettings, resetApplication, updateSettings } from '../../db/repos/settings';
import {
  bmi,
  isBulkingDiscouragedByBmi,
  isCuttingBlockedByBmi,
  isPaceAllowed,
} from '../../domain/nutrition';
import { formatDate, formatGrams, formatKcal, formatKg, formatNumber, t } from '../../i18n';
import { useUi, type ThemeMode } from '../../state/ui';
import {
  AppModal,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  Divider,
  Field,
  Header,
  LoadingView,
  Row,
  Screen,
  Section,
  SelectCard,
  Stat,
  Stepper,
  Txt,
} from '../../ui/components';
import { useTheme } from '../../ui/theme';
import { useQuery } from '../../ui/useQuery';
import { profileSchema } from '../../validation';

const GOAL_ORDER: readonly Goal[] = ['bulking', 'cutting', 'recomp'];
const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

interface ProfileFormState {
  sex: Sex;
  age: string;
  heightCm: string;
  weightKg: string;
  sessionsPerWeek: string;
  activityLevel: ActivityLevel;
}

function reasonLabel(reason: string): string {
  const map = t.profile.targetReason as unknown as Record<string, string>;
  return map[reason] ?? reason;
}

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const bump = useUi((state) => state.bump);
  const setThemeMode = useUi((state) => state.setThemeMode);

  const bundleQuery = useQuery(() => getProfileBundle(), []);
  const historyQuery = useQuery(() => getTargetHistory(8), []);
  const suggestionQuery = useQuery(() => getRecalculationSuggestion(), []);
  const settingsQuery = useQuery(() => getSettings(), []);

  const [notice, setNotice] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    sex: 'male',
    age: '25',
    heightCm: '170',
    weightKg: '70',
    sessionsPerWeek: '4',
    activityLevel: 'low',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const [goalOpen, setGoalOpen] = useState(false);
  const [goal, setGoal] = useState<Goal>('bulking');
  const [pace, setPace] = useState<Pace>('moderate');
  const [goalError, setGoalError] = useState<string | null>(null);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  if (bundleQuery.loading && !bundleQuery.data) return <LoadingView />;
  if (bundleQuery.error) {
    return (
      <Screen>
        <Header title={t.profile.title} />
        <Banner tone="danger" title={t.errors.db}>
          {bundleQuery.error}
        </Banner>
      </Screen>
    );
  }
  const bundle = bundleQuery.data;
  if (!bundle) return <Redirect href="/onboarding" />;

  const profile = bundle.profile;
  const activeGoal = bundle.goal;
  const target = bundle.target;
  const weightKg = bundle.latestWeightKg ?? activeGoal.referenceWeightKg;
  const age = ageFromBirthDate(profile.birthDate);
  const bodyBmi = bmi(weightKg, profile.heightCm);
  const settings = settingsQuery.data;
  const currentTheme: ThemeMode =
    settings?.theme === 'light' || settings?.theme === 'dark' ? settings.theme : 'system';

  const setField = (key: keyof ProfileFormState, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }) as ProfileFormState);
  };

  const openEdit = () => {
    setForm({
      sex: profile.sex as Sex,
      age: String(age),
      heightCm: String(profile.heightCm),
      weightKg: String(weightKg),
      sessionsPerWeek: String(profile.sessionsPerWeek),
      activityLevel: profile.activityLevel as ActivityLevel,
    });
    setFormError(null);
    setEditOpen(true);
  };

  const saveProfile = () => {
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setFormError(first ?? t.errors.generic);
      return;
    }
    updateProfile(parsed.data);
    bump();
    setEditOpen(false);
    setNotice(t.profile.saved);
  };

  const goalProfile = {
    sex: profile.sex as Sex,
    age,
    heightCm: profile.heightCm,
    sessionsPerWeek: profile.sessionsPerWeek,
    activityLevel: profile.activityLevel as ActivityLevel,
    weightKg,
  };
  const goalBmi = bmi(weightKg, profile.heightCm);
  const goalCuttingBlocked = isCuttingBlockedByBmi(goalBmi);
  const goalBulkingWarn = isBulkingDiscouragedByBmi(goalBmi);
  const paceRows = PACES.map((option) => {
    const computed = computeTarget(goalProfile, goal, option);
    const allowed = isPaceAllowed(goal, option, computed.result, weightKg);
    return { option, computed, allowed };
  });
  const selectedPaceAllowed =
    paceRows.find((row) => row.option === pace)?.allowed ?? false;

  const openGoal = () => {
    setGoal(activeGoal.goal as Goal);
    setPace(activeGoal.pace as Pace);
    setGoalError(null);
    setGoalOpen(true);
  };

  const selectGoal = (next: Goal) => {
    if (next === 'cutting' && goalCuttingBlocked) return;
    setGoal(next);
    const allowedFor = (option: Pace) =>
      isPaceAllowed(next, option, computeTarget(goalProfile, next, option).result, weightKg);
    if (allowedFor(pace)) return;
    const fallback = (['moderate', 'slow', 'aggressive'] as const).find(allowedFor);
    if (fallback) setPace(fallback);
  };

  const saveGoal = () => {
    if (!selectedPaceAllowed) {
      setGoalError(t.onboarding.paceBlocked);
      return;
    }
    updateGoalAndTarget(goal, pace);
    bump();
    setGoalOpen(false);
    setNotice(t.common.saved);
  };

  const openManual = () => {
    setManualValue(String(Math.round(target?.calories ?? 0)));
    setManualError(null);
    setManualOpen(true);
  };

  const saveManual = () => {
    const calories = Number(manualValue.replace(',', '.'));
    if (!Number.isFinite(calories) || calories <= 0) {
      setManualError(t.validation.positive);
      return;
    }
    setManualTarget(Math.round(calories));
    bump();
    setManualOpen(false);
    setNotice(t.common.saved);
  };

  const recalculate = () => {
    const parsed = profileSchema.safeParse({
      sex: profile.sex,
      age,
      heightCm: profile.heightCm,
      weightKg,
      sessionsPerWeek: profile.sessionsPerWeek,
      activityLevel: profile.activityLevel,
    });
    if (!parsed.success) {
      setNotice(t.errors.generic);
      return;
    }
    updateProfile(parsed.data);
    bump();
    setNotice(t.profile.saved);
  };

  const recalcSuggestion = suggestionQuery.data;
  const acceptRecalc = () => {
    acceptRecalculation();
    bump();
  };
  const rejectRecalc = () => {
    rejectRecalculation();
    bump();
  };

  const applyTheme = (mode: ThemeMode) => {
    updateSettings({ theme: mode });
    setThemeMode(mode);
    bump();
  };

  const resetApp = () => {
    Alert.alert(t.settings.resetApp, t.settings.resetConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          resetApplication();
          setThemeMode('system');
          bump();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const history = historyQuery.data ?? [];

  return (
    <Screen>
      <Header title={t.profile.title} subtitle={t.appName} />

      {notice ? (
        <Banner tone="success" title={t.common.saved}>
          {notice}
        </Banner>
      ) : null}

      <Section
        title={t.profile.personal}
        action={<Button title={t.profile.editProfile} onPress={openEdit} variant="ghost" small fullWidth={false} />}
      >
        <Card>
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.sex.male} / {t.sex.female}
            </Txt>
            <Badge label={t.sex[profile.sex as Sex]} />
          </Row>
          <Divider />
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.onboarding.age}
            </Txt>
            <Txt variant="small" weight="600">
              {age}
            </Txt>
          </Row>
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.onboarding.height}
            </Txt>
            <Txt variant="small" weight="600">
              {formatNumber(profile.heightCm, 0)} {t.units.cm}
            </Txt>
          </Row>
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.progress.latestWeight}
            </Txt>
            <Txt variant="small" weight="600">
              {formatKg(weightKg)}
            </Txt>
          </Row>
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.onboarding.sessions}
            </Txt>
            <Txt variant="small" weight="600">
              {profile.sessionsPerWeek}
            </Txt>
          </Row>
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.onboarding.activity}
            </Txt>
            <Txt variant="small" weight="600">
              {t.activity[profile.activityLevel as ActivityLevel]}
            </Txt>
          </Row>
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.progress.bmiLabel}
            </Txt>
            <Txt variant="small" weight="600">
              {formatNumber(bodyBmi, 1)}
            </Txt>
          </Row>
        </Card>
      </Section>

      <Section
        title={t.profile.targets}
        action={<Button title={t.profile.editTarget} onPress={openGoal} variant="ghost" small fullWidth={false} />}
      >
        <Card>
          <Row>
            <Row gap={6}>
              <Badge label={t.goal[activeGoal.goal as Goal]} />
              {activeGoal.manualOverride === 1 ? <Badge label={t.common.manual} tone="warning" /> : null}
            </Row>
            {target ? (
              <Txt variant="caption" color={theme.colors.textMuted}>
                {t.profile.activeSince} {formatDate(target.effectiveDate)}
              </Txt>
            ) : null}
          </Row>
          {target ? (
            <>
              <Txt variant="h1">{formatKcal(target.calories)}</Txt>
              <Row gap={12}>
                <Stat label={t.nutrition.protein} value={formatGrams(target.proteinG)} />
                <Stat label={t.nutrition.carbs} value={formatGrams(target.carbsG)} />
                <Stat label={t.nutrition.fat} value={formatGrams(target.fatG)} />
              </Row>
              <Divider />
              <Row gap={12}>
                <Stat label={t.nutrition.bmr} value={formatKcal(target.bmr)} />
                <Stat label={t.nutrition.tdee} value={formatKcal(target.tdee)} />
              </Row>
            </>
          ) : (
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.common.noData}
            </Txt>
          )}
          <Row gap={8}>
            <Button title={t.profile.recalculate} onPress={recalculate} variant="secondary" small />
            <Button title={t.profile.manualOverride} onPress={openManual} variant="secondary" small />
          </Row>
          <Txt variant="caption" color={theme.colors.textMuted}>
            {t.profile.manualHint}
          </Txt>
        </Card>
      </Section>

      {recalcSuggestion ? (
        <Card>
          <Txt variant="h3">{t.profile.targetUpdatePrompt}</Txt>
          <Txt variant="small" color={theme.colors.textMuted}>
            {t.profile.weightChanged}
          </Txt>
          <Row>
            <Stat label={t.profile.oldTarget} value={formatKcal(target?.calories ?? 0)} />
            <Stat
              label={t.profile.newTarget}
              value={formatKcal(recalcSuggestion.computed.result.calories)}
              color={theme.colors.primary}
            />
          </Row>
          <Row gap={8}>
            <Button title={t.profile.acceptTarget} onPress={acceptRecalc} small />
            <Button title={t.common.reject} onPress={rejectRecalc} variant="secondary" small />
          </Row>
        </Card>
      ) : null}

      <Section title={t.profile.targetHistory}>
        <Card>
          {history.length === 0 ? (
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.common.noData}
            </Txt>
          ) : (
            history.map((row, index) => (
              <View key={row.id} style={{ gap: theme.spacing.sm }}>
                {index > 0 ? <Divider /> : null}
                <Row>
                  <View style={{ flex: 1 }}>
                    <Txt variant="small" weight="600">
                      {formatKcal(row.calories)}
                    </Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {formatDate(row.effectiveDate)} · {reasonLabel(row.reason)}
                    </Txt>
                  </View>
                  {row.reason === 'manual' ? <Badge label={t.common.manual} tone="warning" /> : null}
                </Row>
              </View>
            ))
          )}
        </Card>
      </Section>

      <Section title={t.settings.theme}>
        <Row gap={8}>
          {THEME_MODES.map((mode) => (
            <Chip
              key={mode}
              label={
                mode === 'system'
                  ? t.settings.themeSystem
                  : mode === 'light'
                    ? t.settings.themeLight
                    : t.settings.themeDark
              }
              selected={currentTheme === mode}
              onPress={() => applyTheme(mode)}
            />
          ))}
        </Row>
      </Section>

      <Section title={t.profile.about}>
        <Card>
          <Txt variant="small" color={theme.colors.textMuted}>
            {t.settings.privacyBody}
          </Txt>
          <Divider />
          <Row>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.settings.version}
            </Txt>
            <Txt variant="small" weight="600">
              {Constants.expoConfig?.version ?? '1.0.0'}
            </Txt>
          </Row>
        </Card>
        <Banner tone="warning" title={t.profile.disclaimerTitle}>
          {t.disclaimer}
        </Banner>
      </Section>

      <Button title={t.settings.resetApp} onPress={resetApp} variant="danger" />

      <AppModal
        visible={editOpen}
        title={t.profile.editProfile}
        onClose={() => setEditOpen(false)}
        footer={
          <Button
            title={t.profile.saveProfile}
            onPress={saveProfile}
            disabled={!profileSchema.safeParse(form).success}
          />
        }
      >
        {formError ? <Banner tone="danger">{formError}</Banner> : null}
        <Row gap={8}>
          {SEXES.map((option) => (
            <Chip
              key={option}
              label={t.sex[option]}
              selected={form.sex === option}
              onPress={() => setField('sex', option)}
            />
          ))}
        </Row>
        <Stepper
          label={t.onboarding.age}
          value={form.age}
          onChange={(value) => setField('age', value)}
          integer
          min={PROFILE_LIMITS.ageMin}
          max={PROFILE_LIMITS.ageMax}
        />
        <Stepper
          label={t.onboarding.height}
          value={form.heightCm}
          onChange={(value) => setField('heightCm', value)}
          min={PROFILE_LIMITS.heightCmMin}
          max={PROFILE_LIMITS.heightCmMax}
        />
        <Stepper
          label={t.onboarding.weight}
          value={form.weightKg}
          onChange={(value) => setField('weightKg', value)}
          step={0.5}
          min={PROFILE_LIMITS.weightKgMin}
          max={PROFILE_LIMITS.weightKgMax}
        />
        <Stepper
          label={t.onboarding.sessions}
          value={form.sessionsPerWeek}
          onChange={(value) => setField('sessionsPerWeek', value)}
          integer
          min={PROFILE_LIMITS.sessionsPerWeekMin}
          max={PROFILE_LIMITS.sessionsPerWeekMax}
        />
        {ACTIVITY_LEVELS.map((level) => (
          <SelectCard
            key={level}
            title={t.activity[level]}
            subtitle={t.activityDesc[level]}
            selected={form.activityLevel === level}
            onPress={() => setField('activityLevel', level)}
          />
        ))}
      </AppModal>

      <AppModal
        visible={goalOpen}
        title={t.profile.editTarget}
        onClose={() => setGoalOpen(false)}
        footer={
          <Button title={t.common.save} onPress={saveGoal} disabled={!selectedPaceAllowed} />
        }
      >
        {goalError ? <Banner tone="danger">{goalError}</Banner> : null}
        {GOAL_ORDER.map((option) => (
          <SelectCard
            key={option}
            title={t.goal[option]}
            subtitle={t.goalDesc[option]}
            selected={goal === option}
            disabled={option === 'cutting' && goalCuttingBlocked}
            onPress={() => selectGoal(option)}
          />
        ))}
        {goalBulkingWarn && goal === 'bulking' ? (
          <Banner tone="warning">{t.onboarding.bulkingWarn}</Banner>
        ) : null}
        {goalCuttingBlocked ? <Banner tone="warning">{t.onboarding.cuttingBlocked}</Banner> : null}
        <Divider />
        {paceRows.map(({ option, computed, allowed }) => (
          <SelectCard
            key={option}
            title={t.pace[option]}
            subtitle={`${formatKcal(computed.result.calories)} · ${
              computed.result.weightChangeKgPerWeek >= 0 ? '+' : ''
            }${formatNumber(computed.result.weightChangeKgPerWeek, 2)} ${t.units.kg}${t.nutrition.perWeek}`}
            selected={pace === option}
            disabled={!allowed}
            onPress={() => setPace(option)}
          />
        ))}
      </AppModal>

      <AppModal
        visible={manualOpen}
        title={t.profile.manualOverride}
        onClose={() => setManualOpen(false)}
        footer={<Button title={t.common.save} onPress={saveManual} />}
      >
        {manualError ? <Banner tone="danger">{manualError}</Banner> : null}
        <Field
          label={`${t.nutrition.calories} (${t.units.kcal})`}
          value={manualValue}
          onChangeText={setManualValue}
          keyboardType="decimal-pad"
        />
        <Txt variant="caption" color={theme.colors.textMuted}>
          {t.profile.manualHint}
        </Txt>
      </AppModal>
    </Screen>
  );
}
