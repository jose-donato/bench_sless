import { FC } from "react"

type Props = {
    title?: string;
    extraStyles?: string;
}
const Card: FC<Props> = ({ children, extraStyles = "", title }) => (<div className="rounded-lg bg-white shadow-lg px-8 pb-4 pt-3 my-4">
    {title && <h1 className="mb-4 text-lg text-center font-semibold">{title}</h1>}
    <div className={extraStyles}>
    {children}
    </div>
</div>)

export default Card