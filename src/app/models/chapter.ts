export type ChapterEvent = {
    id: number;
    title: string;
    description: string;
    cx: number;
    cy: number;
}

export type ChapterImage = {
    id: number;
    url: string;
    events: ChapterEvent[];
    imageWidth: number;
    imageHeight: number;
    leftCrop: number;
    rightCrop: number;
    topCrop: number;
    bottomCrop: number;
}

export type ChapterEventConnection = {
    id: number;
    start: number;
    end: number;
    color: string;
}

export type Chapter = {
    id: number;
    title: string;
    images: ChapterImage[];
    connections: ChapterEventConnection[];
}