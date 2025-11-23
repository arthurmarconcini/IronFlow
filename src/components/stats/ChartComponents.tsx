import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LineChart, PieChart } from 'react-native-chart-kit'
import Ionicons from '@expo/vector-icons/Ionicons'
import { theme } from '../../theme'
import { ChartData, MuscleGroupData } from '../../services/StatisticsService'

const screenWidth = Dimensions.get('window').width
const CHART_WIDTH =
  screenWidth - theme.spacing.medium * 2 - theme.spacing.medium * 2 // Screen padding - Card padding

interface VolumeChartProps {
  data: ChartData
  title: string
}

interface MuscleDistributionChartProps {
  data: MuscleGroupData[]
  title: string
}

const EmptyChartState = ({ message }: { message: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons
      name="bar-chart-outline"
      size={48}
      color={theme.colors.lightGray}
      style={{ marginBottom: theme.spacing.small }}
    />
    <Text style={styles.emptyText}>{message}</Text>
    <Text style={styles.emptySubtext}>
      Complete mais treinos para ver seus dados aqui.
    </Text>
  </View>
)

const baseChartConfig = {
  backgroundGradientFrom: theme.colors.white,
  backgroundGradientTo: theme.colors.white,
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`, // theme.colors.primary
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  labelColor: (_opacity = 1) => theme.colors.secondary,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: theme.colors.white,
  },
  fillShadowGradientFrom: theme.colors.primary,
  fillShadowGradientTo: theme.colors.white,
}

export const VolumeChart = ({ data, title }: VolumeChartProps) => {
  if (!data.labels.length || data.datasets[0].data.every((d) => d === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <EmptyChartState message="Ainda não há dados de volume" />
      </View>
    )
  }

  // Handle single data point to avoid chart crash or ugly render
  const chartData =
    data.labels.length === 1
      ? {
          labels: ['Início', ...data.labels, 'Agora'], // Add dummy labels for spacing
          datasets: [
            {
              data: [
                data.datasets[0].data[0],
                data.datasets[0].data[0],
                data.datasets[0].data[0],
              ], // Repeat data for flat line
            },
          ],
        }
      : data

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={CHART_WIDTH}
        height={220}
        chartConfig={baseChartConfig}
        bezier={data.labels.length > 1} // Only bezier if we have enough points
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        fromZero
        yAxisInterval={1}
      />
    </View>
  )
}

export const MuscleDistributionChart = ({
  data,
  title,
}: MuscleDistributionChartProps) => {
  if (!data.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <EmptyChartState message="Nenhuma distribuição muscular ainda" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <PieChart
        data={data}
        width={CHART_WIDTH}
        height={220}
        chartConfig={baseChartConfig}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'0'}
        center={[CHART_WIDTH / 4, 0]} // Center adjustment
        absolute
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 16, // More rounded like cards
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    paddingRight: 30, // Space for labels
  },
  emptyContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: theme.spacing.medium,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
    fontWeight: '500',
    marginTop: theme.spacing.small,
  },
  emptySubtext: {
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.small,
    textAlign: 'center',
    marginTop: 4,
  },
})
