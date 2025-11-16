import { useState, useCallback, useEffect } from 'react'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore'
import { app } from '../config/firebaseConfig'
import { useAuth } from '../hooks/useAuth'
import { DatabaseService } from './DatabaseService'
import { Workout, Exercise } from '../types/database'
import * as Crypto from 'expo-crypto'

const firestoreDb = getFirestore(app)

interface FirestoreWorkoutData {
  userId: string
  name: string
  muscleGroup: string
  exercises: Exercise[]
  lastModified: Timestamp
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

  // Busca os treinos automaticamente quando o hook é usado pela primeira vez
  useEffect(() => {
    fetchLocalWorkouts()
  }, [fetchLocalWorkouts])

  const createWorkout = async (
    name: string,
    muscleGroup: string,
    exercises: Exercise[],
  ) => {
    if (!user) throw new Error('Usuário não autenticado.')
    setIsLoading(true)
    try {
      const localId = Crypto.randomUUID()
      const now = Date.now()
      await DatabaseService.addWorkout(
        localId,
        user.uid,
        name,
        muscleGroup,
        exercises,
        now,
      )
      await fetchLocalWorkouts()
    } catch (error) {
      console.error('Erro ao criar treino local:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateWorkout = async (
    firestoreId: string,
    name: string,
    muscleGroup: string,
    exercises: Exercise[],
    lastModified: number,
  ) => {
    if (!user) throw new Error('Usuário não autenticado.')
    setIsLoading(true)
    try {
      await DatabaseService.updateWorkout(
        firestoreId,
        name,
        muscleGroup,
        exercises,
        lastModified,
      )
      await fetchLocalWorkouts() // Recarrega para refletir a atualização
    } catch (error) {
      console.error('Erro ao atualizar treino local:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteWorkout = async (firestoreId: string) => {
    if (!user) throw new Error('Usuário não autenticado.')
    await DatabaseService.deleteWorkout(firestoreId)
    setWorkouts((prev) => prev.filter((w) => w.firestoreId !== firestoreId))
    // A deleção no Firestore agora é tratada pelo syncWorkouts
  }

  const syncWorkouts = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    let needsRefresh = false
    try {
      // 1. Get local (including deleted) and remote data
      const localWorkouts = await DatabaseService.getAllWorkoutsForSync(
        user.uid,
      )
      const q = query(
        collection(firestoreDb, 'workouts'),
        where('userId', '==', user.uid),
      )
      const querySnapshot = await getDocs(q)
      const remoteWorkouts = querySnapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...(doc.data() as FirestoreWorkoutData),
      }))

      // 2. Create maps for efficient lookup
      const localWorkoutMap = new Map(
        localWorkouts.map((w) => [w.firestoreId, w]),
      )
      const remoteWorkoutMap = new Map(
        remoteWorkouts.map((w) => [w.firestoreId, w]),
      )
      const allIds = new Set([
        ...localWorkoutMap.keys(),
        ...remoteWorkoutMap.keys(),
      ])

      const batch = writeBatch(firestoreDb)

      // 3. Compare and decide sync direction
      for (const id of allIds) {
        const local = localWorkoutMap.get(id)
        const remote = remoteWorkoutMap.get(id)

        if (local && local.deletedAt) {
          // Local is soft-deleted, delete remote
          if (remote) {
            const docRef = doc(firestoreDb, 'workouts', id)
            batch.delete(docRef)
          }
          continue // No further action needed
        }

        if (local && !remote) {
          // Upload new local workout
          const docRef = doc(firestoreDb, 'workouts', id)
          batch.set(docRef, {
            userId: user.uid,
            name: local.name,
            muscleGroup: local.muscleGroup,
            exercises: local.exercises,
            lastModified: Timestamp.fromMillis(local.lastModified),
          })
        } else if (!local && remote) {
          // Download new remote workout
          const remoteMillis = remote.lastModified?.toMillis() ?? Date.now()
          await DatabaseService.addWorkout(
            remote.firestoreId,
            user.uid,
            remote.name,
            remote.muscleGroup,
            remote.exercises,
            remoteMillis,
          )
          needsRefresh = true
        } else if (local && remote) {
          // Conflict resolution: compare timestamps
          const remoteMillis = remote.lastModified?.toMillis() ?? Date.now()
          if (local.lastModified > remoteMillis) {
            // Local is newer, upload changes
            const docRef = doc(firestoreDb, 'workouts', id)
            batch.update(docRef, {
              name: local.name,
              muscleGroup: local.muscleGroup,
              exercises: local.exercises,
              lastModified: Timestamp.fromMillis(local.lastModified),
            })
          } else if (remoteMillis > local.lastModified) {
            // Remote is newer, update local
            await DatabaseService.updateWorkout(
              id,
              remote.name,
              remote.muscleGroup,
              remote.exercises,
              remoteMillis,
            )
            needsRefresh = true
          }
        }
      }

      await batch.commit()
    } catch (error) {
      console.error('Erro ao sincronizar treinos:', error)
    } finally {
      if (needsRefresh) {
        await fetchLocalWorkouts()
      }
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

  const finishWorkout = useCallback(
    async (logId: number, workoutFirestoreId: string) => {
      if (!user) throw new Error('Usuário não autenticado.')
      try {
        // 1. Finaliza o log do treino
        await DatabaseService.finishWorkoutLog(logId)

        // 2. Atualiza o status na agenda (se já existia um agendamento)
        const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        await DatabaseService.updateScheduleStatus(
          user.uid,
          workoutFirestoreId,
          todayStr,
          'completed',
          logId,
        )

        // 3. Agenda o próximo treino da sequência para amanhã
        try {
          const allUserWorkouts = await DatabaseService.getWorkouts(user.uid)
          if (allUserWorkouts.length > 1) {
            const currentIndex = allUserWorkouts.findIndex(
              (w) => w.firestoreId === workoutFirestoreId,
            )
            if (currentIndex !== -1) {
              const nextIndex = (currentIndex + 1) % allUserWorkouts.length
              const nextWorkout = allUserWorkouts[nextIndex]

              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              const tomorrowStr = tomorrow.toISOString().split('T')[0]

              // Evita agendar duplicado (opcional, mas bom para robustez)
              const tomorrowSchedule = await DatabaseService.getScheduleForDate(
                user.uid,
                tomorrowStr,
              )
              const isAlreadyScheduled = tomorrowSchedule.some(
                (w) => w.firestoreId === nextWorkout.firestoreId,
              )

              if (!isAlreadyScheduled) {
                await DatabaseService.scheduleWorkout(
                  user.uid,
                  nextWorkout.firestoreId,
                  tomorrowStr,
                )
              }
            }
          }
        } catch (scheduleError) {
          console.error('Erro ao agendar o próximo treino:', scheduleError)
        }
      } catch (error) {
        console.error('Erro ao finalizar o treino e atualizar a agenda:', error)
      }
    },
    [user],
  )

  return {
    workouts,
    isLoading,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    syncWorkouts,
    fetchLocalWorkouts,
    getWorkoutById,
    finishWorkout,
  }
}
