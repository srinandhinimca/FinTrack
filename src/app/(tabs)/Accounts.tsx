import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { usePowerSync, useQuery } from '@powersync/react-native'; // 1. Import useQuery
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';

type Account = {
  id: string;
  user_id: string;
  account_id: number;
  name: string;
  opening_balance: number | null;
  currency: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export default function Accounts() {

  const db = usePowerSync();
  const { theme, mode } = useTheme();


//   useEffect(() => {
//   async function debugCheck() {
//     try {
      
//       const tableCheck = await db.getAll(
//         "SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'"
//       );
//       console.log("👉 Does accounts table exist in SQLite?", tableCheck);

      
//       const countResult = await db.getAll('SELECT count(*) as total FROM accounts');
//       console.log("👉 Total accounts records in local SQLite database:", countResult[0]);
      
      
//       const rawRows = await db.getAll('SELECT * FROM accounts LIMIT 5');
//       console.log("👉 Raw Rows:", rawRows);
//     } catch (e) {
//       console.error("❌ SQL Debug Error:", e);
//     }
//   }
//   debugCheck();
// }, []);
  // 2. Replace useEffect and useState with this single live subscription hook
  const { data: accounts, isLoading } = useQuery<Account>(
    `
    SELECT *
    FROM accounts
    ORDER BY created_at DESC
    `
  );

  // 3. Render a loader while the database is initializing
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

 <FlatList
      data={accounts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View
          style={[
            styles.currencyItem,
            { borderBottomColor: '#F0F0F0' }, // Soft divider that coordinates cleanly with white backgrounds
          ]}
        >
          {/* Circular Badge with Person Icon */}
          <View 
            style={[
              styles.iconContainer, 
              { backgroundColor: item.color || theme.primary }
            ]}
          >
            <Ionicons name="person" size={16} color="#FFF" />
          </View>

          {/* Account Item Text - Automatically aligned right next to the icon */}
          <Text style={[styles.currencyItemText, { color: theme.text }]}>
            {item.name}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: theme.text }]}>No accounts found.</Text>
      }
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#292a37',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  listContainer: {
    gap: 12,
  },
    iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16, // Creates the perfect circle badge
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Pushes text nicely away from the circle badge
  },
 
  emptyText: {
    color: '#b0b1bc',
    textAlign: 'center',
    marginTop: 40,
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    marginVertical: 1,
  },
    currencyItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
