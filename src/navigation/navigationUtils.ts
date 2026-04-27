import { createNavigationContainerRef } from "@react-navigation/native";
import { MainStack } from "./AppNavigator";

export const navigationRef = createNavigationContainerRef<MainStack>();

/**
 * Navigate to a specific route using the common navigationRef
 */
export function navigate<RouteName extends keyof MainStack>(
  name: RouteName,
  params?: MainStack[RouteName],
) {
  if (navigationRef.isReady()) {
    const performNavigate = navigationRef.navigate as unknown as (
      ...args: unknown[]
    ) => void;

    if (params === undefined) {
      performNavigate(name);
      return;
    }

    performNavigate(name, params);
  }
}
