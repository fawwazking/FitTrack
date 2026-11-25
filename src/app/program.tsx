import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  addProgramDay,
  addProgramDayExercise,
  getProgramDetail,
  listExercises,
  removeProgramDayExercise,
  renameProgram,
  updateProgramDay,
  updateProgramDayExercise,
  type ProgramExerciseItem,
} from '../db/repos/workout';
import type { ExerciseRow } from '../db/schema';
import { t } from '../i18n';
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
  Section,
  Txt,
} from '../ui/components';
import { useTheme } from '../ui/theme';
import { useQuery } from '../ui/useQuery';

function toInt(value: string, fallback: number): number {
  const parsed = Math.round(Number(value.replace(',', '.')));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function DayNameInput({ dayId, name }: { dayId: string; name: string }) {
  const [draft, setDraft] = useState(name);
  return (
    <Field
      label={t.workout.dayName}
      value={draft}
      onChangeText={(value) => {
        setDraft(value);
        if (value.trim()) updateProgramDay(dayId, { name: value.trim() });
      }}
    />
  );
}

function ExerciseRowEditor({ item }: { item: ProgramExerciseItem }) {
  const theme = useTheme();
  const [sets, setSets] = useState(String(item.row.targetSets));
  const [repMin, setRepMin] = useState(String(item.row.repMin));
  const [repMax, setRepMax] = useState(String(item.row.repMax));
  const [rest, setRest] = useState(String(item.row.restSeconds));

  const save = (patch: { targetSets?: number; repMin?: number; repMax?: number; restSeconds?: number }) =>
    updateProgramDayExercise(item.row.id, patch);

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Row>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="small" weight="600" numberOfLines={1}>
            {item.exercise.name}
          </Txt>
          <Txt variant="caption" color={theme.colors.textMuted}>
            {item.exercise.muscleGroup} · {item.exercise.equipment}
          </Txt>
        </View>
        <IconButton
          name="trash-outline"
          label={`${t.common.delete} ${item.exercise.name}`}
          size={20}
          onPress={() => removeProgramDayExercise(item.row.id)}
        />
      </Row>
      <Row gap={8}>
        <View style={{ flex: 1 }}>
          <Field
            label={t.workout.targetSets}
            value={sets}
            onChangeText={(value) => {
              setSets(value);
              save({ targetSets: toInt(value, item.row.targetSets) });
            }}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label={t.workout.repMinLabel}
            value={repMin}
            onChangeText={(value) => {
              setRepMin(value);
              save({ repMin: toInt(value, item.row.repMin) });
            }}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label={t.workout.repMaxLabel}
            value={repMax}
            onChangeText={(value) => {
              setRepMax(value);
              save({ repMax: toInt(value, item.row.repMax) });
            }}
            keyboardType="number-pad"
          />
        </View>
      </Row>
      <Field
        label={t.workout.restSeconds}
        value={rest}
        onChangeText={(value) => {
          setRest(value);
          save({ restSeconds: toInt(value, item.row.restSeconds) });
        }}
        keyboardType="number-pad"
        suffix={t.common.secondsShort}
      />
    </View>
  );
}

export default function ProgramEditorScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);
  const params = useLocalSearchParams<{ id?: string }>();
  const programId = typeof params.id === 'string' ? params.id : '';

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [pickerDay, setPickerDay] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const detail = useQuery(() => getProgramDetail(programId), [programId]);
  const results = useQuery(() => (pickerDay ? listExercises(query, 30) : []), [query, pickerDay]);

  if (detail.loading && !detail.data) return <LoadingView />;
  if (detail.error || !detail.data) {
    return (
      <Screen>
        <Banner tone="danger" title={t.errors.notFound}>
          {detail.error ?? t.errors.notFound}
        </Banner>
      </Screen>
    );
  }

  const { program, days } = detail.data;
  const name = nameDraft ?? program.name;

  return (
    <Screen>
      <Header
        title={t.workout.editProgram}
        subtitle={program.template}
        onBack={() => router.back()}
        right={
          <IconButton
            name="checkmark"
            label={t.common.save}
            onPress={() => {
              if (name.trim()) renameProgram(program.id, name);
              setNameDraft(null);
              bump();
              router.back();
            }}
          />
        }
      />

      <Field label={t.workout.programName} value={name} onChangeText={setNameDraft} />

      {days.map((day, dayIndex) => (
        <Card key={day.row.id}>
          <Row>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="h3">
                {t.workout.days} {dayIndex + 1}
              </Txt>
              <Txt variant="caption" color={theme.colors.textMuted}>
                {day.exercises.length} {t.workout.exercises.toLowerCase()}
              </Txt>
            </View>
            <Badge label={day.row.weekday === null ? t.common.none : t.dayLong[day.row.weekday] ?? ''} />
          </Row>

          <DayNameInput dayId={day.row.id} name={day.row.name} />

          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            <Chip
              label={t.common.none}
              selected={day.row.weekday === null}
              onPress={() => {
                updateProgramDay(day.row.id, { weekday: null });
                bump();
              }}
            />
            {t.dayShort.map((label, index) => (
              <Chip
                key={label}
                label={label}
                selected={day.row.weekday === index}
                onPress={() => {
                  updateProgramDay(day.row.id, { weekday: index });
                  bump();
                }}
              />
            ))}
          </Row>

          <Section title={t.workout.exercises}>
            {day.exercises.length === 0 ? (
              <EmptyState icon="barbell-outline" title={t.common.noData} body={t.workout.addExerciseHint} />
            ) : (
              day.exercises.map((item, index) => (
                <View key={item.row.id} style={{ gap: theme.spacing.md }}>
                  {index > 0 ? <Divider /> : null}
                  <ExerciseRowEditor item={item} />
                </View>
              ))
            )}
          </Section>

          <Button
            title={t.workout.addExercise}
            icon="add"
            small
            variant="secondary"
            onPress={() => {
              setQuery('');
              setPickerDay(day.row.id);
            }}
          />
        </Card>
      ))}

      <Button
        title={t.workout.addDay}
        icon="add-circle-outline"
        variant="secondary"
        onPress={() => {
          addProgramDay(program.id, `${t.workout.days} ${days.length + 1}`);
          bump();
        }}
      />

      <AppModal
        visible={pickerDay !== null}
        title={t.workout.addExercise}
        onClose={() => setPickerDay(null)}
      >
        <Field
          label={t.common.search}
          value={query}
          onChangeText={setQuery}
          placeholder={t.food.searchPlaceholder}
          autoFocus
        />
        {(results.data ?? []).map((row: ExerciseRow) => (
          <Card
            key={row.id}
            onPress={() => {
              if (pickerDay) addProgramDayExercise(pickerDay, row.id);
              setPickerDay(null);
              bump();
            }}
            accessibilityLabel={row.name}
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
              <Txt variant="caption" color={theme.colors.textMuted}>
                {row.defaultRepMin}-{row.defaultRepMax}
              </Txt>
            </Row>
          </Card>
        ))}
      </AppModal>
    </Screen>
  );
}
