<template>
    <div class="w-100% h-100% flex items-center">
        <div class="flex-1 h-100% overflow-auto">
            <div class="relative h-100%">
                <simplebar data-simplebar-auto-hide="false" class="h-100%">

                    <div class="w-27500px h-10px bg-#ffffff33 mt-10px"></div>
                    <div class="absolute top-10px left-0px h-10px bg-#5ff8" :style="{ width: width + 'px' }"></div>

                    <div class="wrap">
                        <div class="absolute top-10px" :style="{ left: 220 * i + 'px' }" v-for="(item, i) in dateArr"
                            :key="item">
                            <div class="w-10px h-10px rounded-10px  cursor-pointer slider bg-#fff"
                                @click="handleTimeLineChange(item, i)"></div>
                            <div class="w-220px mt-2px cursor-pointer" :style="getComputedStyle(item)">{{ item }}</div>
                        </div>
                    </div>
                </simplebar>

            </div>
        </div>
        <div class="w-100px h-100% flex items-center justify-center">
            <el-tooltip content="播放/暂停" placement="top">
                <el-icon color="white" size="30px" v-if="playSwitch" @click="handlePlay">
                    <VideoPause />
                </el-icon>
                <el-icon color="white" size="30px" v-if="!playSwitch" @click="handlePlay">
                    <VideoPlay />
                </el-icon>
            </el-tooltip>
        </div>
    </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from "vue";
import dayjs from 'dayjs'
import simplebar from 'simplebar-vue';
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'

const props = defineProps({

    nowValue: {
        type: String,
        default: '',
    },
    dateArr: {
        type: Array,
        default: () => [],
    },
    second: {
        type: Number,
        default: 1000,
    },
    sleep: {
        type: Boolean,
        default: true,
    },
});
const time = ref(props.dateArr[0])
let nowDate = 0
const width = ref(0)
const pageCode = ref(0)
const playSwitch = ref(false)
const colors = ['#00ffff', '#00ff80', '#00ffff', '#00ff80', '#00ffff', '#00ff80', '#00ffff', '#00ff80', '#00ffff', '#00ff80', '#00ffff']
let animationFrameId = null;

const emits = defineEmits(["handleNowValueChange"]);
const getComputedStyle = (time) => {
    const dateStr = dayjs(time).format('YYYY-MM-DD');
    const uniqueDates = [...new Set(props.dateArr.map(date =>
        dayjs(date).format('YYYY-MM-DD')
    ))];
    const colorIndex = uniqueDates.indexOf(dateStr) % colors.length;

    return {
        color: colors[colorIndex]
    };
}

const handleTimeLineChange = (value, index) => {
    pageCode.value = index
    width.value = 220 * pageCode.value + 6
    emits("handleNowValueChange", value)
}
const startAni = () => {
    if (pageCode.value === 125) return
    animationFrameId = requestAnimationFrame(startAni)
    if (!props.sleep) return
    const timeDate = new Date().getTime()
    if (timeDate - nowDate > props.second) {
        nowDate = timeDate
        pageCode.value++
        width.value = 220 * pageCode.value + 6
        const value = props.dateArr[pageCode.value]
        emits("handleNowValueChange", value)
        const element = document.getElementsByClassName('wrap')[0]

        element.childNodes[pageCode.value].scrollIntoView({
            behavior: 'smooth',
            inline: 'center'
        })
    }
}
const closeAni = () => {
    playSwitch.value = false
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }
}
// 播放控制
const handlePlay = () => {
    playSwitch.value = !playSwitch.value;

    if (playSwitch.value) {
        nowDate = new Date().getTime()
        startAni()
    } else {
        closeAni()
    }
};

// 暴露closeAni函数
defineExpose({
    closeAni
});

</script>

<style lang="scss" scoped>
.slider:hover {
    background: #569ff8 !important;
}
</style>