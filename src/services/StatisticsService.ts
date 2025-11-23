import { DatabaseService } from '../db/DatabaseService'
import { subMonths, format, subWeeks, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type Period = 'week' | 'month' | '3months' | 'year'

export interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
  }[]
}

export interface MuscleGroupData {
  name: string
  population: number
  color: string
  legendFontColor: string
  legendFontSize: number
}

const COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#C9CBCF',
]

export const StatisticsService = {
  getVolumeChartData: async (
    userId: string,
    period: Period = 'month',
  ): Promise<ChartData> => {
    let startDate: Date
    let dateFormat: string

    const now = new Date()

    switch (period) {
      case 'week':
        startDate = subWeeks(now, 1)
        dateFormat = 'EEE'
        break
      case 'month':
        startDate = subMonths(now, 1)
        dateFormat = 'dd/MM'
        break
      case '3months':
        startDate = subMonths(now, 3)
        dateFormat = 'dd/MM'
        break
      case 'year':
        startDate = subMonths(now, 12)
        dateFormat = 'MMM'
        break
      default:
        startDate = subMonths(now, 1)
        dateFormat = 'dd/MM'
    }

    const rawData = await DatabaseService.getVolumeLoadStats(
      userId,
      startDate.getTime(),
    )

    const interval = eachDayOfInterval({ start: startDate, end: now })

    // Create a map for quick lookup
    const dataMap = new Map(rawData.map((item) => [item.date, item.volume]))

    const labels: string[] = []
    const data: number[] = []

    // Logic to group by week/month if period is long to avoid too many points
    if (period === 'year') {
      // Group by month
      // This is a simplification, for a real app we might want better grouping
      // For now, let's just show daily data but filter labels
    }

    interval.forEach((date, index) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const volume = dataMap.get(dateStr) || 0

      // For longer periods, we might want to aggregate or skip points
      // keeping it simple for now: daily points

      // Only add label for some points to avoid clutter
      let label = ''
      if (period === 'week') {
        label = format(date, dateFormat, { locale: ptBR })
      } else if (period === 'month') {
        if (index % 5 === 0) label = format(date, dateFormat, { locale: ptBR })
      } else {
        if (index % 10 === 0) label = format(date, dateFormat, { locale: ptBR })
      }

      labels.push(label)
      data.push(volume)
    })

    return {
      labels,
      datasets: [{ data }],
    }
  },

  getMuscleGroupData: async (userId: string): Promise<MuscleGroupData[]> => {
    const startDate = subMonths(new Date(), 3).getTime() // Last 3 months
    const rawData = await DatabaseService.getMuscleGroupFrequencyStats(
      userId,
      startDate,
    )

    return rawData.map((item, index) => ({
      name: item.muscle_group,
      population: item.count,
      color: COLORS[index % COLORS.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }))
  },

  getCoachInsights: async (userId: string): Promise<string[]> => {
    const insights: string[] = []
    const now = new Date()
    const lastMonth = subMonths(now, 1).getTime()

    // 1. Consistency Check
    const frequency = await DatabaseService.getWorkoutFrequencyStats(
      userId,
      lastMonth,
    )
    const totalWorkouts = frequency.reduce((acc, curr) => acc + curr.count, 0)

    if (totalWorkouts >= 12) {
      insights.push(
        '🔥 Você está pegando fogo! Manteve uma média de 3+ treinos por semana no último mês.',
      )
    } else if (totalWorkouts >= 8) {
      insights.push(
        '✅ Boa consistência! Continue assim para ver resultados sólidos.',
      )
    } else if (totalWorkouts > 0) {
      insights.push(
        '💡 Tente aumentar sua frequência para 3 vezes por semana para melhores resultados.',
      )
    } else {
      insights.push('👋 Vamos voltar aos treinos? Seu corpo agradece!')
    }

    // 2. Volume Check (Simple trend)
    const volume = await DatabaseService.getVolumeLoadStats(userId, lastMonth)
    if (volume.length > 1) {
      const firstHalf = volume.slice(0, Math.floor(volume.length / 2))
      const secondHalf = volume.slice(Math.floor(volume.length / 2))

      const avgFirst =
        firstHalf.reduce((a, b) => a + b.volume, 0) / (firstHalf.length || 1)
      const avgSecond =
        secondHalf.reduce((a, b) => a + b.volume, 0) / (secondHalf.length || 1)

      if (avgSecond > avgFirst * 1.1) {
        insights.push(
          '📈 Seu volume de treino está subindo. Ótima sobrecarga progressiva!',
        )
      }
    }

    // 3. Muscle Balance
    const muscles = await DatabaseService.getMuscleGroupFrequencyStats(
      userId,
      lastMonth,
    )
    const sortedMuscles = muscles.sort((a, b) => b.count - a.count)
    if (sortedMuscles.length > 0) {
      const top = sortedMuscles[0]
      const bottom = sortedMuscles[sortedMuscles.length - 1]

      if (top.count > bottom.count * 3) {
        insights.push(
          `⚖️ Atenção ao equilíbrio: Você treinou ${top.muscle_group} 3x mais que ${bottom.muscle_group}.`,
        )
      }
    }

    if (insights.length === 0) {
      insights.push(
        '🤖 Continue treinando para desbloquear mais insights do seu Coach Virtual!',
      )
    }

    return insights
  },
}
