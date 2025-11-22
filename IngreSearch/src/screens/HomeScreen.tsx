import React, { useMemo } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootStackParamList } from '../navigation/RootNavigator';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import SectionTitle from '../components/SectionTitle';
import { colors } from '../theme/colors';
import { filterRecipes } from '../utils/filterRecipes';
import { RECIPES } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';
import { setIngredients, setResults } from '../store/slices/searchSlice';
import type { RootState, AppDispatch } from '../store';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Tabs'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const mode = useSelector((state: RootState) => state.ui.mode);
  const ingredients = useSelector((state: RootState) => state.search.ingredients);
  

  const themeColor = useMemo(
    () => (mode === 'ahorro' ? colors.savingsPrimary : colors.primary),
    [mode]
  );

  const handleSearch = () => {
    const list = filterRecipes(RECIPES, ingredients, mode);
    dispatch(setResults(list.map(r => r.id)));
  };

  return (
    <View style={[styles.container, { backgroundColor: mode === 'ahorro' ? colors.savingsBg : colors.bg }]}>
      <SectionTitle
        text={mode === 'ahorro' ? 'Busca recetas económicas' : 'Busca recetas por ingredientes'}
        color={themeColor}
      />
      <Image source={require('../assets/images/dish.png')} style={styles.image} />
      <CustomInput
        label="Ingredientes"
        placeholder="Ej: tomate, arroz, huevo"
        value={ingredients}
        onChangeText={(text) => dispatch(setIngredients(text))}
        required
      />
      <CustomButton
        text="Buscar recetas"
        onPress={handleSearch}
        variant={mode === 'ahorro' ? 'savings' : 'primary'}
      />
      <View style={styles.list}>
        {filterRecipes(RECIPES, ingredients, mode).map(recipe => (
          <RecipeCard
            key={recipe.id}
            title={recipe.title}
            priceTag={recipe.priceTag}
            onPress={() => navigation.navigate('RecipeDetail', { id: recipe.id })}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'flex-start', alignItems: 'stretch' },
  image: { width: 120, height: 120, alignSelf: 'center', marginBottom: 16 },
  list: { flex: 1, marginTop: 8 },
});