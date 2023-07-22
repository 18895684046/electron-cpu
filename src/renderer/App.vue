<script setup lang="ts">
import { nextTick, ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue'
import { useIpcRenderer } from '@vueuse/electron'
const { ipcRenderer } = require('electron')
const echarts = require('echarts');
import { osUtils } from './utils'

const chartData = ref<any>([])
let chart: any = null
nextTick(() => {
  chart = echarts.init(document.getElementById('chartContainer'));
})

const updateChart = () => {
  const options = {
    title:{
      text: 'CPU使用率',
      left: 'center',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.value.map((cpu: { name: any; }) => cpu.name),
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: chartData.value.map((cpu: { value: any; }) => cpu.value),
      type: 'line',
      label: {
        show: true,
        position: 'top',
      },
      // areaStyle: {}
    }],
    tooltip: {
      trigger: 'axis',
    },
  };
  chart.setOption(options);
}

const tmpArr: any[] = []
const deviceInfo = ref<string>('')

ipcRenderer.on('ping', async (event, cpuInfo) => {
  console.log('接收主线程传递的数据--', cpuInfo)
  deviceInfo.value = cpuInfo[0].model

  const cpuUsage = await osUtils.getCPUUsage({ percentage: true });
  tmpArr.push(cpuUsage)

  if (tmpArr.length > 10) {
    tmpArr.shift()
  }

  chartData.value = tmpArr.map(p => {
    return {
      name: p,
      value: Number(p.replace('%', ''))
    }
  })
  updateChart()
})

ipcRenderer.send('message', '联通两个线程')

</script>

<template>
  <div>
    <h2>{{ deviceInfo }}</h2>
    <div id="chartContainer" style="width: 700px;height: 400px;"></div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite11 + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
