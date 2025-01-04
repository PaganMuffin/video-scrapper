import { defineMiddleware } from "astro:middleware";

//@ts-ignore
export const onRequest = defineMiddleware(async (context, next) => {
    const { request } = context;
    const { url } = request;
    const { pathname } = new URL(url);

    console.log("1XD");
    if (pathname.startsWith("/player")) {
        console.log("2XD");
        const cacheKay = "http://example.com" + pathname;
        const cache = context.locals.runtime.caches.default;
        const cacheResponse = await cache.match(cacheKay);
        if (cacheResponse) {
            console.log("cached");
            //@ts-ignore
            return new Response(cacheResponse.body, {
                status: cacheResponse.status,
                statusText: cacheResponse.statusText,
                headers: cacheResponse.headers,
            });
        } else {
            console.log("not cached");
            const response = await next();
            response.headers.set("Cache-Control", "public, max-age=60");
            //@ts-ignore
            await cache.put(cacheKay, response.clone());
            return response;
        }
    }
    return next();
});
