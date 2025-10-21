import React, { useCallback, useState } from 'react'
import { View, Text, Button, FlatList, StyleSheet } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useDatabase, Workout } from '../../db/useDatabase'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { AppStackParamList } from '../../navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'

type ProfileScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  'Profile'
>

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const { getWorkouts } = useDatabase()
  const navigation = useNavigation<ProfileScreenNavigationProp>()
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const data = await getWorkouts()
        setWorkouts(data)
      }

      fetchData()
    }, [getWorkouts]),
  )

  const renderItem = ({ item }: { item: Workout }) => (
    <View style={styles.workoutItem}>
      <Text style={styles.workoutName}>{item.name}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Button title="Logout" onPress={logout} />

      <View style={styles.separator} />

      <Button
        title="Criar Novo Treino"
        onPress={() => navigation.navigate('CreateWorkout')}
      />

      <Text style={styles.workoutsTitle}>Meus Treinos</Text>
      <FlatList
        data={workouts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  email: {
    fontSize: 16,
    marginBottom: 16,
  },
  separator: {
    marginVertical: 16,
    height: 1,
    width: '100%',
    backgroundColor: '#ccc',
  },
  workoutsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  workoutItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
})
