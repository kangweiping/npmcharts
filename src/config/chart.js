export default {
  tooltip: {
    show: true,
    trigger: 'axis',
    showContent: false
  },
  grid: {
    top: 40,
    left: 10,
    right: 10,
    bottom: 40,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  dataZoom: [{
    startValue: ''
  }, {
    type: 'inside'
  }],
  series: []
}
