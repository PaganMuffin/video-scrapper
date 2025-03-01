export class Odysee {
    private videoUrl: string;
    private metadata: any = {};
    qualities: { quality: number; url: string }[] = [];
    title: string = "";
    thumbnail: string = "";

    constructor(videoUrl: string) {
        this.videoUrl = videoUrl;
    }

    public fetchData = async () => {
        const f = await fetch(this.videoUrl, {
            headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
                "cache-control": "max-age=0",
                priority: "u=0, i",
                "sec-ch-ua":
                    '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
            },
        });

        const html = await f.text();

        const unparsed = html
            .split(`<script type="application/ld+json">`)[1]
            .split(`</script>`)[0];

        const json = JSON.parse(unparsed);

        this.metadata = json;
        this.getInformation();
    };

    private getInformation = () => {
        this.title = this.metadata.name;
        this.thumbnail = this.metadata.thumbnailUrl;

        this.qualities = [
            {
                quality: this.metadata.height,
                url: this.metadata.contentUrl,
            },
        ];
    };
}
