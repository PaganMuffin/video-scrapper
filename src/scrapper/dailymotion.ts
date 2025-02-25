export class Dailymotion {
    private videoId: string;
    private metadata: any = {};
    private m3u8Url: string = "";
    private rawM3U8: string = "";
    private m3u8Data: any = {};
    qualities: { quality: number; url: string }[] = [];
    title: string = "";
    thumbnail: string = "";

    constructor(videoId: string) {
        this.videoId = videoId;
    }

    public fetchData = async () => {
        this.metadata = await this.fetchMetadata();
        this.m3u8Url = this.metadata.qualities.auto[0].url;
        this.rawM3U8 = await this.fetchM3U8();
        this.m3u8Data = this.parseM3U8();
        this.qualities = this.extractResolutions();
        this.title = this.metadata.title;
        this.thumbnail = this.metadata.thumbnails["720"];
    };

    private fetchMetadata = async (): Promise<any> => {
        // return TEST_METADATA;
        const response = await fetch(
            "https://www.dailymotion.com/player/metadata/video/" + this.videoId,
            {
                headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
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

        return await response.json();
    };

    private fetchM3U8 = async (): Promise<any> => {
        // return TEST_M3U8;
        const response = await fetch(this.m3u8Url, {
            headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
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
        });

        if (!response.ok) {
            throw new Error("Failed to fetch m3u8 playlist");
        }

        return await response.text();
    };

    private parseM3U8 = (): any => {
        const lines = this.rawM3U8.split("\n");
        const data: any = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith("#EXT-X-STREAM-INF")) {
                //@ts-ignore
                const stream = {
                    bandwidth: line.match(/BANDWIDTH=(\d+)/)?.[1] || "",
                    codecs: line.match(/CODECS="([^"]+)"/)?.[1] ?? "",
                    resolution: line.match(/RESOLUTION=(\d+x\d+)/)?.[1] || "",
                    name: Number(line.match(/NAME="([^"]+)"/)?.[1]) ?? "",
                    url:
                        (line.match(/PROGRESSIVE-URI="([^"]+)"/)?.[1] ?? "") +
                        "#cell=cf",
                };
                data.push(stream);
            }
        }

        return data.sort((a: any, b: any) => a.name - b.name);
    };

    private extractResolutions = (): { quality: number; url: string }[] => {
        const qualities: { quality: number; url: string }[] = [];
        const qualitiesData = this.m3u8Data;

        for (let i = 0; i < qualitiesData.length; i++) {
            const quality = qualitiesData[i];
            qualities.push({
                quality: quality.name,
                url: quality.url,
            });
        }

        return qualities.sort((a, b) => a.quality - b.quality).reverse();
    };
}
