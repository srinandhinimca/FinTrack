import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function Transactions() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Transactions
      </Text>

      <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
        Manage your income and expenses
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },
});