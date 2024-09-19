<script setup lang="ts">
import Hls from "hls.js";

const props = defineProps<{
    url: string
}>();

const videoRef           = ref();
const videoRootRef       = ref();
const played             = ref<boolean>(false);
const paused             = ref<boolean>(false);
const levelSwitching     = ref<boolean>(false);
const selectedLevel      = ref<number>(-1);
const loading            = ref<boolean>(false);
const fullscreen         = ref<boolean>(false);
const muted              = ref<boolean>(false);
const audioTracksList    = ref<any[]>([]);
const selectedAudio      = ref<number>();
const progress           = ref<number>(0);
const volume             = ref<number>(50);
const currentDate        = ref<string>('');
const endDate            = ref<string>('');
const subtitleTracksList = ref<any[]>([]);
const selectedSubtitle   = ref<number>(-1);

watch(volume, value => {
    muted.value = value == 0;
});

watch(muted, value => {
    if (!value && volume.value == 0)
        volume.value = 50;
});

const hls = new Hls();

hls.loadSource(props.url);

hls.on(Hls.Events.LEVEL_SWITCHING, (e, data) => {
    levelSwitching.value = true;
    //loading.value        = true;
    selectedLevel.value  = data.level;
});

hls.on(Hls.Events.LEVEL_SWITCHED, (e, data) => {
    levelSwitching.value = false;
    //videoRef.value.pause();
});

hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (e, data) => {
    audioTracksList.value = data.audioTracks;
});

hls.on(Hls.Events.AUDIO_TRACK_LOADED, (e, data) => {
    selectedAudio.value = data.id;
});

hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (e, data) => {
    subtitleTracksList.value = data.subtitleTracks;
});

watch(videoRef, ref => {
    hls.attachMedia(ref);

    ref.addEventListener('pause', () => paused.value = true);

    ref.addEventListener('play', () => {
        paused.value = false;
        played.value = true;
    });

    ref.addEventListener('timeupdate', () => {
        progress.value    = videoRef.value.currentTime / videoRef.value.duration;
        currentDate.value = makeTime(videoRef.value.currentTime);
    });

    ref.addEventListener('loadeddata', () => {
        currentDate.value = makeTime(videoRef.value.currentTime);
        endDate.value     = makeTime(videoRef.value.duration);
    });
});

watch(selectedSubtitle, value => {
    if (!videoRef.value)
        return;

    subtitleTracks.value[0].filter((track: any) => track.label != 'Off').forEach((_, index: number) => {
        videoRef.value.textTracks[index].mode = 'hidden';
    });

    if (value >= 0)
        videoRef.value.textTracks[value].mode = 'showing';
});

function makeTime(value: number) {
    let hours   = Math.floor(value / 3600).toString();
    let minutes = Math.floor(value % 3600 / 60).toString();
    let seconds = Math.floor(value % 3600 % 60).toString();

    if (parseInt(seconds) < 10)
        seconds = '0' + seconds;

    if (parseInt(minutes) < 10)
        minutes = '0' + minutes;

    if (parseInt(hours) < 10)
        hours = '0' + hours;

    return `${hours}:${minutes}:${seconds}`;
}

const qualities = computed(() => [
    [{
        label: 'Auto',
        class: selectedLevel.value == -1 ? 'font-semibold bg-gray-100 dark:bg-gray-900' : '',
        click: () => {
            hls.currentLevel = -1;
        }
    }, {
        label: '1080p',
        class: selectedLevel.value == 2 ? 'font-semibold bg-gray-100 dark:bg-gray-900' : '',
        click: () => {
            hls.currentLevel = 2;
        }
    }, {
        label: '720p',
        class: selectedLevel.value == 1 ? 'font-semibold bg-gray-100 dark:bg-gray-900' : '',
        click: () => {
            hls.currentLevel = 1;
        }
    }, {
        label: '360p',
        class: selectedLevel.value == 0 ? 'font-semibold bg-gray-100 dark:bg-gray-900' : '',
        click: () => {
            hls.currentLevel = 0;
        }
    }]
]);

const audioTracks = computed(() => [
    audioTracksList.value.map(track => ({
        label: track.name,
        class: selectedAudio.value == track.id ? 'font-semibold bg-gray-100 dark:bg-gray-900' : '',
        click: () => {
            hls.audioTrack = track.id;
        }
    }))
]);

const subtitleTracks = computed(() => [
    [
        ...[{
            label: 'Off',
            lang : '',
            src  : '',
            class: selectedSubtitle.value == -1 ? 'font-semibold bg-gray-100 dark:bg-gray-900' : '',
            click: () => {
                selectedSubtitle.value = -1;
            }
        }],
        ...subtitleTracksList.value.map(track => ({
            label: track.name,
            lang : track.lang,
            src  : track.url,
            class: selectedSubtitle.value == track.id ? 'font-semibold bg-gray-100 dark:bg-gray-900' : '',
            click: () => {
                selectedSubtitle.value = track.id;
            }
        }))
    ]
]);

function exitFullscreen() {
    document.exitFullscreen();
    fullscreen.value = false;
}

function setPosition(progress: number) {
    videoRef.value.currentTime = (progress / 1000) * videoRef.value.duration;
    videoRef.value.play();
}

document.addEventListener('fullscreenchange', () => fullscreen.value = !!document.fullscreenElement);

function toggleFullscreen() {
    if (videoRootRef.value.requestFullscreen)
        videoRootRef.value.requestFullscreen();
    else if (videoRootRef.value.webkitEnterFullScreen)
        videoRootRef.value.webkitEnterFullscreen();
}

const controlShown = ref<boolean>(true);
let timeout: any   = null;

function resetTimeout() {
    if (timeout)
        clearTimeout(timeout);

    timeout = setTimeout(() => controlShown.value = false, 3000);
}
</script>

<template>
    <div ref="videoRootRef" class="relative"
         :class="{'rounded-xl overflow-clip': !fullscreen, 'cursor-none': !controlShown}"
         @mouseenter="controlShown = true; resetTimeout()"
         @mousemove="controlShown = true; resetTimeout()">
        <div class="absolute top-0 w-full h-full z-10"
             @click.exact.prevent="!played || (played && paused) ? videoRef.play() : videoRef.pause()"></div>

        <div class="absolute top-0 w-full h-full flex items-center justify-center">
            <UIcon v-if="loading"
                   name="i-heroicons-arrow-path"
                   class="text-8xl text-gray-50 animate-spin"/>
        </div>

        <Transition>
            <div v-show="controlShown" class="absolute bottom-0 w-full p-5 z-10 bg-gradient-to-t from-gray-950">
                <URange class="mb-3" :model-value="progress * 1000" @update:model-value="setPosition" :max="1000"/>

                <div class="flex justify-between items-center">
                    <div class="flex items-end justify-center gap-5">
                        <UButton v-show="!played || (played && paused)"
                                 icon="i-heroicons-play"
                                 variant="link"
                                 :padded="false"
                                 square
                                 size="xl"
                                 class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"
                                 @click="videoRef.play()"/>

                        <UButton v-show="played && !paused"
                                 icon="i-heroicons-pause"
                                 variant="link"
                                 :padded="false"
                                 square
                                 size="xl"
                                 class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"
                                 @click="videoRef.pause()"/>

                        <p class="text-white dark:text-white my-auto select-none font-semibold">
                            {{ currentDate }} / {{ endDate }}
                        </p>
                    </div>

                    <div class="flex items-end justify-center gap-2.5">
                        <UPopover mode="hover" :popper="{placement: 'top'}" class="flex items-end">
                            <UButton :icon="muted ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-speaker-wave'"
                                     variant="link"
                                     :padded="false"
                                     square
                                     size="xl"
                                     class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"
                                     @click="muted = !muted"/>

                            <template #panel>
                                <div class="w-40 h-full p-2.5">
                                    <URange :min="0" :max="100" orientation="vertical" v-model="volume"/>
                                </div>
                            </template>
                        </UPopover>

                        <UDropdown :items="subtitleTracks" :popper="{placement: 'top-end'}">
                            <div class="relative flex items-end">
                                <UButton icon="i-heroicons-chat-bubble-left-ellipsis"
                                         variant="link"
                                         :padded="false"
                                         square
                                         size="xl"
                                         class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"/>
                            </div>
                        </UDropdown>

                        <UDropdown :items="audioTracks" :popper="{placement: 'top-end'}">
                            <UButton icon="i-heroicons-megaphone"
                                     variant="link"
                                     :padded="false"
                                     square
                                     size="xl"
                                     class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"/>
                        </UDropdown>

                        <UDropdown :items="qualities" :popper="{placement: 'top-end'}">
                            <div class="relative flex items-end">
                                <div v-if="selectedLevel == 2"
                                     class="absolute top-0 -end-1.5 text-[0.6rem] bg-primary-600 rounded-full text-gray-50 font-semibold text-nowrap z-10 px-1.5">
                                    FHD
                                </div>
                                <div v-if="selectedLevel == 1"
                                     class="absolute top-0 -end-1.5 text-[0.6rem] bg-primary-600 rounded-full text-gray-50 font-semibold text-nowrap z-10 px-1.5">
                                    HD
                                </div>

                                <UButton icon="i-heroicons-cog-6-tooth"
                                         variant="link"
                                         :padded="false"
                                         square
                                         size="xl"
                                         class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"
                                         :class="{'animate-spin': levelSwitching}"/>
                            </div>
                        </UDropdown>

                        <UButton v-show="!fullscreen"
                                 icon="i-heroicons-arrows-pointing-out"
                                 variant="link"
                                 :padded="false"
                                 square
                                 size="xl"
                                 class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"
                                 @click="toggleFullscreen"/>

                        <UButton v-show="fullscreen"
                                 icon="i-heroicons-arrows-pointing-in"
                                 variant="link"
                                 :padded="false"
                                 square
                                 size="xl"
                                 class="text-white dark:text-white hover:text-gray-400 dark:hover:text-gray-400 [&>span]:w-10 [&>span]:h-10"
                                 @click="exitFullscreen"/>
                    </div>
                </div>
            </div>
        </Transition>

        <video ref="videoRef"
               class="w-full h-full aspect-[16/9]"
               playsinline
               :muted="muted"
               :volume="volume / 100"
               crossorigin="anonymous">
            <track v-for="subtitle in subtitleTracks[0].filter(track => track.label != 'Off')"
                   kind="subtitles"
                   :src="subtitle.src"
                   :label="subtitle.label"
                   :srclang="subtitle.lang"/>
        </video>
    </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>