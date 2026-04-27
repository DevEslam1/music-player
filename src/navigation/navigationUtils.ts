import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

/**
 * Navigate to a specific route using the common navigationRef
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}
