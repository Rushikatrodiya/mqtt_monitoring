import { useQuery } from '@tanstack/react-query';

export function useQueryData(queryKey, queryFn, options = {}) {
  const { refetchInterval, transform } = options;

  const { data } = useQuery({
    queryKey,
    queryFn,
    refetchInterval,
  });

  return transform ? transform(data) : data;
}
