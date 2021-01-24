import { FC } from "react"

type Type = {
  applications: any;
}
const SAResults: FC<Type> = ({ applications }) => {
  return <div className="my-4 flex flex-col">
    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Application ID
      </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Echo Mean (ms)
      </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Small Image Mean (ms)
      </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Medium Image Mean (ms)
      </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Large Image Mean (ms)
      </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(applications).map((application: any) => <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {application}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {applications[application]["echo"]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {applications[application]["image"][0]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {applications[application]["image"][1]}
      </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {applications[application]["image"][2]}
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
}
export default SAResults