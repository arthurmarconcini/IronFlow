import { useState, useCallback } from 'react'
import {
  getFirestore, // Importa a função de inicialização
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { app } from '../config/firebaseConfig' // Importa o 'app' em vez de 'db'
import { useAuth } from '../hooks/useAuth'
import { useDatabase, Workout, Exercise } from './useDatabase'

// Inicializa o Firestore aqui, garantindo que a instância seja válida
const firestoreDb = getFirestore(app)

// Interface para o documento do Firestore
interface FirestoreWorkout {
  userId: string
  name: string
  muscleGroup: string // Novo campo
  exercises: Exercise[]
  createdAt: Timestamp
}

export function useWorkouts() {
  const { user } = useAuth()
  const {
    addWorkout: addWorkoutLocal,
    getWorkouts: getWorkoutsLocal,
    deleteWorkoutLocal,
    db: localDb,
  } = useDatabase()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLocalWorkouts = useCallback(async () => {
    if (!localDb) return
    setIsLoading(true) // Inicia o carregamento
    try {
      const localWorkouts = await getWorkoutsLocal()
      setWorkouts(localWorkouts)
    } catch (error) {
      console.error('Erro ao buscar treinos locais:', error)
    } finally {
      setIsLoading(false) // Finaliza o carregamento
    }
  }, [localDb, getWorkoutsLocal])

  // O useEffect que existia aqui foi removido para dar controle total às telas.

  const createWorkout = async (
    name: string,
    muscleGroup: string,
    exercises: Exercise[],
  ) => {
    if (!user || !localDb) {
      throw new Error(
        'Usuário não autenticado ou banco de dados não disponível.',
      )
    }

    // 1. Cria o documento no Firestore para obter o ID
    const docRef = await addDoc(collection(firestoreDb, 'workouts'), {
      userId: user.uid,
      name,
      muscleGroup,
      exercises,
      createdAt: new Date(),
    })

    // 2. Salva no banco de dados local usando o ID do Firestore
    await addWorkoutLocal(docRef.id, name, muscleGroup, exercises)

    // 3. Atualiza o estado local para refletir a mudança imediatamente
    await fetchLocalWorkouts()
  }

  const deleteWorkout = async (firestoreId: string) => {
    if (!user || !localDb) {
      throw new Error(
        'Usuário não autenticado ou banco de dados não disponível.',
      )
    }

    // 1. Remove do banco de dados local para uma UI rápida
    await deleteWorkoutLocal(firestoreId)

    // 2. Atualiza o estado local imediatamente
    setWorkouts((prev) => prev.filter((w) => w.firestoreId !== firestoreId))

    // 3. Remove do Firestore
    try {
      await deleteDoc(doc(firestoreDb, 'workouts', firestoreId))
    } catch (error) {
      console.error('Erro ao deletar treino no Firestore:', error)
      // Opcional: Adicionar lógica para tentar novamente mais tarde
    }
  }

  const syncWorkouts = useCallback(async () => {
    if (!user || !localDb) return

    setIsLoading(true)
    try {
      // Busca treinos no Firestore
      const q = query(
        collection(firestoreDb, 'workouts'),
        where('userId', '==', user.uid),
      )
      const querySnapshot = await getDocs(q)

      const firestoreWorkouts = querySnapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...(doc.data() as Omit<FirestoreWorkout, 'userId'>),
      }))

      const localWorkouts = await getWorkoutsLocal()
      const localFirestoreIds = new Set(localWorkouts.map((w) => w.firestoreId))

      // Adiciona treinos da nuvem que não existem localmente
      for (const fw of firestoreWorkouts) {
        if (!localFirestoreIds.has(fw.firestoreId)) {
          await addWorkoutLocal(
            fw.firestoreId,
            fw.name,
            fw.muscleGroup,
            fw.exercises,
          )
        }
      }

      // Recarrega os treinos do banco local após a sincronização
      await fetchLocalWorkouts()
    } catch (error) {
      console.error('Erro ao sincronizar treinos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, localDb, getWorkoutsLocal, addWorkoutLocal, fetchLocalWorkouts])

  return {
    workouts,
    isLoading,
    createWorkout,
    deleteWorkout,
    syncWorkouts,
    fetchLocalWorkouts, // Expondo a função
  }
}
