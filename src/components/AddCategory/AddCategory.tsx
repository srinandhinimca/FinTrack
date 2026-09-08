import { useTheme } from '@/context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type CategoryType = 'expense' | 'income';

const icons: Array<
  keyof typeof MaterialCommunityIcons.glyphMap
> = [
  'silverware-fork-knife',
  'car-outline',
  'shopping-outline',
  'home-outline',
  'airplane-outline',

  'receipt-text-outline',
  'heart-outline',
  'school-outline',
  'gift-outline',
  'gamepad-variant-outline',

  'briefcase-outline',
  'cup-outline',
  'paw-outline',
  'dumbbell',
  'dots-horizontal',
];

// =========================================
// CATEGORY COLORS
// =========================================

const categoryColors = [
  '#FFB4A2',
  '#7DD3FC',
  '#C4B5FD',
  '#FDE68A',
  '#86EFAC',
  '#FDA4AF',
  '#A5F3FC',
  '#D1D5DB',
  '#FDBA74',
  '#6EE7B7',
  '#A78BFA',
  '#FCD34D',
];

// =========================================
// PROPS
// =========================================

interface AddCategoryProps {
  initialType?: CategoryType;
  onClose?: () => void;
  onDone?: (category: {
    name: string;
    type: CategoryType;
    icon: string;
    color: string;
  }) => void;
}

// =========================================
// COMPONENT
// =========================================

export default function AddCategory({
  initialType = 'expense',
  onClose,
  onDone,
}: AddCategoryProps) {
  const { theme } = useTheme();

  // =======================================
  // CATEGORY TYPE
  // =======================================

  const [categoryType, setCategoryType] =
    useState<CategoryType>(initialType);

  // =======================================
  // CATEGORY NAME
  // =======================================

  const [categoryName, setCategoryName] =
    useState('');

  // =======================================
  // SELECTED ICON
  // =======================================

  const [selectedIcon, setSelectedIcon] =
    useState<
      keyof typeof MaterialCommunityIcons.glyphMap
    >('silverware-fork-knife');

  // =======================================
  // SELECTED COLOR
  // =======================================

  const [selectedColor, setSelectedColor] =
    useState(categoryColors[0]);

  // =======================================
  // SAVE
  // =======================================

  const handleDone = () => {
    const name = categoryName.trim();

    // -------------------------------
    // Validate name
    // -------------------------------

    if (!name) {
      Alert.alert(
        'Category Name',
        'Please enter a category name.'
      );
      return;
    }

    // -------------------------------
    // Send data to parent
    // -------------------------------

    onDone?.({
      name,
      type: categoryType,
      icon: selectedIcon,
      color: selectedColor,
    });
  };

  // =======================================
  // SCREEN
  // =======================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* =================================
            HEADER
        ================================= */}

        <View style={styles.header}>

          {/* BACK */}

          <Pressable
            style={styles.backButton}
            onPress={onClose}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={32}
              color={theme.text}
            />
          </Pressable>

          {/* TITLE */}

          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Add Category
          </Text>

          <View style={styles.headerRight} />
        </View>

        {/* =================================
            EXPENSES / INCOME
        ================================= */}

        <View
          style={[
            styles.tabContainer,
            {
              borderColor: theme.primary,
            },
          ]}
        >

          {/* EXPENSES */}

          <Pressable
            style={[
              styles.tab,
              {
                backgroundColor:
                  categoryType === 'expense'
                    ? theme.primary
                    : theme.card,
              },
            ]}
            onPress={() =>
              setCategoryType('expense')
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    categoryType === 'expense'
                      ? theme.primaryText
                      : theme.primary,
                },
              ]}
            >
              Expenses
            </Text>
          </Pressable>

          {/* INCOME */}

          <Pressable
            style={[
              styles.tab,
              {
                backgroundColor:
                  categoryType === 'income'
                    ? theme.primary
                    : theme.card,
              },
            ]}
            onPress={() =>
              setCategoryType('income')
            }
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    categoryType === 'income'
                      ? theme.primaryText
                      : theme.primary,
                },
              ]}
            >
              Income
            </Text>
          </Pressable>

        </View>

        {/* =================================
            CATEGORY NAME
        ================================= */}

        <View style={styles.section}>

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Category Name
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >

            <TextInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={
                theme.secondaryText
              }
              maxLength={30}
              autoCapitalize="words"
              style={[
                styles.input,
                {
                  color: theme.text,
                },
              ]}
            />

            <Text
              style={[
                styles.counter,
                {
                  color: theme.secondaryText,
                },
              ]}
            >
              {categoryName.length}/30
            </Text>

          </View>

        </View>

        {/* =================================
            CHOOSE ICON
        ================================= */}

        <View style={styles.section}>

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Choose Icon
          </Text>

          <View style={styles.iconGrid}>

            {icons.map((icon) => {

              const isSelected =
                selectedIcon === icon;

              return (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor:
                        theme.card,

                      borderColor: isSelected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() =>
                    setSelectedIcon(icon)
                  }
                >

                  <MaterialCommunityIcons
                    name={icon}
                    size={23}
                    color={
                      isSelected
                        ? theme.primary
                        : theme.text
                    }
                  />

                </Pressable>
              );
            })}

          </View>

        </View>

        {/* =================================
            CHOOSE COLOR
        ================================= */}

        <View style={styles.colorSection}>

          <Text
            style={[
              styles.label,
              {
                color: theme.text,
              },
            ]}
          >
            Choose Color
          </Text>

          <View style={styles.colorPalette}>

            {categoryColors.map((color) => {

              const isSelected =
                selectedColor === color;

              return (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderColor: isSelected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                  onPress={() =>
                    setSelectedColor(color)
                  }
                >

                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color={theme.text}
                    />
                  )}

                </Pressable>
              );
            })}

          </View>

        </View>

        {/* =================================
            SAVE CATEGORY
        ================================= */}

        <Pressable
          style={[
            styles.doneButton,
            {
              backgroundColor: theme.primary,
            },
          ]}
          onPress={handleDone}
        >
          <Text
            style={[
              styles.doneText,
              {
                color: theme.primaryText,
              },
            ]}
          >
            Save Category
          </Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

// =========================================
// STYLES
// =========================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // =======================================
  // HEADER
  // =======================================

  header: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  headerRight: {
    width: 40,
    height: 40,
  },

  // =======================================
  // TABS
  // =======================================

  tabContainer: {
    height: 36,
    borderWidth: 1,
    borderRadius: 9,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 18,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // =======================================
  // SECTIONS
  // =======================================

  section: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 7,
  },

  // =======================================
  // INPUT
  // =======================================

  inputContainer: {
    height: 36,
    borderWidth: 1,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
  },

  counter: {
    fontSize: 10,
    marginLeft: 5,
  },

  // =======================================
  // ICON GRID
  // =======================================

  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },

  iconButton: {
    width: '18.5%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // =======================================
  // COLOR
  // =======================================

  colorSection: {
    marginBottom: 20,
  },

  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  colorOption: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // =======================================
  // SAVE BUTTON
  // =======================================

  doneButton: {
    height: 38,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  doneText: {
    fontSize: 12,
    fontWeight: '700',
  },
});