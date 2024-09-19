<script setup lang="ts">

</script>

<template>
    <div class="grid grid-cols-4 gap-5">
        <NuxtLink to="movies/joker">
            <UCard class="overflow-clip" :ui="{body: {padding: ''}}">
                <img src="https://avatars.dzeninfra.ru/get-zen_doc/1707354/pub_5e2dd0a604af1f00adc91c80_5e2ddcacbb892c00b19ec8d4/scale_1200"
                     class="aspect-[3/4] object-cover"/>

                <template #footer>
                    <p class="font-semibold text-xl">Joker (2019)</p>
                </template>
            </UCard>
        </NuxtLink>

        <NuxtLink to="movies/the-dark-knight">
            <UCard class="overflow-clip" :ui="{body: {padding: ''}}">
                <img src="https://static.kinoafisha.info/k/movie_posters/1080x1920/upload/movie_posters/4/4/7/3229744/446389851653464738.jpg"
                     class="aspect-[3/4] object-cover"/>

                <template #footer>
                    <p class="font-semibold text-xl">The Dark Knight (2008)</p>
                </template>
            </UCard>
        </NuxtLink>
    </div>
</template>

<style scoped>

</style>