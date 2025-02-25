export class OK {
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
        this.title = this.metadata.flashvars.metadata.movie.title;
        this.thumbnail = this.metadata.flashvars.metadata.movie.poster;
    };

    private fetchMetadata = async (): Promise<any> => {
        // return TEST_METADATA;
        const response = await fetch(
            "https://ok.ru/videoembed/" + this.videoId,
            {
                headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    Referer:
                        "https://vk.com/video/@id604627980?z=video604627980_456239207%2Fpl_604627980_-2",
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
                method: "GET",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch metadata");
        }

        const respText = await response.text();

        const dataOptions = respText.match(/data-options="([^"]+)"/);
        if (!dataOptions) {
            throw new Error("Failed to fetch metadata");
        }

        const options = dataOptions[1].replace(/&quot;/g, '"');
        const metadata = JSON.parse(options);

        metadata.flashvars.metadata = JSON.parse(metadata.flashvars.metadata);

        return metadata;
    };

    private extractResolutions = (): { quality: number; url: string }[] => {
        const supportedQualities = [
            {
                key: "full",
                quality: 1080,
            },
            {
                key: "hd",
                quality: 720,
            },
            {
                key: "sd",
                quality: 480,
            },
            {
                key: "low",
                quality: 360,
            },
            {
                key: "lowest",
                quality: 240,
            },
            {
                key: "mobile",
                quality: 144,
            },
        ];

        let resolutions = [];

        for (let quality of supportedQualities) {
            const video = this.metadata.flashvars.metadata.videos.find(
                (video: { name: string; url: string }) =>
                    video.name === quality.key
            );

            if (video) {
                resolutions.push({
                    quality: quality.quality,
                    url: video.url,
                });
            }
        }

        return resolutions;
    };
}
