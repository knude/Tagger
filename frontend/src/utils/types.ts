export interface TaggerFile {
    id: number;
    name: string;
    extension: string;
}

export interface TaggerTag {
    id: number;
    name: string;
}

export interface TaggerTagWithCount extends TaggerTag {
    count: number;
}

export interface TaggerTags {
    tags: TaggerTagWithCount[];
}

export interface TaggerFileWithTags extends TaggerFile {
    tags: TaggerTag[];
}

export interface TaggerFiles {
    files: TaggerFile[];
    totalPages: number;
}