<template>
  <div class="w-100vw h-100vh relative">
    <div ref="mapRef" class="w-full h-full" />
  </div>
  <div class="absolute top-10px left-10px z-50">
    <el-radio-group v-model="radio" size="large" @change="handleRadioChange">
      <el-radio-button label="辐照图层" :value="1" />
      <el-radio-button label="功率预测图层" :value="2" />
    </el-radio-group>
  </div>
  <div class="absolute left-0 bottom-10px w-full h-60px" v-show="radio === 1">
    <div class="pl-20px h-60px flex items-center  bg-[rgba(41,5,75,0.5)] z-50 backdrop-blur-10px rounded-10px mx-6px">
      <TimeLine ref="timeLineRef" :sleep="sleep" :second="1200" :nowValue="nowValue" :dateArr="dateArr"
        @handleNowValueChange="handleNowValueChange">
      </TimeLine>
    </div>
  </div>
  <Details v-model="open2" :details="details" />
  <UserInfo v-model="open" :userInfo="userInfo" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGridHeat } from '@/hooks/useGridHeat'
import AMapLoader from '@amap/amap-jsapi-loader'
import TimeLine from "@/components/timeLine/index.vue";
import points from './point.json'
import * as turf from '@turf/turf'
import Details from './details.vue'
import UserInfo from './usrInfo.vue'
import substation from '@/assets/home/substation.png'
import dayjs from 'dayjs'
const gridHeat = useGridHeat()
// 响应式引用
const mapRef = ref(null)
const map = ref(null)
const open = ref(false)
const open2 = ref(false)
const userInfo = ref({})
const details = ref({})
const radio = ref(2)
const time = ref('')
let districtExplorer = null
let pointSimplifierIns = null
let level = 0
let currentpoint = null // 当前聚焦区域
let textMarkers = []
let currentAreaNode = null // 当前聚焦区域
let flag = false
let i = 1
// 地图配置
const mapConfig = {
  key: "455cdb79bf8735a87862d83e16f06c94",
  version: "2.0",
  plugins: [],
  AMapUI: {
    version: "1.1",
    plugins: ["geo/DistrictExplorer"]
  },
  Loca: {
    version: "2.0.0"
  }
}

const gradeOptions = Object.freeze([
  { label: "<480W/㎡", color: "#b7f8ff" },
  { label: ">480W/㎡", color: "#fff21f" },
  { label: ">720W/㎡", color: "#ff9080" },
  { label: ">960W/㎡", color: "#ff5940" },
  { label: "≥1200W/㎡", color: "#ff2000" },
]);
const generateOptions = Object.freeze([
  { label: "<5MW", color: "#03936e" },
  { label: ">5MW", color: "#efcf44" },
  { label: ">10MW", color: "#f0a843" },
  { label: ">15MW", color: "#6449f0" },
  { label: "≥20MW", color: "#f04343" },
]);

let nowValue = ref("");
let dateArr = ref([]);
// let currentAreaNode = null
// 改变nowValue 重要函数
const sleep = ref(true)
const handleNowValueChange = (val) => {
  nowValue.value = val;
  sleep.value = false
  fetch(`/weatherData/requestFzdata?requestHourDateStr=${dayjs(val).format('YYYYMMDDHH')}`).then(res => res.json()).then(res => {
    const parentPolygon = turf.polygon(currentAreaNode.getParentFeature().geometry.coordinates[0])
    const data = res.data.features.filter(item => {
      const point = turf.point(item.geometry.coordinates)
      return turf.booleanPointInPolygon(point, parentPolygon)
    })
    const geoSource = gridHeat.createGeoJSONSource({
      type: 'FeatureCollection',
      features: data
    })
    gridHeat.setData(geoSource)
    sleep.value = true
  })

};

//监听
watch(nowValue, (newValue, oldValue) => {
  console.log(newValue, oldValue, "我是父组件");
});

// 初始化地图
const initMap = async () => {
  try {
    const AMap = await AMapLoader.load(mapConfig)

    const mapInstance = new AMap.Map(mapRef.value, {
      zoom: 7,
      doubleClickZoom: false,
      center: [113.665412, 34.757975], // 河南省中心点
      viewMode: "2D"
    })

    map.value = mapInstance

    // 初始化行政区插件
    await initDistrictExplorer(mapInstance)
  } catch (error) {
    console.error("地图初始化失败:", error)
  }
}

// 根据Hover状态设置样式
const toggleHoverFeature = (feature, isHover, position) => {
  if (!feature) return
  const props = feature.properties
  // 更新多边形样式
  const polys = districtExplorer.findFeaturePolygonsByAdcode(props.adcode)
  polys.forEach(poly => {
    poly.setOptions({
      fillColor: isHover ? '#F7BE7E' : '#20ba93',
      fillOpacity: 0.7
    })
  })
}





// 渲染区域多边形
const renderAreaPolygons = (areaNode) => {
  // currentAreaNode = areaNode
  map.value.setBounds(areaNode.getBounds(), null, null, true)
  districtExplorer.clearFeaturePolygons()
  map.value.remove(textMarkers)
  textMarkers = []
  // 绘制子区域
  districtExplorer.renderSubFeatures(areaNode, (feature, i) => {
    const props = feature.properties
    // const polygon = turf.polygon(feature.geometry.coordinates[0]);
    // const point = turf.centerOfMass(polygon);
    const point = props.centroid

    // 创建文本标记
    const textMarker = new AMap.Text({
      text: props.name,
      // position: [point.geometry.coordinates[0], point.geometry.coordinates[1]],
      position: point,
      anchor: 'center',
      style: {
        'background-color': 'transparent',
        'border': 'none',
        'font-size': '14px',
        'color': '#fff',
        'cursor': 'pointer'
      }
    })
    // 添加鼠标移入移出事件监听
    textMarker.on('mouseover', () => {
      textMarker.setStyle({
        color: '#FF0000' // 鼠标移入时变为金色
      })
    })
    textMarker.on('mouseout', () => {
      textMarker.setStyle({
        color: '#fff' // 鼠标移出时恢复白色
      })
    })
    // 添加点击事件监听
    textMarker.on('click', () => {
      // 处理点击事件
      const points = groupedPointsCache[props.adcode] || []
      details.value = {
        name: props.name,
        substations: points.length
      }
      open2.value = true
    })

    textMarker.setMap(map.value)
    textMarkers.push(textMarker)


    const fillColor = '#20ba93'
    return {
      cursor: "default",
      bubble: true,
      strokeColor: radio.value === 1 ? '#000' : '#fff',
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor,
      fillOpacity: radio.value === 1 ? 0 : 0.7
    }
  })

  // 在绘制父区域之前执行一些代码
  if (radio.value === 1) {
    flag = false
    handleNowValueChange(nowValue.value)
    gridHeat.show()
    gridHeat.createLengend(gradeOptions);
  } else {
    flag = true
    setTimeout(() => {
      timeLineRef.value?.closeAni() // 调用子组件的closeAni方法
      gridHeat.hide()
      gridHeat.createLengend(generateOptions);
    }, 100)
  }

  // 绘制父区域
  districtExplorer.renderParentFeature(areaNode, {
    cursor: "default",
    bubble: true,
    strokeColor: "#000",
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: null,
    fillOpacity: 1
  })
}

// 刷新区域节点
const refreshAreaNode = (areaNode) => {
  districtExplorer.setHoverFeature(null)
  renderAreaPolygons(areaNode)
}
// 切换区域
const switch2AreaNode = (adcode, callback) => {
  if (currentAreaNode && String(currentAreaNode.getAdcode()) === String(adcode)) {
    return
  }

  loadAreaNode(adcode, (error, areaNode) => {
    if (error) {
      callback?.(error)
      return
    }

    currentAreaNode = areaNode
    districtExplorer.setAreaNodesForLocating([currentAreaNode])
    refreshAreaNode(areaNode)
    callback?.(null, areaNode)
  })
}

const groupedPointsCache = {}

const getGroupedPoints = (adcode) => {
  return groupedPointsCache[adcode] || points
}

// 保存分组点
const saveGroupedPoints = (areaNode, groups) => {
  groups.forEach(group => {
    const { subFeature, points } = group
    const key = subFeature ? subFeature.properties.adcode : `-out-${areaNode.getAdcode()}`
    if (!subFeature) return
    groupedPointsCache[key] = points
  })
}

// 渲染分组点
const renderGroupedPoints = (groups) => {

  const pointsData = groups.reduce((acc, group) => {
    const points = group.points.map(pos => ({
      gid: group.subFeatureIndex,
      pos: [pos.lng, pos.lat],
      data: pos
    }))
    return [...acc, ...points]
  }, [])

  pointSimplifierIns.setData(pointsData)
}

// 加载区域节点
const loadAreaNode = (adcode, callback) => {
  districtExplorer.loadAreaNode(adcode, (error, areaNode) => {
    if (error) {
      callback?.(error)
      console.error(error)
      return
    }

    const points = getGroupedPoints(adcode)
    const groups = areaNode.groupByPosition(points, item => [item.lng, item.lat])
    saveGroupedPoints(areaNode, groups)
    renderGroupedPoints(groups)
    callback?.(null, areaNode)
  })
}

// 初始化行政区插件
const initDistrictExplorer = (map) => {
  gridHeat.init(map)
  AMapUI.load(["ui/geo/DistrictExplorer", "lib/$", "ui/misc/PointSimplifier"],
    (DistrictExplorer, $, PointSimplifier) => {
      // 创建实例
      districtExplorer = new DistrictExplorer({
        map,
        eventSupport: true, // 打开事件支持
        preload: [410000] // 预加载河南
      })

      // 监听鼠标事件
      districtExplorer.on("featureMouseout featureMouseover", (e, feature) => {
        radio === 2 && toggleHoverFeature(
          feature,
          e.type === "featureMouseover",
          e.originalEvent?.lnglat
        )
      })


      // 点击事件处理
      districtExplorer.on("featureClick", (e, feature) => {
        setTimeout(() => {
          if (currentpoint) {
            const randomPoint = turf.point(currentpoint);
            const polygon = turf.polygon(
              feature.geometry.coordinates[0]
            );
            if (turf.booleanPointInPolygon(randomPoint, polygon)) {
              currentpoint = null;
              return
            }
          }
          open.value = false
          const props = feature.properties

          if (props.childrenNum > 0) {
            switch2AreaNode(props.adcode)
            level = 1
          }
        }, 0)
      })

      // 点击外部区域
      districtExplorer.on("outsideClick", (e) => {
        districtExplorer.locatePosition(
          e.originalEvent.lnglat,
          () => {
            switch2AreaNode(410000)
            level = 0
          },
          {
            levelLimit: 2
          }
        )
      })


      // 创建海量点组件
      const questionContent = PointSimplifier.Render.Canvas.getImageContent(
        substation,
        () => pointSimplifierIns.renderLater(),
        () => alert("图片加载失败！")
      )

      pointSimplifierIns = new PointSimplifier({
        zIndex: 115,
        autoSetFitView: false,
        map,
        getPosition: item => item.pos,
        getHoverTitle: (item) => item.gid === -1 ? "区域外" : null,
        renderConstructor: PointSimplifier.Render.Canvas.GroupStyleRender,
        renderOptions: {
          pointStyle: {
            fillStyle: "red",
            width: 5,
            height: 5
          },
          getGroupId: item => item.gid,
          groupStyleOptions: (gid) => {
            if (gid === -1) {
              return {
                pointStyle: {
                  content: questionContent,
                  fillStyle: null,
                  strokeStyle: null,
                  lineWidth: 2,
                  width: 16,
                  height: 16
                }
              }
            }
            return {
              pointStyle: {
                // fillStyle: '#00C2FF',
                // strokeStyle: "rgba(255,255,255,0.3)",
                // lineWidth: 1
                content: questionContent,
                fillStyle: null,
                strokeStyle: null,
                lineWidth: 2,
                width: 16,
                height: 16
              }
            }
          },
          // 添加鼠标悬停样式
          pointHoverStyle: {
            fillStyle: '#ff0000', // 悬停时的填充色
            width: 8,  // 悬停时的大小
            height: 8
          }
        }
      })


      // 添加点击事件监听
      pointSimplifierIns.on('pointClick', (e, record) => {
        currentpoint = record.data.pos
        open.value = true
        userInfo.value = record.data.data
      });


      groupedPointsCache["410000"] = points
      // 加载河南省
      switch2AreaNode(410000)
    }
  )
}

const timeLineRef = ref(null) // 添加对TimeLine组件的引用

const handleRadioChange = () => {
  renderAreaPolygons(currentAreaNode)
}
// 生命周期钩子
onMounted(() => {
  initMap();
  fetch(`/weatherData/getTimeAxis`)
    .then(res => res.json()).then(res => {
      dateArr.value = res.data
      nowValue.value = res.data[0]
    })
})

onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})
</script>

<style></style>
