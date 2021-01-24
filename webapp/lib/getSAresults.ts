import fs from "fs";
import { join } from "path";
import parse from 'csv-parse/lib/sync';
const directory = join(process.cwd(), "_SAresults");

export function getFiles() {
    return fs.readdirSync(directory);
}

export function getFile(path:string) {
    const data = fs.readFileSync(`${directory}/${path}`) as any
    return JSON.parse(data)
}

export function readCsv(path: string) {
    const data = fs.readFileSync(`${directory}/${path}.csv`)
    const records = parse(data, {
        relaxColumnCount: true
    })
    return records
}