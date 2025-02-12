/*
 * @Author: leidao 18015816566@163.com
 * @Date: 2025-01-14 14:38:26
 * @LastEditors: leidao 18015816566@163.com
 * @LastEditTime: 2025-01-14 16:03:48
 * @FilePath: /energy-picture/src/hooks/useGridHeat.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const colorToRGB = (color, ratio = 0.5) => {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);

  return `rgba(${r},${g},${b},${ratio})`;
};
export const useGridHeat = () => {
  const gridHeat = {
    map: null,
    loca: null,
    layer: null,
    lengend: null,
    gridId: null,
    moveGridId: null,
    destorys: [],
    marker: null,
    radius: 6500,
    gap: 300,
    /** 指定类型，除行政区、街道级别外，针对“点”以及“自定义区域”的查询详情，地图评分展示去除渐别色，直接用三色（红黄绿）展示 */
    type: null,
    init: (map) => {
      if (!gridHeat.map) {
        gridHeat.map = map;
        gridHeat.loca = new Loca.Container({
          map,
        });
        gridHeat.marker = new AMap.Marker({
          // offset: new AMap.Pixel(-10, 10),
          anchor: "center",
          bubble: true,
        });
      }
    },
    setData: (geo) => {
      if (!gridHeat.layer) {
        gridHeat.layer = new Loca.GridLayer({
          loca: gridHeat.loca,
          zIndex: 3000,
          opacity: 0.4,
          visible: true,
          zooms: [2, 22],
          acceptLight: false, // 是否接受光照
          cullface: "back", // 剔除背面
          depth: false, // 是否有深度检测能力
        });
      }
      gridHeat.layer.setSource(geo);
      gridHeat.setStyle();
      gridHeat.show();
    },
    setStyle: (gridId) => {
      gridHeat.layer.setStyle({
        unit: "meter", // 单位
        // radius: gridHeat.town_id ? 50 : 500, // 半径
        radius: gridHeat.radius, // 半径
        gap: gridHeat.gap, // 相邻网格的间隙大小
        altitude: 0, // 海拔高度
        // 顶面颜色
        topColor: (index, feature) => {
          const { value, id } = feature.coordinates[0].properties;
          let color = "#b7f8ff";
          if (value < 120) {
            color = "#b7f8ff";
          } else if (value >= 120 && value < 240) {
            color = "#fff21f";
          } else if (value >= 240 && value < 360) {
            color = "#ff9080";
          } else if (value >= 360 && value < 480) {
            color = "#ff5940";
          } else if (value >= 480) {
            color = "#ff2000";
          }
          color = colorToRGB(color, 1);
          return color;
        },
      });
    },
    setOpacity: (opacity) => {
      gridHeat.layer?.setOpacity(opacity / 100);
    },
    setzIndex: (zIndex) => {
      gridHeat.layer?.setzIndex(zIndex);
    },
    createLengend: (gradeOptions) => {
      gridHeat.lengend?.remove();
      // 图例
      gridHeat.lengend = new Loca.Legend({
        loca: gridHeat.loca,
        title: {
          label: "图例",
          fontColor: "#000",
          fontSize: "16px",
        },
        style: {
          backgroundColor: "#fff",
          fontColor: "#000",
          borderRadius: "6px",
          right: "20px",
          bottom: "100px",
          fontSize: "12px",
        },
        dataMap: gradeOptions,
      });
    },

    createGeoJSONSource: (geojson) => {
      const geoSource = new Loca.GeoJSONSource({
        data: geojson,
      });
      return geoSource;
    },
    destory: () => {
      gridHeat.destorys.forEach((destory) => destory());
      gridHeat.destorys = [];
    },
    hide: () => {
      gridHeat.layer?.hide();
    },
    show: () => {
      gridHeat.layer?.show();
    },
  };
  return gridHeat;
};
