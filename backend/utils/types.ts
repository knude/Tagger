export interface TaggerFile {
  id: number;
  name: string;
  extension: string;
}

export interface TaggerTag {
  id: number;
  name: string;
}

export interface TaggerFileWithTags extends TaggerFile {
  tags: TaggerTag[];
}