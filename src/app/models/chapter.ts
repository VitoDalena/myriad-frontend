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
    x: number;
    y: number;
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