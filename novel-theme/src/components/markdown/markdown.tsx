import "./markdown.scss";
import showdown from "showdown";
import { ExhibitItem } from "../../api/interface";
import { getExhibitDepFileStream } from "../../api/freelog";
import { useEffect, useState } from "react";

showdown.setOption("tables", true);
showdown.setOption("tasklists", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("openLinksInNewWindow", true);
showdown.setOption("backslashEscapesHTMLTags", true);
showdown.setOption("emoji", true);

export const Markdown = (props: { data: { content: string; exhibitInfo: ExhibitItem } }) => {
  const { content, exhibitInfo } = props.data;
  const [html, setHtml] = useState({ __html: "" });

  const getContent = async () => {
    let __html = "";
    setHtml({ __html });

    if (!content || !exhibitInfo) return;

    const { exhibitProperty, dependencyTree } = exhibitInfo.versionInfo;
    if (exhibitProperty.mime === "text/markdown") {
      // markdown 文件，以 markdown 解析
      const converter = new showdown.Converter();
      __html = converter.makeHtml(content);
    } else {
      __html = content;
    }

    const deps = dependencyTree.filter((_: any, index: number) => index !== 0);
    let promiseArr = [] as Promise<any>[];
    deps.forEach((dep) => {
      const isMediaResource =
        dep.resourceType.includes("图片") || dep.resourceType.includes("视频") || dep.resourceType.includes("音频");
      const depContent: Promise<any> = getExhibitDepFileStream(
        props.data!.exhibitInfo.exhibitId,
        dep.parentNid,
        dep.articleId,
        isMediaResource
      );
      promiseArr.push(depContent);
    });

    await Promise.all(promiseArr).then((res) => {
      res.forEach((dep, index) => {
        if (dep.data) {
          // 进一步判断是否为文本文件
          if (!dep.headers["content-type"].startsWith("text")) return;

          // 返回数据是对象，切有data属性，说明该依赖未非媒体资源
          const reg = new RegExp(`{{freelog://${deps[index].articleName}}}`, "g");
          const converter = new showdown.Converter();
          const data = converter.makeHtml(dep.data);
          __html = __html.replace(reg, data);
        } else {
          // 媒体资源
          const reg = new RegExp(`src=['"]freelog://${deps[index].articleName}['"]`, "g");
          __html = __html.replace(reg, `src="${dep}"`);
        }
      });
    });

    // 隐藏视频与音频的下载按钮
    __html = __html.replace(/<video/g, '<video controlslist="nodownload"');
    __html = __html.replace(/<audio/g, '<audio controlslist="nodownload"');
    setHtml({ __html });
  };

  useEffect(() => {
    getContent();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const content = document.getElementById("content");
    if (!content) return;

    content.oncontextmenu = function (e) {
      e = e || window.event;
      return false;
    };
  }, []);

  return exhibitInfo.versionInfo.exhibitProperty.mime === "text/markdown" ? (
    <div id="content" className="markdown-wrapper" dangerouslySetInnerHTML={html}></div>
  ) : (
    <div id="content" className="txt-wrapper">
      {content}
    </div>
  );
};
