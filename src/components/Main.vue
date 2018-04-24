<template>
<main class="page-body">
  <ul class="sample-package">
    <li v-for="(packageName, i) in samplePackages" :key="i" @click="setPackages(packageName)">{{ packageName }}</li>
  </ul>
  <div class="package-legend" v-if="legendData">
    <div>{{ `${legendData.time} ${legendData.week}` }}</div>
    <ul>
      <li class="package-legend-item"
          v-for="(packageInfo, i) in legendData.packageList"
          :key="i"
          :style="`color:${packageInfo.color};`"
          @mouseover="onLegendPackageMouseover(i)"
          @mouseout="onLegendPackageMouseout(i)"
          @click="setPackages(packageInfo.name)">
        <span class="package-legend-name">{{ packageInfo.name }}</span>
        <div class="package-legend-value-wrapper">
          <span class="package-legend-value">{{ packageInfo.value }}</span>
          <span class="package-legend-control" @click.stop="deletePackage(packageInfo.name)">x</span>
        </div>
      </li>
    </ul>
  </div>
  <div class="chart-box" ref="chart"></div>
</main>
</template>
<script>
import { message } from 'element-ui'
import echarts from 'echarts/dist/echarts.common'
import { format } from 'date-fns'
import formatDate, { getLastMonthWeekday } from '@/utils/formatDate'
import chartOption from '../config/chart'
import samplePackages, { defaultPackages } from '../config/samplePackages'
import queryData from '../services'
import store from '../store'

const WEEK_LENGTH = 7

export default {
  data () {
    return {
      legendData: null
    }
  },
  methods: {
    onLegendPackageMouseover (i) {
      this.chart.dispatchAction({
        type: 'highlight',
        seriesIndex: i
      })
    },
    onLegendPackageMouseout (i) {
      this.chart.dispatchAction({
        type: 'downplay',
        seriesIndex: i
      })
    },
    setPackages (packageName) {
      // store.currentPackages = packageName
      this.$router.push(`/compare/${packageName}`)
    },
    deletePackage (packageName) {
      const packagePattern = new RegExp(`(${packageName},|,${packageName}|${packageName})`, 'g')
      // store.currentPackages = this.currentPackages.replace(packagePattern, '')
      this.$router.push(`/compare/${this.currentPackages.replace(packagePattern, '')}`)
    },
    reisze () {
      this.chart.resize()
    },
    initChart () {
      const chart = echarts.init(this.$refs.chart)
      window.addEventListener('resize', this.reisze)
      chart.on('showTip', params => {
        this.applyLegendData(params.dataIndex)
      })
      chart.on('hideTip', () => {
        this.applyLegendData()
      })
      this.chart = chart
      this.applyData()
    },
    applyLegendData (index) {
      if (!index) {
        index = chartOption.xAxis.data.length - 1
      }
      if (this.lastTooltipDataIndex === index) {
        return
      }
      const legendDate = chartOption.xAxis.data[index]
      this.lastTooltipDataIndex = index
      this.legendData = {
        time: legendDate,
        week: format(new Date(legendDate), 'dddd'),
        packageList: chartOption.series.map((seire, i) => ({
          name: seire.name,
          value: seire.data[index],
          color: this.colorList[i]
        }))
      }
    },
    applyChartData () {
      const data = this.chartData
      for (let packageName of Object.keys(data)) {
        const packageData = data[packageName]
        if (packageData) {
          chartOption.xAxis.data = this.filterData(packageData.downloads).map(item => item.day)
          break
        }
      }
      const series = chartOption.series = []
      Object.keys(data).forEach(packageName => {
        const packageData = data[packageName]
        if (packageData) {
          series.push({
            name: packageName,
            type: 'line',
            data: this.filterData(packageData.downloads).map(item => item.downloads)
          })
        }
      })
      this.setDataZoomStartValue()
      this.chart.setOption(chartOption, true /* notMerge */)
      this.colorList = this.chart.getOption().color
    },
    setDataZoomStartValue () {
      if (this.dataZoomUpdated) {
        return
      }
      this.dataZoomUpdated = true
      let dataZoomStartValue
      if (!this.$store.includeWeekends) {
        dataZoomStartValue = getLastMonthWeekday()
      } else {
        dataZoomStartValue = formatDate('last-month')
      }
      chartOption.dataZoom[0].startValue = dataZoomStartValue
    },
    filterData (data) {
      if (!this.$store.includeWeekends) {
        // 索引 1~7 去掉星期六，星期天
        const firstDayWeekIndex = Number(format(new Date(data[0].day), 'd')) || WEEK_LENGTH
        let saturdayIndex = WEEK_LENGTH - firstDayWeekIndex - 1
        if (saturdayIndex < 0) {
          saturdayIndex += WEEK_LENGTH
        }
        let sundayIndex = WEEK_LENGTH - firstDayWeekIndex
        if (sundayIndex < 0) {
          sundayIndex += WEEK_LENGTH
        }
        data = data.filter((item, i) => {
          return (i % WEEK_LENGTH) !== saturdayIndex && (i % WEEK_LENGTH) !== sundayIndex
        })
        return data
      }
      return data
    },
    applyData (cb) {
      this.chart.showLoading()
      queryData(this.currentPackages)
        .then(data => {
          this.chart.hideLoading()
          this.normalizeData(data)
          this._applyData()
          cb && cb()
        })
        .catch(e => {
          this.chart.hideLoading()
          message.error('查询数据失败')
          console.error('查询数据失败', e)
        })
    },
    _applyData () {
      this.applyChartData()
      this.lastTooltipDataIndex = null
      this.applyLegendData()
    },
    normalizeData (data) {
      if (this.onlyOnePackage(this.currentPackages)) {
        this.chartData = {
          [this.currentPackages]: data
        }
      } else {
        this.chartData = data
      }
    },
    onlyOnePackage (currentPackages) {
      return (currentPackages || this.$route.params.packageNames).indexOf(',') === -1
    }
  },
  watch: {
    '$route.path' (next) {
      this.currentPackages = this.$route.params.packageNames || defaultPackages
      this.applyData()
    },
    '$store.includeWeekends' () {
      this.dataZoomUpdated = false
      this._applyData()
    }
  },
  beforeCreate () {
    this.chart = null
    this.colorList = []
    this.samplePackages = samplePackages
    this.$store = store
    this.currentPackages = this.$route.params.packageNames || defaultPackages
  },
  mounted () {
    this.initChart()
  },
  destroyed () {
    window.removeEventListener('resize', this.reisze)
    this.chart.dispose()
    this.chart = null
  }
}
</script>
<style lang="less">
.page-body {
  position: relative;
  border-top: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;

  .sample-package {
    display: flex;
    flex-wrap: wrap;

    li {
      margin: 1px 10px;
      color: #9fb2c2;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        text-shadow: 1px 1px 3px #D9E7EF;
      }
    }
  }

  .package-legend {
    position: absolute;
    top: 40px;
    left: 100px;
    z-index: 2;
    font-size: 15px;

    .package-legend-item {
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      margin: 4px 0;

      .package-legend-name {
        margin-right: 10px;
      }

      .package-legend-value {
        margin-right: 6px;
      }

      .package-legend-control {
        opacity: 0;
      }

      &:hover .package-legend-control {
        opacity: 1;
      }
    }
  }

  .chart-box {
    width: 100%;
    height: calc(~"100vh - 175px");
  }
}
</style>
