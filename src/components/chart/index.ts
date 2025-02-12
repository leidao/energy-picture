/*
 * @Description:
 * @Author: ldx
 * @Date: 2024-01-19 15:04:07
 * @LastEditors: ldx
 * @LastEditTime: 2025-01-13 18:16:58
 */
import * as echarts from "echarts"



/** 图 */
export function createOption(option = {}) {
  return echarts.util.merge(option, {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: string) => Number(value).toFixed(2) + "MW"
    },
    xAxis: {
      type: "category",
      data: [],
      axisLabel: {
        interval: 0,
        color: "#909399",
        fontSize: 12
      },
    },
    legend: {
      left: "right",
      backgroundColor: "transparent",
      textStyle: {
        color: '#fff',
        fontSize: 12
      }
    },
    yAxis: {
      type: "value",
      splitLine: {
        show: false,
        lineStyle: {
          type: "dashed",
          dashOffset: 2
        }
      },
      axisLabel: {
        // interval: 0,
        color: "#909399",
        fontSize: 10
      },
      // scale: true //自适应
    },
    grid: {
      top: 28,
      left: 34,
      right: 10,
      bottom: 24
    },
    series: []
  })
}




