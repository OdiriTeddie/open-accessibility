export interface SourceLocation {
  file: string;
  line?: number;
  column?: number;
  componentName?: string;
}

export interface SourceMapper {
  findSourceForSelector(selector: string): Promise<SourceLocation | undefined>;
}
