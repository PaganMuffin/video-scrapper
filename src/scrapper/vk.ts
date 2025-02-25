export class VK {
    private videoId: string;
    private metadata: any = {};
    qualities: { quality: number; url: string }[] = [];
    title: string = "";
    thumbnail: string = "";

    constructor(videoId: string) {
        this.videoId = videoId;
    }

    public fetchData = async () => {
        this.metadata = await this.fetchMetadata();
        this.qualities = this.extractResolutions();
        this.title = this.metadata.payload[1][4].player.params[0].md_title;
        this.thumbnail = this.metadata.payload[1][4].player.params[0].jpg;
    };

    private fetchMetadata = async (): Promise<any> => {
        const userId = this.videoId.split("_")[0].replace("video", "");
        // return TEST_METADATA;
        const response = await fetch("https://vk.com/al_video.php?act=show", {
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                accept: "*/*",
                Referer: `https://vk.com/video/@id${userId}?z=${this.videoId}%2Fpl_${userId}_-2`,
                "x-requested-with": "XMLHttpRequest",
                "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "max-age=0",
                "sec-ch-ua":
                    '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
            },
            method: "POST",
            body: new URLSearchParams({
                act: "show",
                al: "1",
                al_ad: "0",
                autoplay: "0",
                force_no_repeat: "1",
                list: "",
                load_playlist: "1",
                module: "video_user_all",
                playlist_id: `${userId}_-2`,
                screen: "0",
                show_all_videos: "0",
                show_next: "1",
                video: this.videoId.replace("video", ""),
                webcast: "0",
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch metadata");
        }

        return await response.json();
    };

    private extractResolutions = (): { quality: number; url: string }[] => {
        const keys = [
            "url144",
            "url240",
            "url360",
            "url480",
            "url720",
            "url1080",
        ];

        let resolutions = [];

        for (let key of keys) {
            const resUrl = this.metadata.payload[1][4].player.params[0][key];

            if (resUrl) {
                const obj = {
                    quality: Number(key.replace("url", "")),
                    url: resUrl,
                };
                resolutions.push(obj);
            }
        }

        return resolutions.sort((a, b) => a.quality - b.quality).reverse();
    };
}
