import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useUi } from '../state/ui';

export interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Small synchronous query helper. SQLite is local and synchronous, so screens
 * reload instantly; `version` is bumped by write actions to refresh every tab.
 */
export function useQuery<T>(loader: () => T, deps: unknown[] = []): QueryResult<T> {
  const version = useUi((state) => state.version);
  const key = deps.map((value) => String(value)).join('|');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    try {
      const result = loader();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
    // loader is intentionally read from the latest render; key + version decide when it re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, key]);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  return { data, loading, error, reload: run };
}
