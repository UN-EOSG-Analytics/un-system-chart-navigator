export interface Organ {
    short_name: string;
    long_name: string;
    type: string;
    parent_body: string[];
    defunct: boolean;
    url?: string;
}
