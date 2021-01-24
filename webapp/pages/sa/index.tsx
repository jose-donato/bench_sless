import { getFile, getFiles } from "lib/getSAresults";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
} from 'recharts';
import Layout from "components/Layout";
import Card from "components/Card";
import SAResults from "components/tables/SAresults";


const CustomizedAxisTick = ({
    x, y, payload,
}: any) => (
    <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
    </g>
);

const SA = ({ files, frameworks, tests, total }: any) => {
    return <Layout>
        <div className="flex flex-col container mx-auto">
            <h1 className="text-xl font-bold text-center my-4 text-gray-800">Benchmarking serverless and non serverless applications</h1>
            <Card title="Charts" extraStyles="flex overflow-x-scroll">
                <div>
                    <h4>ECHO TEST</h4>
                    <LineChart
                        width={650}
                        height={300}
                        data={tests.echo}
                        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis height={80} interval={0} dataKey="name" tick={<CustomizedAxisTick />}>
                            <Label value="Experience id" offset={60} position="insideTop" />
                        </XAxis>
                        <YAxis height={80}>
                            <Label value="Average Time (ms)" offset={30} position="insideBottomLeft" angle={-90} />
                        </YAxis>
                        <Tooltip />
                        <Legend />
                        {frameworks.map((framework: any) => <Line type="monotone" dataKey={framework.application} stroke={framework.color} activeDot={{ r: 8 }} />)}
                    </LineChart>
                </div>
                {Object.keys(tests.image).map((key: string) => (
                    <div>
                        <h4>{key.toUpperCase()} IMAGE TEST</h4>
                        <LineChart
                            width={650}
                            height={300}
                            data={tests.image[key]}
                            margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis height={80} interval={0} dataKey="name" tick={<CustomizedAxisTick />}>
                                <Label value="Experience id" offset={60} position="insideTop" />
                            </XAxis>
                            <YAxis height={80}>
                                <Label value="Average Time (ms)" offset={10} position="insideBottomLeft" angle={-90} />
                            </YAxis>
                            <Tooltip />
                            <Legend />
                            {frameworks.map((framework: any) => <Line type="monotone" dataKey={framework.application} stroke={framework.color} activeDot={{ r: 8 }} />)}
                        </LineChart>
                    </div>
                ))}
            </Card>
            <SAResults applications={total} />
            <Card title="Experiences Results" extraStyles="flex overflow-x-scroll text-sm">
                {files.map((file: any) => <div className="mr-16">
                    <h1 className="text-base font-semibold">{`e-${file.configuration.time}-${file.configuration.parallelism}`}</h1>
                    <h3>{file.date}</h3>
                    <p className="">duration: {file.configuration.time}, parallelism: {file.configuration.parallelism}</p>
                    {file.results.map((endpoint: any) => <div>
                        <p className="font-semibold mt-2 mb-1">{endpoint.application}</p>
                        <p><span className="underline">Median echo:</span> {endpoint.echo.mean}</p>
                        <p><span className="underline">Median small image:</span> {endpoint.image[0].mean}</p>
                        <p><span className="underline">Median medium image:</span> {endpoint.image[1].mean}</p>
                        <p><span className="underline">Median large image:</span> {endpoint.image[2].mean}</p>
                    </div>)}
                </div>)}
            </Card>

            {/*
        <ul>
            {files.map((file: any) => <li key={file.id}>
                <Link href={`/sa/${file.path}`}>
                    <a>
                        {file.path}
                    </a>
                </Link>
            </li>)}
        </ul>
        */}
        </div>
    </Layout>
}

export const getStaticProps = async () => {
    const rawFiles = getFiles()
    const frameworks = [] as any

    const tests = {
        "echo": [] as any,
        "image": {
            "small": [] as any,
            "medium": [] as any,
            "large": [] as any,
        }
    }

    const colors = ["#000000", "#00AD9F", "#3C873A"]

    const files = rawFiles.map((file: string) => {
        //const path = file.slice(0, -4)
        const [date, conf] = file.split("__")
        const [time, parallelism] = conf.split(".json")[0].split("_")
        const results = getFile(file)
        const confString = `e-${time}-${parallelism}`
        const objEcho = { name: confString } as any
        const objImageSmall = { name: confString } as any
        const objImageMedium = { name: confString } as any
        const objImageLarge = { name: confString } as any
        results.forEach((result: any, idx: number) => {
            if (frameworks.length < results.length) {
                frameworks.push({ application: result.application, color: colors[idx] })
            }
            objEcho[result.application] = result.echo.mean
            objImageSmall[result.application] = result.image[0].mean
            objImageMedium[result.application] = result.image[1].mean
            objImageLarge[result.application] = result.image[2].mean
        })
        tests["echo"].push(objEcho)
        tests["image"]["small"].push(objImageSmall)
        tests["image"]["medium"].push(objImageMedium)
        tests["image"]["large"].push(objImageLarge)

        return {
            id: date,
            date,
            configuration: {
                time,
                parallelism
            },
            path: file,
            results
        }
    })

    const total = {} as any
    frameworks.forEach((framework: any) => {
        const totalEcho = tests["echo"].reduce((accumulator: number, b: any) => {
            return accumulator + b[framework.application]
        }, 0) / tests["echo"].length
        const totalImageSmall = tests["image"]["small"].reduce((accumulator: number, b: any) => {
            return accumulator + b[framework.application]
        }, 0) / tests["image"]["small"].length
        const totalImageMedium = tests["image"]["medium"].reduce((accumulator: number, b: any) => {
            return accumulator + b[framework.application]
        }, 0) / tests["image"]["medium"].length
        const totalImageLarge = tests["image"]["large"].reduce((accumulator: number, b: any) => {
            return accumulator + b[framework.application]
        }, 0) / tests["image"]["large"].length
        total[framework.application] = {
            "echo": totalEcho,
            "image": [
                totalImageSmall,
                totalImageMedium,
                totalImageLarge
            ],
        }
    })

    return {
        props: {
            files,
            frameworks,
            tests,
            total
        }
    }
}

export default SA