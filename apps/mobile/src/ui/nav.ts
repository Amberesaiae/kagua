import { router } from 'expo-router';

/** Back, or home when the screen was opened directly (deep link, web reload). */
export function goBack(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function goHome(): void {
  if (router.canGoBack()) router.dismissTo('/');
  else router.replace('/');
}
