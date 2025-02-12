<!--
 * @Description: 历史曲线
 * @Author: ldx
 * @Date: 2025-01-09 09:40:04
 * @LastEditors: leidao 18015816566@163.com
 * @LastEditTime: 2025-01-14 18:12:05
-->
<template>
  <el-dialog v-model="open" width="1200" :footer="null" align-center>
    <template #header>
      <div class="flex items-center">
        <el-image class="w-22px h-20px mr-10px" :src="h_icon" fit="cover" />
        <div class="text-#3D3D3D text-20px font-500 ml-8px">xX用户分布式光伏运行信息</div>
      </div>
    </template>
    <div v-loading="loading">
      <div class="bg-#F1F1F1 px-10px">
        <el-form ref="ruleFormRef" :inline="true" :model="formInline" class="demo-form-inline" label-suffix=":">
          <el-row class="pt-16px">
            <el-col :span="6">
              <el-form-item label="户名" prop="trName">
                <span>张三</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="户号" prop="trName">
                <span>{{ userInfo.account }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="装机容量" prop="trName">
                <span>{{ userInfo.capacity }}MW</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="地市公司" prop="trName">
                <span>{{ userInfo.power }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-form-item label="县公司" prop="trName">
                <span>{{ userInfo.name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="供电网格" prop="trName">
                <span>郑州市中牟市XX供电网格</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="线路名称" prop="trName">
                <span>10KV中牟113线</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="城乡类别" prop="trName">
                <span>农村</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="flex justify-end mt-10px">
        <el-select v-model="value" placeholder="请选择" style="width: 240px" @change="getChartOptions">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="h-320px mt-26px">
        <Chart height="100%" :options="chartOptions" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, defineModel, defineProps } from 'vue'
import h_icon from '@/assets/home/h_icon.png'
import Chart from '@/components/chart/chart.vue'
import { createOption } from '@/components/chart/index.ts'
// import dayjs from 'dayjs'

const open = defineModel()
const loading = ref(false)
const formInline = reactive({})
const props = defineProps({
  userInfo: Object
})
const value = ref('实测功率')
const options = [
  {
    value: '实测功率',
    label: '实测功率'
  },
  {
    value: '功率预测·实时估算',
    label: '功率预测·实时估算'
  },
  {
    value: '功率预测·超短期',
    label: '功率预测·超短期'
  },
  {
    value: '功率预测·短期',
    label: '功率预测·短期'
  },
  {
    value: '功率预测·中期',
    label: '功率预测·中期'
  },
]
const getData = () => {
  return Array.from({ length: 96 }, (_, i) => {
    // 将索引转换为小时 (0-23)和15分钟间隔 (0-3)
    const hour = Math.floor(i / 4);

    // 光伏发电曲线模拟:
    // 6点开始发电,18点结束发电
    // 12点左右达到峰值
    if (hour < 6 || hour >= 18) {
      return 0;
    } else {
      // 使用正弦函数创建平滑的曲线
      const normalizedHour = (hour - 6) / 12; // 归一化到0-1
      const base = Math.sin(normalizedHour * Math.PI);
      // 添加一些随机波动
      const randomFactor = 0.9 + Math.random() * 0.2;
      return Math.floor(base * 80 * randomFactor);
    }
  })
}
const chartOptions = reactive(createOption({
  legend: {
    show: true,
    left: 'right',
    textStyle: {
      color: '#909399',
      fontSize: 12
    }
  },
  grid: {
    top: 50,
    left: 30,
    right: 20
  },
  xAxis: {
    data: [
      "00:00",
      "00:15",
      "00:30",
      "00:45",
      "01:00",
      "01:15",
      "01:30",
      "01:45",
      "02:00",
      "02:15",
      "02:30",
      "02:45",
      "03:00",
      "03:15",
      "03:30",
      "03:45",
      "04:00",
      "04:15",
      "04:30",
      "04:45",
      "05:00",
      "05:15",
      "05:30",
      "05:45",
      "06:00",
      "06:15",
      "06:30",
      "06:45",
      "07:00",
      "07:15",
      "07:30",
      "07:45",
      "08:00",
      "08:15",
      "08:30",
      "08:45",
      "09:00",
      "09:15",
      "09:30",
      "09:45",
      "10:00",
      "10:15",
      "10:30",
      "10:45",
      "11:00",
      "11:15",
      "11:30",
      "11:45",
      "12:00",
      "12:15",
      "12:30",
      "12:45",
      "13:00",
      "13:15",
      "13:30",
      "13:45",
      "14:00",
      "14:15",
      "14:30",
      "14:45",
      "15:00",
      "15:15",
      "15:30",
      "15:45",
      "16:00",
      "16:15",
      "16:30",
      "16:45",
      "17:00",
      "17:15",
      "17:30",
      "17:45",
      "18:00",
      "18:15",
      "18:30",
      "18:45",
      "19:00",
      "19:15",
      "19:30",
      "19:45",
      "20:00",
      "20:15",
      "20:30",
      "20:45",
      "21:00",
      "21:15",
      "21:30",
      "21:45",
      "22:00",
      "22:15",
      "22:30",
      "22:45",
      "23:00",
      "23:15",
      "23:30",
      "23:45",
    ],
    axisLabel: {
      interval: 4, // 每隔3个标签显示一个
      margin: 5   // 增加标签与轴线的距离
    }
  },
  yAxis: {
    name: 'kW',
  },
  series: [
    {
      name: "今日出力",
      data: getData(),
      type: "line",
      smooth: true,
    },
    {
      name: "昨日出力",
      data: getData(),
      type: "line",
      smooth: true,
    }
  ]
}))

const getChartOptions = () => {
  if (value.value === '实测功率') {
    chartOptions.series[0].name = '今日出力'
    chartOptions.series[0].data = getData()
    chartOptions.series[1] = {
      name: "昨日出力",
      data: getData(),
      type: "line",
      smooth: true,
    }
  } else {
    chartOptions.series[0].name = value.value
    chartOptions.series[0].data = getData()
    delete chartOptions.series[1]
  }
}


// watch(open, (value) => {
//   open.value && getTrRateHis()
// })


</script>