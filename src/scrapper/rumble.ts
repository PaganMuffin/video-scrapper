export class Rumble {
    private videoId: string;
    private metadata: any = {};
    qualities: { quality: number; url: string }[] = [];
    title: string = "";
    thumbnail: string = "";

    constructor(videoId: string) {
        this.videoId = videoId;
    }

    public fetchData = async () => {
        const rumbleApi = `https://rumble.com/embedJS/u3`;
        const rumbleBody = { request: "video", ver: 2, v: this.videoId };
        const rumbleSearchParams = new URLSearchParams();
        for (const key in rumbleBody) {
            //@ts-ignore
            rumbleSearchParams.append(key, rumbleBody[key]);
        }

        const f = await fetch(rumbleApi + "?" + rumbleSearchParams.toString());

        if (f.ok) {
            const json = await f.json();
            this.metadata = json;
        } else {
            throw new Error("Failed to fetch data");
        }

        this.qualities = this.extractResolutions();
        this.title = this.metadata["title"];
        this.thumbnail = this.metadata["i"];
    };

    private extractResolutions = () => {
        const videos = this.metadata["ua"]["mp4"];
        const resolutions = Object.keys(videos);

        const sources: { url: any; quality: number }[] = [];
        resolutions.forEach((res) => {
            const video = videos[res]["url"];
            sources.push({
                url: video,
                quality: parseInt(res),
            });
        });

        return sources.sort((a, b) => a.quality - b.quality).reverse();
    };
}
