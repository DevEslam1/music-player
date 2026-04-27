import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAccentColor, useThemeColor } from "../hooks/use-theme-color";

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryContainer extends React.Component<
  React.PropsWithChildren<{
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  }>,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Unhandled render error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View
          style={[
            styles.container,
            { backgroundColor: this.props.backgroundColor },
          ]}
        >
          <Text style={[styles.title, { color: this.props.textColor }]}>
            Something went wrong
          </Text>
          <Text style={styles.subtitle}>
            The app hit an unexpected error. Try rendering this screen again.
          </Text>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: this.props.accentColor },
            ]}
            onPress={this.handleRetry}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: React.PropsWithChildren) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const accentColor = useAccentColor();

  return (
    <ErrorBoundaryContainer
      accentColor={accentColor}
      backgroundColor={backgroundColor}
      textColor={textColor}
    >
      {children}
    </ErrorBoundaryContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
