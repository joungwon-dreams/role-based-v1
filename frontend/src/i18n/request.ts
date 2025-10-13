import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // Get locale from cookies or default to 'en'
  const locale = 'en';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
