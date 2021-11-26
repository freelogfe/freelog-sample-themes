import { freelogEntrances } from "../../api/data";
import "./footer.scss";

export const Footer = () => {
  return (
    <div
      className="footer-wrapper p-absolute b-0 l-0 w-100p text-center"
      onClick={() => window.open("http://console.testfreelog.com/resource/details/60ef9c4ea11650002e840fcd")}
    >
      {freelogEntrances.map((item) => (
        <div className="footer-btn cur-pointer transition" key={item.label} onClick={() => window.open(item.url)}>
          {item.label}
        </div>
      ))}
    </div>
  );
};
