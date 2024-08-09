import useSWR from 'swr';
import { ZodError, ZodType } from 'zod';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useData = <T>(url: string, schema: ZodType<T>) => {
  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
  });

  let parsedData: T | undefined;
  let parseError: Error | undefined;

  if (data) {
    try {
      parsedData = schema.parse(data.data);
    } catch (e) {
      if (e instanceof ZodError) {
        console.error('Zod parsing error:', e.errors);
        parseError = new Error(
          `Data validation failed: ${e.errors.map((err) => err.message).join(', ')}`,
        );
      } else {
        console.error('Unexpected error during parsing:', e);
        parseError = new Error('An unexpected error occurred while parsing the data');
      }
    }
  }

  return {
    data: parsedData,
    error: error || parseError,
    isLoading,
  };
};

export default useData;
