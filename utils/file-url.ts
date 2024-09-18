export default function (path: string) {
    const config = useRuntimeConfig();
    return config.public.assetUrl + '/' + path;
}