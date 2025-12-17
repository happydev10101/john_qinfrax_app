import { IconProps } from "../utils/types";

const HistoryClock: React.FC<IconProps> = ({ size = 24, className = "" }) => {
    const svgSize = `${size}px`;

    return (
      <svg fill="currentColor" className={className} height={svgSize} width={svgSize} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Zm0-14a1 1 0 0 1 1 1v5.382l3.447 2.068a1 1 0 1 1-1 1.732l-4-2.4A1 1 0 0 1 11 12V7a1 1 0 0 1 1-1Z"/>
      </svg>
    );
};

export default HistoryClock;
