import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from "@/lib/supabase"
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from "@/context/ThemeContext";

type Transaction = {
  id: string;
  title: string;
  date: string;
  amount: string;
  type: 'income' | 'expense';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const transactions: Transaction[] = [
  {
    id: '1',
    title: 'Transfer to John',
    date: '09:30 AM  •  09/09/2025',
    amount: '-$9.00',
    type: 'expense',
    icon: 'send-outline',
  },
  {
    id: '2',
    title: 'Top Up Shoppe Pay',
    date: '09:15 AM  •  09/09/2025',
    amount: '-$12.00',
    type: 'expense',
    icon: 'arrow-up-circle-outline',
  },
  {
    id: '3',
    title: 'Pay Electricity',
    date: '09:08 AM  •  09/09/2025',
    amount: '-$15.00',
    type: 'expense',
    icon: 'lightning-bolt-outline',
  },
  {
    id: '4',
    title: 'Receive from Alex',
    date: '08:30 AM  •  09/09/2025',
    amount: '+$31.00',
    type: 'income',
    icon: 'arrow-down-circle-outline',
  },
  {
    id: '5',
    title: 'Receive from Beryl',
    date: '08:00 AM  •  09/09/2025',
    amount: '+$25.00',
    type: 'income',
    icon: 'arrow-down-circle-outline',
  },
];

// function ActionButton({
//   icon,
//   label,
// }: {
//   icon: keyof typeof Ionicons.glyphMap;
//   label: string;
// }) {
//   return (
//     <TouchableOpacity style={styles.actionContainer}>
//       <View style={styles.actionCircle}>
//         <Ionicons
//           name={icon}
//           size={21}
//           color="#d9d9e2"
//         />
//       </View>

//       <Text style={styles.actionText}>
//         {label}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// function TransactionItem({
//   item,
// }: {
//   item: Transaction;
// }) {
//   const isIncome = item.type === 'income';

//   return (
//     <TouchableOpacity style={styles.transactionItem}>

//       <View
//         style={[
//           styles.transactionIcon,
//           isIncome
//             ? styles.incomeIconBackground
//             : styles.expenseIconBackground,
//         ]}
//       >
//         <MaterialCommunityIcons
//           name={item.icon}
//           size={18}
//           color={
//             isIncome
//               ? '#36c979'
//               : '#8b86bc'
//           }
//         />
//       </View>

//       <View style={styles.transactionInfo}>
//         <Text style={styles.transactionTitle}>
//           {item.title}
//         </Text>

//         <Text style={styles.transactionDate}>
//           {item.date}
//         </Text>
//       </View>

//       <Text
//         style={[
//           styles.transactionAmount,
//           isIncome
//             ? styles.incomeAmount
//             : styles.expenseAmount,
//         ]}
//       >
//         {item.amount}
//       </Text>

//     </TouchableOpacity>
//   );
// }

export default function Home() {
 const { theme, mode } = useTheme();

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.primarybg }]}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.primarybg}
      />

      <View style={[styles.container, { backgroundColor: theme.primarybg }]}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* BALANCE CARD */}
          {/* <View style={styles.balanceCard}>

            <View style={styles.shapeOne} />
            <View style={styles.shapeTwo} />
            <View style={styles.shapeThree} />

            <View style={styles.balanceContent}>

              <Text style={styles.balanceLabel}>
                Total Balance
              </Text>

              <View style={styles.balanceRow}>

                <Text style={styles.balance}>
                  $18,223.08
                </Text>

                <TouchableOpacity>
                  <Ionicons
                    name="eye-outline"
                    size={21}
                    color="#dce9e7"
                  />
                </TouchableOpacity>

              </View>

              <View style={styles.accountRow}>

                <Text style={styles.accountText}>
                  Account : 311 2322 2342
                </Text>

                <Ionicons
                  name="copy-outline"
                  size={12}
                  color="#d6e6e3"
                />

              </View>

            </View>

          </View> */}

          {/* ACTION BUTTONS */}
          {/* <View style={styles.actionsRow}>

            <ActionButton
              icon="add-circle-outline"
              label="Expense"
            />

             <ActionButton
              icon="add-circle-outline"
              label="Income"
            />

            <ActionButton
              icon="arrow-up-outline"
              label="Transfer"
            />

            <ActionButton
              icon="arrow-down-outline"
              label="Request"
            />

            <ActionButton
              icon="people-outline"
              label="Pay Bills"
            />

          </View> */}

          {/* TRANSACTIONS HEADER */}
          {/* <View style={styles.sectionHeader}>

            <Text style={styles.sectionTitle}>
              Last Transaction
            </Text>

            <TouchableOpacity>
              <Text style={styles.viewAll}>
                View All
              </Text>
            </TouchableOpacity>

          </View> */}

          {/* TRANSACTIONS */}
          {/* <View style={styles.transactionsContainer}>

            {transactions.map((item) => (
              <TransactionItem
                key={item.id}
                item={item}
              />
            ))}

          </View> */}

        </ScrollView>

        {/* FLOATING QR BUTTON */}
        {/* <TouchableOpacity
          style={styles.scanButton}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={23}
            color="#ffffff"
          />
        </TouchableOpacity> */}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    
  },

  container: {
    flex: 1,
    
  },

  /* SCROLL */

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  /* BALANCE */

  balanceCard: {
    height: 114,
    borderRadius: 11,
    backgroundColor: '#168c83',
    overflow: 'hidden',
    position: 'relative',
  },

  balanceContent: {
    zIndex: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  balanceLabel: {
    color: '#bde0dc',
    fontSize: 8,
    marginBottom: 3,
  },

  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  balance: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '600',
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  accountText: {
    color: '#b9ded9',
    fontSize: 8,
    marginRight: 7,
  },

  /* CARD SHAPES */

  shapeOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    backgroundColor: '#ffffff0b',
    transform: [
      { rotate: '45deg' },
    ],
    right: -60,
    top: -80,
  },

  shapeTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: '#063e3a22',
    transform: [
      { rotate: '45deg' },
    ],
    right: 40,
    top: -75,
  },

  shapeThree: {
    position: 'absolute',
    width: 130,
    height: 130,
    backgroundColor: '#ffffff08',
    transform: [
      { rotate: '45deg' },
    ],
    left: 100,
    bottom: -100,
  },

  /* ACTIONS */

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    marginTop: 12,
    marginBottom: 14,
  },

  actionContainer: {
    alignItems: 'center',
    width: '23%',
  },

  actionCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#3a3b48',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },

  actionText: {
    color: '#b8b8c2',
    fontSize: 8,
  },

  /* SECTION */

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  sectionTitle: {
    color: '#f0f0f3',
    fontSize: 11,
    fontWeight: '500',
  },

  viewAll: {
    color: '#bdbdc8',
    fontSize: 9,
  },

  /* TRANSACTIONS */

  transactionsContainer: {
    gap: 5,
  },

  transactionItem: {
    height: 47,
    backgroundColor: '#30313f',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  transactionIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  expenseIconBackground: {
    backgroundColor: '#35384a',
  },

  incomeIconBackground: {
    backgroundColor: '#303d3d',
  },

  transactionInfo: {
    flex: 1,
  },

  transactionTitle: {
    color: '#e3e3e7',
    fontSize: 9,
    fontWeight: '500',
    marginBottom: 2,
  },

  transactionDate: {
    color: '#8f909d',
    fontSize: 7,
  },

  transactionAmount: {
    fontSize: 9,
    fontWeight: '500',
  },

  expenseAmount: {
    color: '#e4e4e8',
  },

  incomeAmount: {
    color: '#38c979',
  },

  /* FLOATING BUTTON */

  scanButton: {
    position: 'absolute',
    bottom: 25,
    left: '50%',
    marginLeft: -22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#279f94',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 8,

    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
}

);