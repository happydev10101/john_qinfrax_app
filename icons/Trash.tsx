import { IconProps } from "../utils/types";

const TrashIcon: React.FC<IconProps> = ({ size = 24, className = "" }) => {
    const svgSize = `${size}px`;

    return (
        <svg 
            viewBox="0 0 24 24" 
            className={className} 
            height={svgSize} 
            width={svgSize} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier"> 
                <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M9 3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4H19C19.5523 4 20 4.44772 20 5C20 5.55228 19.5523 6 19 6H5C4.44772 6 4 5.55228 4 5C4 4.44772 4.44772 4 5 4H9V3ZM6 8C6.55228 8 7 8.44772 7 9V19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19V9C17 8.44772 17.4477 8 18 8C18.5523 8 19 8.44772 19 9V19C19 20.6569 17.6569 22 16 22H8C6.34315 22 5 20.6569 5 19V9C5 8.44772 5.44772 8 6 8ZM10 12C10 11.4477 10.4477 11 11 11C11.5523 11 12 11.4477 12 12V17C12 17.5523 11.5523 18 11 18C10.4477 18 10 17.5523 10 17V12ZM14 11C13.4477 11 13 11.4477 13 12V17C13 17.5523 13.4477 18 14 18C14.5523 18 15 17.5523 15 17V12C15 11.4477 14.5523 11 14 11Z" 
                    fill="currentColor"
                ></path>
            </g>
        </svg>
    );
};

export default TrashIcon;
