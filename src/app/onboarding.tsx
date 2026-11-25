import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  ACTIVITY_LEVELS,
  PACES,
  PROFILE_LIMITS,
  SEXES,
  type ActivityLevel,
  type Goal,
  type Pace,
  type Sex,
} from '../config';
import { nowISO } from '../db/db';
import { computeTarget, saveOnboarding } from '../db/repos/profile';
import {
  bmi,
  isBulkingDiscouragedByBmi,
  isCuttingBlockedByBmi,
  isPaceAllowed,
} from '../domain/nutrition';
import { formatGrams, formatKcal, formatNumber, t } from '../i18n';
import { useUi } from '../state/ui';
import {
  Banner,
  Button,
  Card,
  Chip,
  Divider,
  Header,
  Row,
  Screen,
  SelectCard,
  Stat,
  Stepper,
  Txt,
} from '../ui/components';
import { useTheme } from '../ui/theme';
import { profileSchema } from '../validation';

const GOAL_ORDER: readonly Goal[] = ['bulking', 'cutting', 'recomp'];

function signedKgPerWeek(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatNumber(value, 2)} ${t.units.kg}${t.nutrition.perWeek}`;
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const bump = useUi((state) => state.bump);

  const [step, setStep] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('25');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('4');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('low');
  const [goal, setGoal] = useState<Goal>('bulking');
  const [pace, setPace] = useState<Pace>('moderate');

  const parsedProfile = profileSchema.safeParse({
    sex,
    age,
    heightCm,
    weightKg,
    sessionsPerWeek,
    activityLevel,
  });
  const profileValues = parsedProfile.success ? parsedProfile.data : null;
  const fieldErrors: Record<string, string[] | undefined> = parsedProfile.success
    ? {}
    : (parsedProfile.error.flatten().fieldErrors as Record<string, string[] | undefined>);
  const fieldError = (key: string) => fieldErrors[key]?.[0];

  const bodyBmi = profileValues ? bmi(profileValues.weightKg, profileValues.heightCm) : null;
  const cuttingBlocked = bodyBmi !== null && isCuttingBlockedByBmi(bodyBmi);
  const bulkingWarn = bodyBmi !== null && isBulkingDiscouragedByBmi(bodyBmi);
  const preview = profileValues ? computeTarget(profileValues, goal, pace) : null;
  const paceAllowed =
    preview !== null && profileValues !== null
      ? isPaceAllowed(goal, pace, preview.result, profileValues.weightKg)
      : false;

  const paceRows = PACES.map((option) => {
    const computed = profileValues ? computeTarget(profileValues, goal, option) : null;
    const allowed =
      computed !== null && profileValues !== null
        ? isPaceAllowed(goal, option, computed.result, profileValues.weightKg)
        : false;
    return { option, computed, allowed };
  });

  const selectGoal = (nextGoal: Goal) => {
    if (nextGoal === 'cutting' && cuttingBlocked) return;
    setGoal(nextGoal);
    if (!profileValues) return;
    const allowedFor = (option: Pace) =>
      isPaceAllowed(
        nextGoal,
        option,
        computeTarget(profileValues, nextGoal, option).result,
        profileValues.weightKg,
      );
    if (allowedFor(pace)) return;
    const fallback = (['moderate', 'slow', 'aggressive'] as const).find(allowedFor);
    if (fallback) setPace(fallback);
  };

  const save = () => {
    if (!profileValues || !preview) return;
    if (!paceAllowed) {
      setNotice(t.onboarding.paceBlocked);
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      saveOnboarding({
        ...profileValues,
        goal,
        pace,
        disclaimerAcceptedAt: nowISO(),
      });
      bump();
      router.replace('/');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t.errors.generic);
      setSaving(false);
    }
  };

  const stepTitle =
    step === 0
      ? t.onboarding.welcomeTitle
      : step === 1
        ? t.onboarding.profileTitle
        : step === 2
          ? t.onboarding.goalTitle
          : t.onboarding.summaryTitle;
  const stepSubtitle =
    step === 0 ? undefined : `${t.onboarding.step} ${step} ${t.onboarding.ofStep} 3`;

  const reasons = preview
    ? [...new Set([...preview.result.reasons, ...preview.macros.reasons])]
    : [];

  return (
    <Screen>
      <Header
        title={stepTitle}
        subtitle={stepSubtitle}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
      />
      {notice ? (
        <Banner tone="danger" title={t.common.error}>
          {notice}
        </Banner>
      ) : null}

      {step === 0 ? (
        <>
          <Card>
            <Txt variant="h1">{t.appName}</Txt>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.tagline}
            </Txt>
            <Txt variant="body">{t.onboarding.welcomeBody}</Txt>
          </Card>
          <Banner tone="warning" title={t.onboarding.disclaimerTitle}>
            {t.disclaimer}
          </Banner>
          <Button title={t.onboarding.agree} onPress={() => setStep(1)} />
        </>
      ) : null}

      {step === 1 ? (
        <>
          <Txt variant="small" color={theme.colors.textMuted}>
            {t.onboarding.profileBody}
          </Txt>
          <View style={{ gap: 6 }}>
            <Txt variant="caption" weight="600">
              {t.sex.male} / {t.sex.female}
            </Txt>
            <Row gap={8}>
              {SEXES.map((option) => (
                <Chip
                  key={option}
                  label={t.sex[option]}
                  selected={sex === option}
                  onPress={() => setSex(option)}
                />
              ))}
            </Row>
          </View>
          <Stepper
            label={t.onboarding.age}
            value={age}
            onChange={setAge}
            integer
            min={PROFILE_LIMITS.ageMin}
            max={PROFILE_LIMITS.ageMax}
            error={fieldError('age')}
          />
          <Stepper
            label={t.onboarding.height}
            value={heightCm}
            onChange={setHeightCm}
            min={PROFILE_LIMITS.heightCmMin}
            max={PROFILE_LIMITS.heightCmMax}
            error={fieldError('heightCm')}
          />
          <Stepper
            label={t.onboarding.weight}
            value={weightKg}
            onChange={setWeightKg}
            step={0.5}
            min={PROFILE_LIMITS.weightKgMin}
            max={PROFILE_LIMITS.weightKgMax}
            error={fieldError('weightKg')}
          />
          <Stepper
            label={t.onboarding.sessions}
            value={sessionsPerWeek}
            onChange={setSessionsPerWeek}
            integer
            min={PROFILE_LIMITS.sessionsPerWeekMin}
            max={PROFILE_LIMITS.sessionsPerWeekMax}
            error={fieldError('sessionsPerWeek')}
          />
          <View style={{ gap: 10 }}>
            <Txt variant="caption" weight="600">
              {t.onboarding.activity}
            </Txt>
            {ACTIVITY_LEVELS.map((level) => (
              <SelectCard
                key={level}
                title={t.activity[level]}
                subtitle={t.activityDesc[level]}
                selected={activityLevel === level}
                onPress={() => setActivityLevel(level)}
              />
            ))}
          </View>
          <Button
            title={t.common.next}
            disabled={!parsedProfile.success}
            onPress={() => setStep(2)}
          />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <Txt variant="small" color={theme.colors.textMuted}>
            {t.onboarding.goalBody}
          </Txt>
          {GOAL_ORDER.map((option) => (
            <SelectCard
              key={option}
              title={t.goal[option]}
              subtitle={t.goalDesc[option]}
              selected={goal === option}
              disabled={option === 'cutting' && cuttingBlocked}
              onPress={() => selectGoal(option)}
            />
          ))}
          {cuttingBlocked ? <Banner tone="warning">{t.onboarding.cuttingBlocked}</Banner> : null}
          {bulkingWarn && goal === 'bulking' ? (
            <Banner tone="warning">{t.onboarding.bulkingWarn}</Banner>
          ) : null}

          <Divider />
          <Txt variant="h3">{t.onboarding.paceTitle}</Txt>
          <Txt variant="small" color={theme.colors.textMuted}>
            {t.onboarding.paceBody}
          </Txt>
          {paceRows.map(({ option, computed, allowed }) => (
            <SelectCard
              key={option}
              title={t.pace[option]}
              subtitle={
                computed
                  ? `${formatKcal(computed.result.calories)} · ${signedKgPerWeek(
                      computed.result.weightChangeKgPerWeek,
                    )}`
                  : undefined
              }
              disabled={!allowed}
              selected={pace === option}
              onPress={() => setPace(option)}
            />
          ))}
          {!paceAllowed ? (
            <Banner tone="warning">{t.onboarding.paceBlocked}</Banner>
          ) : (
            <Txt variant="caption" color={theme.colors.textMuted}>
              {t.onboarding.safeNote}
            </Txt>
          )}
          <Button title={t.common.next} disabled={!paceAllowed} onPress={() => setStep(3)} />
        </>
      ) : null}

      {step === 3 && preview && profileValues ? (
        <>
          <Txt variant="small" color={theme.colors.textMuted}>
            {t.onboarding.summaryBody}
          </Txt>
          <Card>
            <Txt variant="caption" color={theme.colors.textMuted}>
              {t.nutrition.calories}
            </Txt>
            <Txt variant="h1">{formatKcal(preview.result.calories)}</Txt>
            <Row gap={16}>
              <Stat label={t.nutrition.bmr} value={formatKcal(preview.result.bmr)} />
              <Stat label={t.nutrition.tdee} value={formatKcal(preview.result.tdee)} />
              <Stat label={t.nutrition.pal} value={formatNumber(preview.result.pal, 2)} />
            </Row>
            <Divider />
            <Row gap={12}>
              <Stat label={t.nutrition.protein} value={formatGrams(preview.macros.proteinG)} />
              <Stat label={t.nutrition.carbs} value={formatGrams(preview.macros.carbsG)} />
              <Stat label={t.nutrition.fat} value={formatGrams(preview.macros.fatG)} />
            </Row>
            <Divider />
            <Row>
              <Stat
                label={t.nutrition.weightChange}
                value={signedKgPerWeek(preview.result.weightChangeKgPerWeek)}
              />
              <Stat
                label={t.nutrition.adjustment}
                value={`${preview.result.adjustmentPct >= 0 ? '+' : ''}${formatNumber(
                  preview.result.adjustmentPct * 100,
                  0,
                )}%`}
              />
            </Row>
          </Card>
          {reasons.length > 0 ? (
            <Card>
              {reasons.map((reason) => (
                <Txt key={reason} variant="small" color={theme.colors.textMuted}>
                  • {t.nutritionReasons[reason]}
                </Txt>
              ))}
            </Card>
          ) : null}
          <Txt variant="caption" color={theme.colors.textMuted}>
            {t.nutrition.estimateNote} {t.nutrition.weightChangeFormula}
          </Txt>
          <Banner tone="warning" title={t.onboarding.summaryTitle}>
            {t.disclaimer}
          </Banner>
          <Button title={t.onboarding.finish} loading={saving} onPress={save} />
        </>
      ) : null}
    </Screen>
  );
}
