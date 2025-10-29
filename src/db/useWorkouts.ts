import { useState, useCallback } from 'react'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { app } from '../config/firebaseConfig'
import { useAuth } from '../hooks/useAuth'
import { DatabaseService } from './DatabaseService'
import { Workout } from '../types/database'
import { Exercise } from '../state/workoutCreationStore'
import * as Crypto from 'expo-crypto'

const firestoreDb = getFirestore(app)

interface FirestoreWorkoutData {
  userId: string
  name: string
  muscleGroup: string
  exercises: Exercise[]
  createdAt: Date
}

export function useWorkouts() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchLocalWorkouts = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const localWorkouts = await DatabaseService.getWorkouts(user.uid)
      setWorkouts(localWorkouts)
    } catch (error) {
      console.error('Erro ao buscar treinos locais:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const createWorkout = async (
    name: string,
    muscleGroup: string,
    exercises: Exercise[],
  ) => {
    if (!user) throw new Error('Usuário não autenticado.')
    setIsLoading(true)
    try {
      const localId = Crypto.randomUUID()
      await DatabaseService.addWorkout(
        localId,
        user.uid,
        name,
        muscleGroup,
        exercises,
      )
      await fetchLocalWorkouts()
    } catch (error) {
      console.error('Erro ao criar treino local:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteWorkout = async (firestoreId: string) => {
    if (!user) throw new Error('Usuário não autenticado.')
    await DatabaseService.deleteWorkout(firestoreId)
    setWorkouts((prev) => prev.filter((w) => w.firestoreId !== firestoreId))
    try {
      await deleteDoc(doc(firestoreDb, 'workouts', firestoreId))
    } catch (error) {
      console.error('Erro ao deletar treino no Firestore:', error)
    }
  }

  const syncWorkouts = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const localWorkouts = await DatabaseService.getWorkouts(user.uid)
      const q = query(
        collection(firestoreDb, 'workouts'),
        where('userId', '==', user.uid),
      )
      const querySnapshot = await getDocs(q)

      // Corrigido: Aplicar o tipo aos dados do Firestore
      const firestoreWorkouts = querySnapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...(doc.data() as Omit<FirestoreWorkoutData, 'userId' | 'createdAt'>),
      }))

      const firestoreIds = new Set(firestoreWorkouts.map((w) => w.firestoreId))
      const workoutsToUpload = localWorkouts.filter(
        (w) => !firestoreIds.has(w.firestoreId),
      )

      if (workoutsToUpload.length > 0) {
        const batch = writeBatch(firestoreDb)
        workoutsToUpload.forEach((workout) => {
          const docRef = doc(firestoreDb, 'workouts', workout.firestoreId)
          const workoutData: FirestoreWorkoutData = {
            userId: user.uid,
            name: workout.name,
            muscleGroup: workout.muscleGroup,
            exercises: workout.exercises,
            createdAt: new Date(),
          }
          batch.set(docRef, workoutData)
        })
        await batch.commit()
      }

      const localIds = new Set(localWorkouts.map((w) => w.firestoreId))
      const workoutsToDownload = firestoreWorkouts.filter(
        (w) => !localIds.has(w.firestoreId),
      )

      if (workoutsToDownload.length > 0) {
        for (const fw of workoutsToDownload) {
          await DatabaseService.addWorkout(
            fw.firestoreId,
            user.uid,
            fw.name,
            fw.muscleGroup || '',
            fw.exercises,
          )
        }
      }

      if (workoutsToUpload.length > 0 || workoutsToDownload.length > 0) {
        await fetchLocalWorkouts()
      }
    } catch (error) {
      console.error('Erro ao sincronizar treinos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, fetchLocalWorkouts])

  const getWorkoutById = useCallback(async (firestoreId: string) => {
    setIsLoading(true)
    try {
      const workout = await DatabaseService.getWorkoutById(firestoreId)
      return workout
    } catch (error) {
      console.error('Erro ao buscar treino por ID:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    workouts,
    isLoading,
    createWorkout,
    deleteWorkout,
    syncWorkouts,
    fetchLocalWorkouts,
    getWorkoutById,
  }
}
