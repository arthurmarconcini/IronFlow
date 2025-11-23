import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LineChart, PieChart } from 'react-native-chart-kit'
import { theme } from '../../theme'
import { ChartData, MuscleGroupData } from '../../services/StatisticsService'

const screenWidth = Dimensions.get('window').width

interface VolumeChartProps {
  data: ChartData
  title: string
}

interface MuscleDistributionChartProps {
  data: MuscleGroupData[]
  title: string
}

const chartConfig = {
  backgroundGradientFrom: theme.colors.white,
  backgroundGradientTo: theme.colors.white,
  color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`, // Primary color
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: theme.colors.primary,
  },
}

export const VolumeChart = ({ data, title }: VolumeChartProps) => {
  if (!data.labels.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sem dados suficientes</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={data}
        width={screenWidth - theme.spacing.medium * 2}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sem dados suficientes</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <PieChart
        data={data}
        width={screenWidth - theme.spacing.medium * 2}
        height={220}
        chartConfig={chartConfig}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        absolute
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.medium,
  },
})
