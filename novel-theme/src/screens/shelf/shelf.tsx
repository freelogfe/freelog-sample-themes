import "./shelf.scss";
import { useState, useEffect } from "react";
import { SearchHeader } from "../../components/header/header";
import { useHistory } from "react-router-dom";
import { CollectExhibitItem } from "../../utils/interface";
import { GetExhibitsListParams } from "../../api/freelog";
import { ShelfNovel } from "../../components/novel/novel";
import { useMyShelf } from "../../utils/hooks";

export const ShelfScreen = () => {
  const { myShelf, operateShelf } = useMyShelf();
  const [keywords, setKeywords] = useState("");
  const getBookList = (params: Partial<GetExhibitsListParams>) => {
    const { keywords = "" } = params;
    setKeywords(keywords);
  };

  useEffect(() => {
    getBookList({});
    // eslint-disable-next-line
  }, []);

  return (
    <div className="shelf-wrapper flex-column align-center">
      <SearchHeader search={getBookList}></SearchHeader>
      <ShelfBody
        shelfList={myShelf.filter((item) =>
          item.presentableTitle.includes(keywords)
        )}
        operateShelf={operateShelf}
      />
    </div>
  );
};

const ShelfBody = (props: {
  shelfList: CollectExhibitItem[];
  operateShelf: (data: CollectExhibitItem) => void;
}) => {
  const { shelfList, operateShelf } = props;

  return (
    <div className="content w-100p mw-1412 b-box bg-white">
      <div className="fs-24 mt-40 mb-20">我的书架</div>
      <div className="flex-row flex-wrap">
        {shelfList.map((item) => {
          return (
            <div className="book-box" key={item.presentableId}>
              <ShelfNovel data={item} operateShelf={operateShelf} />
            </div>
          );
        })}

        <AddBook />
      </div>
    </div>
  );
};

const AddBook = () => {
  const history = useHistory();

  return (
    <div
      className="add-book-box text-center brs-6 transition cur-pointer"
      onClick={() => history.push(`/`)}
    >
      <img
        className="w-32 h-32"
        src="https://weread-1258476243.file.myqcloud.com/web/wrwebnjlogic/image/shelf_last_add.fe952d0f.png"
        alt=""
      />
    </div>
  );
};
