import { ref } from 'vue';

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
}

export function useRetryRequest<T extends (...args: any[]) => Promise<any>>(
  requestFn: T,
  { maxRetries = 5, delay = 1000 }: RetryOptions = {}
) {
  const loading = ref(false);

  async function exec(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    let attempt = 0;
    const run = async (): Promise<any> => {
      attempt++;
      loading.value = true;
      try {
        const res = await requestFn(...args);
        loading.value = false;
        return res;
      } catch (e) {
        if (attempt >= maxRetries) {
          loading.value = false;
          throw e;
        }
        await new Promise(r => setTimeout(r, delay * 2 ** (attempt - 1)));
        return run();
      }
    };
    return run();
  }

  return { exec, loading };
}