import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { MEAL_TYPES, type MealType } from '../config';
import {
  addMealEntry,
  createCustomFood,
  createRecipeFood,
  getServings,
  searchFoods,
} from '../db/repos/food';
import { webSearchFoods } from '../db/repos/food-search';
import { isWeb } from '../db/db';
import type { FoodRow } from '../db/schema';
import { todayISO } from '../domain/dates';
import {
  isCalorieConsistent,
  recipeToPer100g,
  scaleNutrition,
  type NutritionPer100g,
} from '../domain/food';
import { formatKcal, formatNumber, t } from '../i18n';
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
  Row,
  Screen,
  Txt,
  useConfirm,
} from '../ui/components';
import { useTheme } from '../ui/theme';
import { useQuery } from '../ui/useQuery';
import { customFoodSchema } from '../validation';

const MODES = [
  { key: 'frequent', label: t.food.frequent },
  { key: 'recent', label: t.food.recent },
  { key: 'all', label: t.food.allFoods },
  { key: 'custom', label: t.food.customTab },
] as const;

type Mode = (typeof MODES)[number]['key'];

/** Suggested foods shown as quick-pick chips when search is empty. */
const SUGGESTION_KEYWORDS = isWeb
  ? [
      'Nasi',
      'Ayam',
      'Tempe',
      'Telur',
      'Sapi',
      'Ikan',
      'Susu',
      'Roti',
      'Mie',
      'Sayur',
      'Buah',
      'Kopi',
    ]
  : [];

interface ServingOption {
  id: string;
  label: string;
  grams: number;
}

const PER_100: ServingOption = { id: '__100', label: `100 ${t.units.g}`, grams: 100 };

function per100g(row: FoodRow): NutritionPer100g {
  return {
    kcal100g: row.kcal100g,
    protein100g: row.protein100g,
    carbs100g: row.carbs100g,
    fat100g: row.fat100g,
  };
}

const EMPTY_FORM = {
  name: '',
  brand: '',
  category: '',
  servingLabel: '',
  servingGrams: '100',
  kcal: '',
  protein: '',
  carbs: '',
  fat: '',
};

export default function FoodSearchScreen() {
  const theme = useTheme();
  const bump = useUi((state) => state.bump);
  const confirm = useConfirm();
  const params = useLocalSearchParams<{ date?: string; meal?: string }>();
  const date = typeof params.date === 'string' && params.date ? params.date : todayISO();
  const meal: MealType =
    typeof params.meal === 'string' && (MEAL_TYPES as readonly string[]).includes(params.meal)
      ? (params.meal as MealType)
      : 'snack';

  const [mode, setMode] = useState<Mode>('frequent');
  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<FoodRow | null>(null);
  const [servingId, setServingId] = useState<string | null>(null);
  const [qty, setQty] = useState('1');

  const [customOpen, setCustomOpen] = useState(false);
  const [recipe, setRecipe] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<{ food: FoodRow; grams: number }[]>([]);
  const [ingQuery, setIngQuery] = useState('');

  const results = useQuery(
    () => {
      if (isWeb) {
        // Web mode: search from bundled seed data (no DB)
        return webSearchFoods(query, mode, 40).map((row) => ({
          id: row.id,
          name: row.name,
          brand: null,
          source: 'builtin',
          category: row.category,
          kcal100g: row.kcal100g,
          protein100g: row.protein100g,
          carbs100g: row.carbs100g,
          fat100g: row.fat100g,
          isCustom: 0,
          verified: 0,
          searchText: row.name,
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        }));
      }
      return searchFoods(query, mode, 40);
    },
    [query, mode],
  );
  const servings = useQuery(
    () => (selected ? getServings(selected.id) : []),
    [selected?.id ?? ''],
  );
  const ingResults = useQuery(
    () => (ingQuery.trim() ? searchFoods(ingQuery, 'all', 8) : []),
    [ingQuery],
  );

  const options: ServingOption[] = [
    ...(servings.data ?? []).map((row) => ({ id: row.id, label: row.label, grams: row.grams })),
    PER_100,
  ];
  const serving: ServingOption =
    options.find((option) => option.id === servingId) ??
    (servings.data ?? []).find((row) => row.isDefault === 1) ??
    PER_100;

  const quantity = Number(qty.replace(',', '.')) || 0;
  const grams = serving.grams * quantity;
  const preview = selected ? scaleNutrition(per100g(selected), grams) : null;

  const recipePreview = ingredients.length
    ? recipeToPer100g(
        ingredients.map((item) => ({ per100g: per100g(item.food), grams: item.grams })),
      )
    : null;

  const pick = (row: FoodRow) => {
    setSelected(row);
    setServingId(null);
    setQty('1');
  };

  const closeAll = () => {
    setSelected(null);
    setCustomOpen(false);
    bump();
    router.back();
  };

  const saveEntry = () => {
    if (!selected || grams <= 0) return;
    addMealEntry({
      date,
      mealType: meal,
      foodId: selected.id,
      grams,
      quantity,
      servingId: serving.id === PER_100.id ? null : serving.id,
    });
    closeAll();
  };

  const updateForm = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submitCustom = () => {
    setFormError(null);
    const parsed = customFoodSchema.safeParse({
      name: form.name,
      brand: form.brand || undefined,
      category: form.category || undefined,
      servingLabel: form.servingLabel || undefined,
      servingGrams: form.servingGrams,
      kcal100g: form.kcal,
      protein100g: form.protein,
      carbs100g: form.carbs,
      fat100g: form.fat,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? t.common.error);
      return;
    }
    const values = parsed.data;
    const save = () => {
      const id = createCustomFood(values);
      addMealEntry({ date, mealType: meal, foodId: id, grams: values.servingGrams, quantity: 1 });
      closeAll();
    };
    if (
      !isCalorieConsistent(values.kcal100g, values.protein100g, values.carbs100g, values.fat100g)
    ) {
      confirm.show({
        title: t.food.kcalWarning,
        confirmLabel: t.common.yes,
        onConfirm: save,
      });
      return;
    }
    save();
  };

  const submitRecipe = () => {
    setFormError(null);
    if (!form.name.trim()) {
      setFormError(t.food.nameRequired);
      return;
    }
    if (ingredients.length === 0) {
      setFormError(t.food.recipeNeedsIngredients);
      return;
    }
    const id = createRecipeFood({
      name: form.name,
      category: form.category || undefined,
      items: ingredients.map((item) => ({ foodId: item.food.id, grams: item.grams })),
    });
    if (!id) {
      setFormError(t.food.recipeNeedsIngredients);
      return;
    }
    addMealEntry({
      date,
      mealType: meal,
      foodId: id,
      grams: Math.max(1, Math.round(recipePreview?.totalGrams ?? 100)),
      quantity: 1,
    });
    closeAll();
  };

  return (
    <Screen>
      <Header title={t.food.searchFood} subtitle={t.meal[meal]} onBack={() => router.back()} />

      <Field
        label={t.food.searchFood}
        value={query}
        onChangeText={setQuery}
        placeholder={t.food.searchPlaceholder}
        autoFocus
      />

      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        {MODES.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={mode === item.key}
            onPress={() => setMode(item.key)}
          />
        ))}
      </Row>

      {/* Quick-pick suggestions when no active search */}
      {!query.trim() && SUGGESTION_KEYWORDS.length > 0 && (
        <>
          <Txt variant="small" style={{ color: theme.colors.textMuted, marginTop: theme.spacing.md }}>
            {t.food.quickPick}
          </Txt>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            {SUGGESTION_KEYWORDS.map((kw) => (
              <Chip
                key={kw}
                label={kw}
                onPress={() => setQuery(kw)}
              />
            ))}
          </Row>
          <Divider />
        </>
      )}

      {(results.data ?? []).length === 0 ? (
        <EmptyState icon="search-outline" title={t.food.noResults} body={t.food.noResultsHint} />
      ) : (
        <View style={{ gap: theme.spacing.sm }}>
          {(results.data ?? []).map((row, index) => (
            <View key={row.id} style={{ gap: theme.spacing.sm }}>
              {index > 0 ? <Divider /> : null}
              <Card onPress={() => pick(row)} accessibilityLabel={row.name}>
                <Row>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="small" weight="600" numberOfLines={1}>
                      {row.name}
                    </Txt>
                    <Txt variant="caption" color={theme.colors.textMuted}>
                      {formatKcal(row.kcal100g)} / {t.units.per100g}
                      {row.brand ? ` · ${row.brand}` : ''}
                    </Txt>
                  </View>
                  {row.isCustom === 1 ? <Badge label={t.food.customLabel} /> : null}
                  <IconButton name="add-circle-outline" label={row.name} onPress={() => pick(row)} />
                </Row>
              </Card>
            </View>
          ))}
        </View>
      )}

      <Button
        title={t.food.createFood}
        icon="create-outline"
        variant="secondary"
        onPress={() => {
          setForm(EMPTY_FORM);
          setIngredients([]);
          setIngQuery('');
          setRecipe(false);
          setFormError(null);
          setCustomOpen(true);
        }}
      />

      <AppModal
        visible={selected !== null}
        title={t.food.selectFood}
        onClose={() => setSelected(null)}
        footer={
          <Button
            title={t.food.saveEntry}
            disabled={!preview || grams <= 0}
            onPress={saveEntry}
          />
        }
      >
        {selected ? (
          <>
            <Card>
              <Txt variant="h3">{selected.name}</Txt>
              <Txt variant="caption" color={theme.colors.textMuted}>
                {formatKcal(selected.kcal100g)} / {t.units.per100g}
                {selected.brand ? ` · ${selected.brand}` : ''}
              </Txt>
            </Card>

            <Txt variant="caption" weight="600">
              {t.food.servingSize}
            </Txt>
            <Row gap={8} style={{ flexWrap: 'wrap' }}>
              {options.map((option) => (
                <Chip
                  key={option.id}
                  label={`${option.label} (${formatNumber(option.grams)} ${t.units.g})`}
                  selected={serving.id === option.id}
                  onPress={() => setServingId(option.id)}
                />
              ))}
            </Row>

            <Field
              label={t.food.quantity}
              value={qty}
              onChangeText={setQty}
              keyboardType="decimal-pad"
              suffix={serving.label}
            />

            <Card>
              <Row>
                <Txt variant="caption" color={theme.colors.textMuted}>
                  {t.food.preview}
                </Txt>
                <Txt variant="small" weight="600">
                  {formatNumber(grams)} {t.units.g}
                </Txt>
              </Row>
              <Txt variant="h2">{preview ? formatKcal(preview.kcal) : '–'}</Txt>
              <Row>
                <Txt variant="caption" color={theme.colors.textMuted}>
                  {t.nutrition.protein} {preview ? formatNumber(preview.proteinG, 1) : 0} {t.units.g}
                </Txt>
                <Txt variant="caption" color={theme.colors.textMuted}>
                  {t.nutrition.carbs} {preview ? formatNumber(preview.carbsG, 1) : 0} {t.units.g}
                </Txt>
                <Txt variant="caption" color={theme.colors.textMuted}>
                  {t.nutrition.fat} {preview ? formatNumber(preview.fatG, 1) : 0} {t.units.g}
                </Txt>
              </Row>
            </Card>
          </>
        ) : null}
      </AppModal>

      <AppModal
        visible={customOpen}
        title={recipe ? t.food.createRecipe : t.food.customTitle}
        onClose={() => setCustomOpen(false)}
        footer={
          <Button
            title={t.food.saveFood}
            onPress={recipe ? submitRecipe : submitCustom}
          />
        }
      >
        <Row gap={8}>
          <Chip label={t.food.customTitle} selected={!recipe} onPress={() => setRecipe(false)} />
          <Chip
            label={t.food.recipeMode}
            selected={recipe}
            onPress={() => setRecipe(true)}
          />
        </Row>

        <Field label={t.food.name} value={form.name} onChangeText={updateForm('name')} />
        <Field label={t.food.category} value={form.category} onChangeText={updateForm('category')} />

        {recipe ? (
          <>
            <Txt variant="caption" weight="600">
              {t.food.ingredients}
            </Txt>
            {ingredients.length === 0 ? (
              <Txt variant="caption" color={theme.colors.textMuted}>
                {t.food.recipeNeedsIngredients}
              </Txt>
            ) : (
              ingredients.map((item, index) => (
                <Card key={item.food.id}>
                  <Row>
                    <View style={{ flex: 1 }}>
                      <Txt variant="small" weight="600" numberOfLines={1}>
                        {item.food.name}
                      </Txt>
                    </View>
                    <IconButton
                      name="trash-outline"
                      label={`${t.common.delete} ${item.food.name}`}
                      size={20}
                      onPress={() =>
                        setIngredients((prev) => prev.filter((_, at) => at !== index))
                      }
                    />
                  </Row>
                  <Field
                    label={t.food.ingredientGrams}
                    value={String(item.grams)}
                    onChangeText={(value) =>
                      setIngredients((prev) =>
                        prev.map((row, at) =>
                          at === index
                            ? { ...row, grams: Number(value.replace(',', '.')) || 0 }
                            : row,
                        ),
                      )
                    }
                    keyboardType="decimal-pad"
                    suffix={t.units.g}
                  />
                </Card>
              ))
            )}

            <Field
              label={t.food.pickIngredient}
              value={ingQuery}
              onChangeText={setIngQuery}
              placeholder={t.food.searchPlaceholder}
            />
            {(ingResults.data ?? []).map((row) => (
              <Card
                key={row.id}
                onPress={() => {
                  setIngredients((prev) => [...prev, { food: row, grams: 100 }]);
                  setIngQuery('');
                }}
                accessibilityLabel={row.name}
              >
                <Row>
                  <Txt variant="small" weight="600" numberOfLines={1} style={{ flex: 1 }}>
                    {row.name}
                  </Txt>
                  <Txt variant="caption" color={theme.colors.textMuted}>
                    {formatKcal(row.kcal100g)} / {t.units.per100g}
                  </Txt>
                </Row>
              </Card>
            ))}

            {recipePreview ? (
              <Card>
                <Row>
                  <Txt variant="caption" color={theme.colors.textMuted}>
                    {t.food.totalGrams}
                  </Txt>
                  <Txt variant="small" weight="600">
                    {formatNumber(recipePreview.totalGrams)} {t.units.g}
                  </Txt>
                </Row>
                <Txt variant="small">
                  {formatKcal(recipePreview.per100g.kcal100g)} / {t.units.per100g}
                </Txt>
              </Card>
            ) : null}
          </>
        ) : (
          <>
            <Row gap={8}>
              <View style={{ flex: 1 }}>
                <Field
                  label={t.food.servingLabel}
                  value={form.servingLabel}
                  onChangeText={updateForm('servingLabel')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label={t.food.servingGrams}
                  value={form.servingGrams}
                  onChangeText={updateForm('servingGrams')}
                  keyboardType="decimal-pad"
                  suffix={t.units.g}
                />
              </View>
            </Row>
            <Field label={t.food.brand} value={form.brand} onChangeText={updateForm('brand')} />

            <Txt variant="caption" weight="600">
              {t.food.per100g}
            </Txt>
            <Row gap={8}>
              <View style={{ flex: 1 }}>
                <Field
                  label={t.food.kcal}
                  value={form.kcal}
                  onChangeText={updateForm('kcal')}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label={t.food.protein}
                  value={form.protein}
                  onChangeText={updateForm('protein')}
                  keyboardType="decimal-pad"
                />
              </View>
            </Row>
            <Row gap={8}>
              <View style={{ flex: 1 }}>
                <Field
                  label={t.food.carbs}
                  value={form.carbs}
                  onChangeText={updateForm('carbs')}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label={t.food.fat}
                  value={form.fat}
                  onChangeText={updateForm('fat')}
                  keyboardType="decimal-pad"
                />
              </View>
            </Row>
          </>
        )}

        {formError ? (
          <Banner tone="danger" title={t.common.error}>
            {formError}
          </Banner>
        ) : null}

        <Txt variant="caption" color={theme.colors.textMuted}>
          {t.food.estimateNote}
        </Txt>
      </AppModal>

      {confirm.element}
    </Screen>
  );
}
