import { useState } from 'react';
import { Alert, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { getProfileBundle } from '../../db/repos/profile';
import {
  deleteWeight,
  getLatestWeight,
  getWeightAverage,
  getWeightToday,
  listWeights,
  upsertWeight,
} from '../../db/repos/weight';
import { getPrEvents } from '../../db/repos/workout';
import type { WeightLogRow } from '../../db/schema';
import { addDaysISO, todayISO } from '../../domain/dates';
import { bmi } from '../../domain/nutrition';
import { formatDate, formatKg, formatNumber, t } from '../../i18n';
import { useUi } from '../../state/ui';
import {
  AppModal,
  Badge,
  Banner,
  Button,
  Card,
  Divider,
  EmptyState,
  Field,
  Header,
  IconButton,
  LoadingView,
  Row,
  Screen,
  Section,
  Stat,
  Txt,
} from '../../ui/components';
import { useTheme } from '../../ui/theme';
import { useQuery } from '../../ui/useQuery';
import { weightSchema } from '../../validation';

function WeightChart({ rows }: { rows: WeightLogRow[] }) {
  const theme = useTheme();
  const ordered = [...rows].slice(0, 30).reverse();
  if (ordered.length < 2) return null;

  const w = 300;
  const h = 130;
  const pad = 12;
  const weights = ordered.map((r) => r.weightKg);

  const avg = ordered.map((_, idx) => {
    const start = Math.max(0, idx - 6);
    const slice = weights.slice(start, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const span = Math.max(1, max - min);
  const toX = (i: number) => pad + (i / (ordered.length - 1)) * (w - pad * 2);
  const toY = (val: number) => pad + (1 - (val - min) / span) * (h - pad * 2);

  const avgPoints = avg.map((val, i) => `${toX(i)},${toY(val)}`).join(' ');
  const rawPoints = weights.map((val, i) => `${toX(i)},${toY(val)}`).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        <Polyline
          points={rawPoints}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={1.5}
        />
        <Polyline
          points={avgPoints}
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth={2.5}
        />
        {weights.map((val, i) => (
          <Circle
            key={ordered[i]?.id ?? i}
            cx={toX(i)}
            cy={toY(val)}
            r={3}
            fill={theme.colors.primary}
          />
        ))}
      </Svg>
      <Txt variant="caption" color={theme.colors.textMuted}>
        {t.progress.trendNote}
      </Txt>
    </View>
  );
}

export default function ProgressScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);
  const today = todayISO();

  const [modalOpen, setModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const data = useQuery(
    () => ({
      latest: getLatestWeight(),
      avg7: getWeightAverage(today, 7),
      rows: listWeights(60),
      bundle: getProfileBundle(today),
      prs: getPrEvents({ sinceDate: addDaysISO(today, -30) })
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
        .slice(0, 10),
    }),
    [today],
  );

  if (data.loading && !data.data) return <LoadingView />;
  if (data.error || !data.data) {
    return (
      <Screen>
        <Banner tone="danger" title={t.errors.db}>
          {data.error ?? t.errors.db}
        </Banner>
      </Screen>
    );
  }

  const { latest, avg7, rows, bundle, prs } = data.data;
  const currentBmi =
    latest && bundle?.profile ? bmi(latest.weightKg, bundle.profile.heightCm) : null;

  const openLog = () => {
    const existing = getWeightToday();
    setWeightInput(String(existing?.weightKg ?? latest?.weightKg ?? ''));
    setNoteInput(existing?.note ?? '');
    setError(null);
    setModalOpen(true);
  };

  const saveWeight = () => {
    setError(null);
    const parsed = weightSchema.safeParse({
      weightKg: weightInput.replace(',', '.'),
      note: noteInput.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t.validation.weight);
      return;
    }
    const commit = () => {
      upsertWeight(today, parsed.data.weightKg, parsed.data.note ?? null);
      setModalOpen(false);
      bump();
    };
    if (getWeightToday()) {
      Alert.alert(t.progress.overwriteConfirm, undefined, [
        { text: t.common.cancel, style: 'cancel' },
        { text: t.common.save, onPress: commit },
      ]);
      return;
    }
    commit();
  };

  return (
    <Screen>
      <Header
        title={t.progress.title}
        subtitle={formatDate(today)}
        right={
          <Button title={t.progress.logWeight} small fullWidth={false} onPress={openLog} />
        }
      />

      <Card>
        <Row>
          <Stat
            label={t.progress.latestWeight}
            value={latest ? formatKg(latest.weightKg) : '–'}
            sub={latest ? formatDate(latest.date) : undefined}
          />
          <Stat
            label={t.progress.sevenDayAvg}
            value={avg7 !== null ? formatKg(avg7) : '–'}
            color={theme.colors.primary}
          />
          <Stat
            label={t.progress.bmiLabel}
            value={currentBmi !== null ? formatNumber(currentBmi, 1) : '–'}
          />
        </Row>
        <WeightChart rows={rows} />
      </Card>

      <Section title={t.progress.weightTitle}>
        {rows.length === 0 ? (
          <EmptyState
            icon="scale-outline"
            title={t.progress.noWeightData}
            action={
              <Button title={t.progress.logWeight} small fullWidth={false} onPress={openLog} />
            }
          />
        ) : (
          <Card>
            {rows.slice(0, 15).map((row, idx) => (
              <View key={row.id} style={{ gap: theme.spacing.sm }}>
                {idx > 0 ? <Divider /> : null}
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="small" weight="600">
                      {formatKg(row.weightKg)}
                    </Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {formatDate(row.date)}
                      {row.note ? ` · ${row.note}` : ''}
                    </Txt>
                  </View>
                  <IconButton
                    name="trash-outline"
                    label={t.common.delete}
                    size={18}
                    onPress={() => {
                      deleteWeight(row.id);
                      bump();
                    }}
                  />
                </Row>
              </View>
            ))}
          </Card>
        )}
      </Section>

      <Section title={t.progress.prRecent}>
        <Card>
          {prs.length === 0 ? (
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.progress.noPr}
            </Txt>
          ) : (
            prs.map((pr, idx) => (
              <View key={`${pr.sessionId}-${pr.exerciseId}-${pr.type}-${idx}`} style={{ gap: theme.spacing.sm }}>
                {idx > 0 ? <Divider /> : null}
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
                  {pr.weightKg > 0 ? (
                    <Txt variant="small">
                      {formatNumber(pr.weightKg, 1)} {t.units.kg} × {pr.reps}
                    </Txt>
                  ) : null}
                </Row>
              </View>
            ))
          )}
        </Card>
      </Section>

      <AppModal
        visible={modalOpen}
        title={t.progress.logWeight}
        onClose={() => setModalOpen(false)}
        footer={<Button title={t.common.save} onPress={saveWeight} />}
      >
        <Field
          label={t.progress.weightToday}
          value={weightInput}
          onChangeText={setWeightInput}
          keyboardType="decimal-pad"
          suffix={t.units.kg}
          autoFocus
        />
        <Field
          label={t.progress.noteOptional}
          value={noteInput}
          onChangeText={setNoteInput}
          multiline
        />
        {error ? (
          <Banner tone="danger" title={t.common.error}>
            {error}
          </Banner>
        ) : null}
      </AppModal>
    </Screen>
  );
}
