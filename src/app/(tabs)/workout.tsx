import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import {
  createProgramFromTemplate,
  deleteProgram,
  duplicateProgram,
  getActiveProgramDetail,
  getActiveSession,
  getProgramDayExerciseCount,
  getTodayProgramDay,
  listPrograms,
  listSessions,
  setActiveProgram,
  startSession,
  getWeeklyVolumeSummary,
} from '../../db/repos/workout';
import { getProfileBundle } from '../../db/repos/profile';
import { todayISO } from '../../domain/dates';
import { formatDate, formatNumber, t } from '../../i18n';
import { useUi } from '../../state/ui';
import {
  Badge,
  Banner,
  Button,
  Card,
  Divider,
  EmptyState,
  Header,
  IconButton,
  LoadingView,
  Row,
  Screen,
  Section,
  Txt,
} from '../../ui/components';
import { useTheme } from '../../ui/theme';
import { useQuery } from '../../ui/useQuery';

export default function WorkoutScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);

  const data = useQuery(
    () => ({
      today: getTodayProgramDay(),
      activeSession: getActiveSession(),
      program: getActiveProgramDetail(),
      programs: listPrograms(),
      profile: getProfileBundle()?.profile ?? null,
      history: listSessions(20),
    }),
    [],
  );

  if (data.loading && !data.data) return <LoadingView />;
  if (data.error) {
    return (
      <Screen>
        <Banner tone="danger" title={t.errors.db}>
          {data.error}
        </Banner>
      </Screen>
    );
  }

  const view = data.data;
  if (!view) return null;

  const openSession = (programDayId: string | null) => {
    const id = startSession({ programDayId });
    bump();
    router.push({ pathname: '/session', params: { id } });
  };

  const newProgram = () => {
    const created = createProgramFromTemplate(view.profile?.sessionsPerWeek ?? 3);
    if (!created) {
      Alert.alert(t.workout.noPrograms, t.workout.templateHint);
      return;
    }
    bump();
    router.push({ pathname: '/program', params: { id: created } });
  };

  const confirmDelete = (programId: string) =>
    Alert.alert(t.common.delete, t.workout.finishConfirm, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.delete,
        style: 'destructive',
        onPress: () => {
          deleteProgram(programId);
          bump();
        },
      },
    ]);

  return (
    <Screen>
      <Header title={t.workout.title} subtitle={formatDate(todayISO())} />

      {view.activeSession ? (
        <Card onPress={() => router.push({ pathname: '/session', params: { id: view.activeSession!.id } })}>
          <Row>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="h3">{t.workout.resumeSession}</Txt>
              <Txt variant="caption" color={theme.colors.textMuted}>
                {t.workout.resumeBody}
              </Txt>
            </View>
            <IconButton
              name="arrow-forward-circle"
              label={t.workout.resumeSession}
              onPress={() => router.push({ pathname: '/session', params: { id: view.activeSession!.id } })}
            />
          </Row>
        </Card>
      ) : null}

      <Section title={t.workout.todaySession}>
        <Card>
          {view.today ? (
            <>
              <Row>
                <Txt variant="h3">{view.today.day.name}</Txt>
                <Badge label={view.today.program.name} />
              </Row>
              <Txt variant="small" color={theme.colors.textMuted}>
                {getProgramDayExerciseCount(view.today.day.id)} {t.workout.exercises.toLowerCase()}
              </Txt>
              <Button
                title={t.workout.startSession}
                icon="barbell-outline"
                onPress={() => openSession(view.today!.day.id)}
              />
            </>
          ) : (
            <>
              <Txt variant="h3">{t.workout.restDay}</Txt>
              <Txt variant="small" color={theme.colors.textMuted}>
                {view.program ? view.today === null ? t.workout.noWorkoutToday : t.workout.restDayBody : t.workout.noPrograms}
              </Txt>
            </>
          )}
        </Card>

        {view.program && view.program.days.length > 0 ? (
          <Card>
            <Txt variant="caption" weight="600">
              {t.workout.chooseSession}
            </Txt>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {view.program.days.map((day) => (
                <Button
                  key={day.row.id}
                  title={day.row.name}
                  small
                  fullWidth={false}
                  variant="secondary"
                  onPress={() => openSession(day.row.id)}
                />
              ))}
            </Row>
            <Button
              title={t.workout.emptySession}
              small
              variant="ghost"
              icon="add"
              onPress={() => openSession(null)}
            />
          </Card>
        ) : (
          <Card>
            <Txt variant="h3">{t.workout.noPrograms}</Txt>
            <Txt variant="small" color={theme.colors.textMuted}>
              {t.workout.templateHint}
            </Txt>
            <Button title={t.workout.newProgram} icon="add" onPress={newProgram} />
            <Button
              title={t.workout.emptySession}
              small
              variant="ghost"
              onPress={() => openSession(null)}
            />
          </Card>
        )}
      </Section>

      <Section
        title={t.workout.programs}
        action={
          <Button
            title={t.workout.newProgram}
            small
            fullWidth={false}
            variant="secondary"
            onPress={newProgram}
          />
        }
      >
        {view.programs.length === 0 ? (
          <EmptyState icon="barbell-outline" title={t.workout.noPrograms} />
        ) : (
          view.programs.map((program) => {
            const isActive = view.program?.program.id === program.id;
            return (
              <Card key={program.id} onPress={() => router.push({ pathname: '/program', params: { id: program.id } })}>
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="h3">{program.name}</Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {program.template} · {program.sessionsPerWeek}×{t.workout.weekShort}
                    </Txt>
                  </View>
                  {isActive ? <Badge label={t.common.auto} /> : null}
                  <IconButton
                    name="create-outline"
                    label={t.workout.editProgram}
                    onPress={() => router.push({ pathname: '/program', params: { id: program.id } })}
                  />
                  <IconButton
                    name="copy-outline"
                    label={t.workout.duplicate}
                    onPress={() => {
                      duplicateProgram(program.id);
                      bump();
                    }}
                  />
                  <IconButton
                    name="trash-outline"
                    label={`${t.common.delete} ${program.name}`}
                    onPress={() => confirmDelete(program.id)}
                  />
                </Row>
                {isActive ? null : (
                  <Button
                    title={t.workout.setActive}
                    small
                    variant="secondary"
                    onPress={() => {
                      setActiveProgram(program.id);
                      bump();
                    }}
                  />
                )}
              </Card>
            );
          })
        )}
      </Section>

      <Section title={t.workout.historyTitle}>
        {view.history.length === 0 ? (
          <EmptyState icon="time-outline" title={t.workout.noHistory} />
        ) : (
          <Card>
            {view.history.map((item, index) => (
              <View key={item.session.id} style={{ gap: theme.spacing.sm }}>
                {index > 0 ? <Divider /> : null}
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="small" weight="600">
                      {item.session.programDayName ?? t.workout.title}
                    </Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {formatDate(item.session.date)} · {item.totalSets} {t.workout.setsShort}
                    </Txt>
                  </View>
                  <Txt variant="small" color={theme.colors.textMuted}>
                    {formatNumber(item.totalVolume)} kg
                  </Txt>
                  <IconButton
                    name="chevron-forward"
                    label={t.workout.sessionSummary}
                    size={18}
                    onPress={() =>
                      router.push({ pathname: '/session-summary', params: { id: item.session.id } })
                    }
                  />
                </Row>
              </View>
            ))}
          </Card>
        )}
      </Section>

      <Section title={t.workout.weeklyVolume}>
        {(() => {
          const weekly = getWeeklyVolumeSummary(12);
          if (weekly.length === 0) {
            return <EmptyState icon="trending-up-outline" title={t.workout.noVolumeData} />;
          }
          const maxVol = Math.max(...weekly.map((w) => w.totalVolume), 1);
          return (
            <Card>
              {weekly.map((w, i) => (
                <View key={w.weekStart} style={{ gap: theme.spacing.sm }}>
                  {i > 0 ? <Divider /> : null}
                  <Row>
                    <View style={{ flex: 1 }}>
                      <Txt variant="small" weight="600">
                        {formatDate(w.weekStart)}
                      </Txt>
                      <Txt variant="caption" color={theme.colors.textMuted}>
                        {w.sessions} {t.workout.sessionsShort}
                        {w.avgE1rm ? ` · e1RM ${formatNumber(w.avgE1rm)} kg` : ''}
                      </Txt>
                    </View>
                    <Txt variant="small" weight="600">
                      {formatNumber(w.totalVolume)} kg
                    </Txt>
                  </Row>
                  {/* Simple bar chart */}
                  <View
                    style={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: theme.colors.surfaceAlt,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${(w.totalVolume / maxVol) * 100}%`,
                        borderRadius: 3,
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  </View>
                </View>
              ))}
            </Card>
          );
        })()}
      </Section>
    </Screen>
  );
}
