import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function saveAuthTokens(tokens: {
  access?: string | null;
  refresh?: string | null;
}) {
  const entries: [string, string][] = [];

  if (tokens.access) {
    entries.push([ACCESS_TOKEN_KEY, tokens.access]);
  }

  if (tokens.refresh) {
    entries.push([REFRESH_TOKEN_KEY, tokens.refresh]);
  }

  if (entries.length > 0) {
    await AsyncStorage.multiSet(entries);
  }
}

export async function clearAuthTokens() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

export async function notifyUnauthorized() {
  await unauthorizedHandler?.();
}
