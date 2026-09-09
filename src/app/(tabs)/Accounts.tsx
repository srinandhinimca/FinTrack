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
      <Text style={styles.title}>Accounts ({accounts.length})</Text>
      
      {/* 4. Display the live accounts array */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          // <View style={[styles.accountCard, { borderLeftColor: item.color || '#fff' }]}>
          //   <Text style={styles.accountName}>{item.name}</Text>
          //   <Text style={styles.accountBalance}>
          //     {item.currency} {item.opening_balance?.toFixed(2) || '0.00'}
          //   </Text>
          // </View>


          <View
            style={[
              styles.currencyItem,
              { borderBottomColor: theme.border },

            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
            <Text style={[
              styles.currencyItemText,
              { color: theme.text }
            ]}>
              {item.name}
            </Text>

          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No accounts found.</Text>
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
  accountCard: {
    backgroundColor: '#353646',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 5,
  },
  accountName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountBalance: {
    color: '#b0b1bc',
    fontSize: 14,
    marginTop: 4,
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
