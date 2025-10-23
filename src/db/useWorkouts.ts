import { useState, useCallback } from 'react'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { app } from '../config/firebaseConfig'
import { useAuth } from '../hooks/useAuth'
import { useDatabase, Workout, Exercise } from './useDatabase'
import * as Crypto from 'expo-crypto'

const firestoreDb = getFirestore(app)

interface FirestoreWorkout {
  userId: string
  name: string
  muscleGroup: string
  exercises: Exercise[]
  createdAt: Timestamp
}

export function useWorkouts() {
  const { user } = useAuth()
  const {
    addWorkout: addWorkoutLocal,
    getWorkouts: getWorkoutsLocal,
    deleteWorkoutLocal,
    isDbLoading,
  } = useDatabase()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchLocalWorkouts = useCallback(async () => {
    if (isDbLoading || !user) return

    setIsLoading(true)
    try {
      const localWorkouts = await getWorkoutsLocal(user.uid)
      setWorkouts(localWorkouts)
    } catch (error) {
      console.error('Erro ao buscar treinos locais:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isDbLoading, user, getWorkoutsLocal])

  const createWorkout = async (
    name: string,
    muscleGroup: string,
    exercises: Exercise[],
  ) => {
    if (!user) {
      throw new Error('Usuário não autenticado.')
    }
    setIsLoading(true)
    try {
      // 1. Gera um ID único localmente (UUID)
      const localId = Crypto.randomUUID()

      // 2. Salva APENAS no banco de dados local
      await addWorkoutLocal(localId, user.uid, name, muscleGroup, exercises)

      // 3. Atualiza o estado da UI imediatamente
      await fetchLocalWorkouts()
    } catch (error) {
      console.error('Erro ao criar treino local:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteWorkout = async (firestoreId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado.')
    }

    await deleteWorkoutLocal(firestoreId)
    setWorkouts((prev) => prev.filter((w) => w.firestoreId !== firestoreId))

    try {
      await deleteDoc(doc(firestoreDb, 'workouts', firestoreId))
    } catch (error) {
      console.error('Erro ao deletar treino no Firestore:', error)
      // TODO: Adicionar lógica para "fila de exclusão" offline
    }
  }

  const syncWorkouts = useCallback(async () => {
    if (isDbLoading || !user) return

    setIsLoading(true)
    try {
      // --- 1. Obter dados da nuvem e locais (lendo a fonte da verdade) ---
      const localWorkouts = await getWorkoutsLocal(user.uid)

      const q = query(
        collection(firestoreDb, 'workouts'),
        where('userId', '==', user.uid),
      )
      const querySnapshot = await getDocs(q)
      const firestoreWorkouts = querySnapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...(doc.data() as Omit<FirestoreWorkout, 'userId'>),
      }))

      const firestoreIds = new Set(firestoreWorkouts.map((w) => w.firestoreId))

      // --- 2. Fazer UPLOAD (Local -> Nuvem) ---
      const workoutsToUpload = localWorkouts.filter(
        (w) => !firestoreIds.has(w.firestoreId),
      )

      if (workoutsToUpload.length > 0) {
        const batch = writeBatch(firestoreDb)
        workoutsToUpload.forEach((workout) => {
          const docRef = doc(firestoreDb, 'workouts', workout.firestoreId)
          batch.set(docRef, {
            userId: user.uid,
            name: workout.name,
            muscleGroup: workout.muscleGroup,
            exercises: workout.exercises,
            createdAt: new Date(),
          })
        })
        await batch.commit()
      }

      // --- 3. Fazer DOWNLOAD (Nuvem -> Local) ---
      const localIds = new Set(localWorkouts.map((w) => w.firestoreId))
      const workoutsToDownload = firestoreWorkouts.filter(
        (w) => !localIds.has(w.firestoreId),
      )
      if (workoutsToDownload.length > 0) {
        for (const fw of workoutsToDownload) {
          await addWorkoutLocal(
            fw.firestoreId,
            user.uid,
            fw.name,
            fw.muscleGroup || '',
            fw.exercises,
          )
        }
      }

      // --- 4. Atualizar a UI com o estado final ---
      // Apenas recarrega se houveram mudanças
      if (workoutsToUpload.length > 0 || workoutsToDownload.length > 0) {
        await fetchLocalWorkouts()
      }
    } catch (error) {
      console.error('Erro ao sincronizar treinos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isDbLoading, user, getWorkoutsLocal, addWorkoutLocal, fetchLocalWorkouts])

  return {
    workouts,
    isLoading,
    createWorkout,
    deleteWorkout,
    syncWorkouts,
    fetchLocalWorkouts,
  }
}
