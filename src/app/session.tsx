import { useLocalSearchParams, router, useCanGoBack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  addExerciseToSession,
  addSet,
  deleteSet,
  finishSession,
  getActiveSession,
  getSessionDetail,
  listExercises,
  removeSessionExercise,
  type SessionExerciseDetail,
} from '../db/repos/workout';
import type { ExerciseRow } from '../db/schema';
import type { PrType } from '../domain/types';
import { formatDate, formatDuration, formatNumber, formatRest, t } from '../i18n';
import { useUi } from '../state/ui';
import {
  AppModal,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  Divider,
  EmptyState,
  Field,
  Header,
  IconButton,
  LoadingView,
  Row,
  Screen,
  Txt,
  useConfirm,
} from '../ui/components';
import { useTheme } from '../ui/theme';
import { useQuery } from '../ui/useQuery';
import { setSchema } from '../validation';

function ExerciseCard({
  item,
  onStartRest,
  onPr,
}: {
  item: SessionExerciseDetail;
  onStartRest: (seconds: number) => void;
  onPr: (exerciseName: string, prs: PrType[]) => void;
}) {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);

  const lastSet = item.sets[item.sets.length - 1];
  const prevWorking = item.lastSets[item.sets.length] ?? item.lastSets[item.lastSets.length - 1];
  const defaultWeight =
    lastSet?.weightKg ?? item.suggestion?.weightKg ?? prevWorking?.weightKg ?? 20;
  const defaultReps =
    lastSet?.reps ?? item.suggestion?.targetReps ?? prevWorking?.reps ?? item.row.repMin;

  const [weight, setWeight] = useState(String(defaultWeight));
  const [reps, setReps] = useState(String(defaultReps));
  const [rpe, setRpe] = useState('');
  const [isWarmup, setIsWarmup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySuggestion = () => {
    if (!item.suggestion) return;
    setWeight(String(item.suggestion.weightKg));
    setReps(String(item.suggestion.targetReps));
  };

  const logSet = () => {
    setError(null);
    const parsed = setSchema.safeParse({
      weightKg: weight.replace(',', '.'),
      reps: reps.replace(',', '.'),
      rpe: rpe.trim() === '' ? '' : rpe.replace(',', '.'),
    });
    if (!parsed.success) {
      setError(t.workout.finishSetError);
      return;
    }
    const res = addSet(item.row.id, {
      weightKg: parsed.data.weightKg,
      reps: parsed.data.reps,
      rpe: parsed.data.rpe === '' ? null : parsed.data.rpe,
      isWarmup,
    });
    if (!res) return;
    if (res.prs.length > 0) {
      onPr(item.exercise.name, res.prs);
    }
    onStartRest(item.row.restSeconds);
    bump();
  };

  const workingCount = item.sets.filter((s) => s.isWarmup === 0).length;

  return (
    <Card>
      <Row>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="h3">{item.exercise.name}</Txt>
          <Txt variant="caption" color={theme.colors.textMuted}>
            {workingCount}/{item.row.targetSets} {t.workout.setsShort} · {item.row.repMin}-
            {item.row.repMax} {t.workout.repsShort}
          </Txt>
        </View>
        <IconButton
          name="stats-chart-outline"
          label={t.workout.exerciseDetail}
          size={20}
          onPress={() => router.push({ pathname: '/exercise', params: { id: item.exercise.id } })}
        />
        <IconButton
          name="trash-outline"
          label={`${t.common.delete} ${item.exercise.name}`}
          size={20}
          onPress={() => {
            removeSessionExercise(item.row.id);
            bump();
          }}
        />
      </Row>

      {item.lastSets.length > 0 ? (
        <Txt variant="caption" color={theme.colors.textMuted}>
          {t.workout.lastSession}:{' '}
          {item.lastSets
            .map((s) => `${formatNumber(s.weightKg, 1)} kg × ${s.reps}`)
            .join(', ')}
        </Txt>
      ) : (
        <Txt variant="caption" color={theme.colors.textMuted}>
          {t.workout.firstTime}
        </Txt>
      )}

      {item.suggestion ? (
        <Banner
          tone="info"
          title={`${t.workout.suggestion}: ${formatNumber(item.suggestion.weightKg, 1)} kg × ${item.suggestion.targetReps}`}
          action={
            <Button
              title={t.workout.acceptSuggestion}
              small
              fullWidth={false}
              variant="secondary"
              onPress={applySuggestion}
            />
          }
        >
          {t.progressionReasons[item.suggestion.reason]}
        </Banner>
      ) : null}

      {item.sets.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          {item.sets.map((s, idx) => (
            <View key={s.id} style={{ gap: theme.spacing.xs }}>
              {idx > 0 ? <Divider /> : null}
              <Row>
                <Txt variant="small" weight="600" style={{ width: 52 }}>
                  {s.isWarmup === 1 ? 'W' : `#${s.setIndex}`}
                </Txt>
                <Txt variant="small" style={{ flex: 1 }}>
                  {formatNumber(s.weightKg, 1)} {t.units.kg} × {s.reps}
                  {s.rpe !== null ? ` · RPE ${formatNumber(s.rpe, 1)}` : ''}
                </Txt>
                {s.e1rmKg !== null ? (
                  <Txt variant="caption" color={theme.colors.textMuted}>
                    1RM {formatNumber(s.e1rmKg, 1)}
                  </Txt>
                ) : null}
                <IconButton
                  name="close-circle-outline"
                  label={t.workout.removeSet}
                  size={18}
                  onPress={() => {
                    deleteSet(s.id);
                    bump();
                  }}
                />
              </Row>
            </View>
          ))}
        </View>
      ) : null}

      <Divider />

      <Row gap={8}>
        <View style={{ flex: 1 }}>
          <Field
            label={t.workout.weight}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label={t.workout.reps}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ width: 76 }}>
          <Field
            label={t.workout.rpe}
            value={rpe}
            onChangeText={setRpe}
            placeholder="6-10"
            keyboardType="decimal-pad"
          />
        </View>
      </Row>

      {error ? (
        <Txt variant="caption" color={theme.colors.danger}>
          {error}
        </Txt>
      ) : null}

      <Row gap={8}>
        <Chip
          label={t.workout.warmup}
          selected={isWarmup}
          onPress={() => setIsWarmup((v) => !v)}
        />
        <View style={{ flex: 1 }}>
          <Button title={t.workout.completeSet} icon="checkmark" small onPress={logSet} />
        </View>
      </Row>
    </Card>
  );
}

export default function ActiveSessionScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);
  const confirm = useConfirm();
  const params = useLocalSearchParams<{ id?: string }>();
  const paramId = typeof params.id === 'string' ? params.id : '';
  const canGo = useCanGoBack();

  const [restLeft, setRestLeft] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [prBanner, setPrBanner] = useState<string | null>(null);

  const detail = useQuery(() => {
    const id = paramId || getActiveSession()?.id || '';
    return id ? getSessionDetail(id) : null;
  }, [paramId]);

  const exercises = useQuery(
    () => (pickerOpen ? listExercises(query, 30) : []),
    [pickerOpen, query],
  );

  const goBack = () => {
    if (canGo) router.back();
    else router.replace('/(tabs)/workout');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
      setRestLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (detail.loading && !detail.data) return <LoadingView />;
  if (detail.error || !detail.data) {
    return (
      <Screen>
        <Header title={t.workout.activeSession} onBack={goBack} />
        <Banner tone="danger" title={t.errors.notFound}>
          {detail.error ?? t.errors.notFound}
        </Banner>
      </Screen>
    );
  }

  const { session, exercises: sessionExercises } = detail.data;
  const elapsedSec = Math.max(
    0,
    Math.round((nowMs - new Date(session.startedAt).getTime()) / 1000),
  );

  const onFinish = () =>
    confirm.show({
      title: t.workout.finishConfirm,
      confirmLabel: t.workout.finishSession,
      onConfirm: () => {
        finishSession(session.id);
        bump();
        router.replace({ pathname: '/session-summary', params: { id: session.id } });
      },
    });

  return (
    <Screen>
      <Header
        title={session.programDayName ?? t.workout.activeSession}
        subtitle={`${formatDate(session.date)} · ${formatDuration(elapsedSec)}`}
        onBack={goBack}
        right={
          <Button
            title={t.workout.finishSessionShort}
            small
            fullWidth={false}
            onPress={onFinish}
          />
        }
      />

      {restLeft > 0 ? (
        <Card>
          <Row>
            <View style={{ flex: 1 }}>
              <Txt variant="caption" color={theme.colors.textMuted}>
                {t.workout.restTimer}
              </Txt>
              <Txt variant="h2" color={theme.colors.primary}>
                {formatRest(restLeft)}
              </Txt>
            </View>
            <Button
              title={t.workout.resetTimer}
              small
              fullWidth={false}
              variant="secondary"
              onPress={() => setRestLeft(0)}
            />
          </Row>
        </Card>
      ) : null}

      {prBanner ? (
        <Banner tone="success" title={t.workout.prBadge}>
          {prBanner}
        </Banner>
      ) : null}

      {sessionExercises.length === 0 ? (
        <EmptyState
          icon="barbell-outline"
          title={t.common.noData}
          body={t.workout.addExerciseHint}
        />
      ) : (
        sessionExercises.map((item) => (
          <ExerciseCard
            key={item.row.id}
            item={item}
            onStartRest={(sec) => setRestLeft(sec)}
            onPr={(name, prs) =>
              setPrBanner(`${name}: ${prs.map((p) => t.prType[p]).join(', ')}`)
            }
          />
        ))
      )}

      <Button
        title={t.workout.addExercise}
        icon="add"
        variant="secondary"
        onPress={() => {
          setQuery('');
          setPickerOpen(true);
        }}
      />

      <Button title={t.workout.finishSession} icon="checkmark-done" onPress={onFinish} />

      <AppModal
        visible={pickerOpen}
        title={t.workout.addExercise}
        onClose={() => setPickerOpen(false)}
      >
        <Field
          label={t.common.search}
          value={query}
          onChangeText={setQuery}
          placeholder={t.food.searchPlaceholder}
          autoFocus
        />
        {(exercises.data ?? []).map((row: ExerciseRow) => (
          <Card
            key={row.id}
            onPress={() => {
              addExerciseToSession(session.id, row.id);
              setPickerOpen(false);
              bump();
            }}
          >
            <Row>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="small" weight="600" numberOfLines={1}>
                  {row.name}
                </Txt>
                <Txt variant="caption" color={theme.colors.textMuted}>
                  {row.muscleGroup} · {row.equipment}
                </Txt>
              </View>
              <Badge label={`${row.defaultRepMin}-${row.defaultRepMax}`} />
            </Row>
          </Card>
        ))}
      </AppModal>

      {confirm.element}
    </Screen>
  );
}
