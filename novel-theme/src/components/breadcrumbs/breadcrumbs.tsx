import "./breadcrumbs.scss";
import { useMyHistory } from "../../utils/hooks";
import { routerMappings } from "../../api/data";
import { useContext, useEffect, useState } from "react";
import { globalContext } from "../../router";

interface breadcrumbsItem {
  path: string;
  name: string;
}

export const BreadCrumbs = (props: { title?: string; dark?: boolean }) => {
  const { inMobile } = useContext(globalContext);
  const { switchPage, locationHistory } = useMyHistory();
  const [breadcrumbsList, setBreadcrumbsList] = useState<breadcrumbsItem[]>([]);

  useEffect(() => {
    let list: breadcrumbsItem[] = [];
    locationHistory.forEach((item) => {
      const pathname = item.split("/")[1];
      const name = routerMappings[pathname];
      const breadcrumbsItem = { path: item, name };
      list.push(breadcrumbsItem);
    });
    setBreadcrumbsList(list);
  }, [locationHistory]);

  return (
    <div
      className={`breadcrumbs-wrapper ${props.title ? "in-reader" : "normal"} ${
        props.dark && "in-dark"
      } ${inMobile && "in-mobile"}`}
    >
      {breadcrumbsList.map((item, index) => {
        return (
          <div className="breadcrumbs-item" key={item.name}>
            <div
              className={`item-title ${
                index === breadcrumbsList.length - 1 && "current"
              }`}
              onClick={() => switchPage(item.path)}
            >
              {item.name || props.title}
            </div>
            {index !== breadcrumbsList.length - 1 && (
              <div className="arrow">{">"}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
