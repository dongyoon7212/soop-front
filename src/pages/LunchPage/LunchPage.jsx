/** @jsxImportSource @emotion/react */
import * as s from "./style";

import LunchWrite from '../../components/LunchWrite/LunchWrite';
import { useState } from "react";
import { useQuery } from "react-query";
import { searchAllLunch } from "../../apis/api/lunch";
import LunchList from "../../components/LunchList/LunchList";
import LunchDetail from "../../components/LunchDetail/LunchDetail";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { lunchDetailState } from "../../atoms/lunchDetailAtom";

function LunchPage(props) {
  const navigate = useNavigate();
  const [ lunchListsData, setLunchListsData ] = useState([]);
  const [ lunchDetailData, setLunchDetailData] = useRecoilState(lunchDetailState);
  const [ writeOpen, setWriteOpen ] = useState(false);
  const [ isDetailOpen, setDetailOpen ] = useState(false);
  const [ lunchId, setLunchId ] = useState(0);

  // 랜더링 될때마다 DB에서 LIST 데이터를 get함
  const searchAllLunchQuery = useQuery("searchAllLunchQuery", searchAllLunch,
  {
    retry: 0,
    refetchOnWindowFocus: false,
    onSuccess: response => {
      console.log(response);
      setLunchListsData(() => response.data.map(response => {
        return {
          lunchId: response.lunchId,
          nickName: response.nickName,
          profileImgUrl: response.profileImgUrl,
          PlaceName: response.lunchPlaceName,
          categroies: response.lunchCategoryNames,
          title: response.lunchTitle,
          imgUrls: response.lunchImgUrls,
          content: response.lunchContent
        }
      }))
      setLunchDetailData(() =>response.data.map(response => {
        return {
          lunchId: response.lunchId,
          nickName: response.nickName,
          profileImgUrl: response.profileImgUrl,
          PlaceName: response.lunchPlaceName,
          categroies: response.lunchCategoryNames,
          title: response.lunchTitle,
          imgUrls: response.lunchImgUrls,
          content: response.lunchContent
        }
      }))
    },
    onError: error => {
      console.log(error);
    }
  })




  // 상세보기 컴포넌트 클릭 버튼
  const handleOnLunchDetail = (lunchId) => {
    setDetailOpen(!isDetailOpen)
    navigate(`/lunch/Detail?lunchId=${lunchId}`)
  }


  // 글쓰기 컴포넌트 클릭 버튼
  const handleOnLunchWrite = () => {
    setWriteOpen(!writeOpen);
  }

  return (
    <div>
      <Routes>
        <Route path='/Detail' element={<LunchDetail />}/>
      </Routes>

      <div>
        <h1>검색</h1>
      </div>

      <div>
        카테고리 필터 체크박스
      </div>

      {/* lunch List 피드 컴포넌트 */}
      <div>
        {
          lunchListsData.map(listData => (
            <div 
              key={listData.lunchId}
              onClick={() => handleOnLunchDetail(listData.lunchId)}
            >
              <LunchList
                profileImgUrl={listData.profileImgUrl}
                nickName={listData.nickName}
                placeName={listData.PlaceName}
                categroies={listData.categroies}
                title={listData.title}
                imgUrls={listData.imgUrls}
                content={listData.content}
              />
            </div>
          ))
        }
      </div>

      <div css={s.componentsLayout}>
        <h1>글쓰기 컴포넌트</h1>
        <button onClick={handleOnLunchWrite}>글쓰기</button>
        {
          writeOpen ? <LunchWrite/> : "닫힘"
        }
      </div>

      <div>
        런치피드 순위 필터 컨테이너
      </div>

    </div>
  );
}

export default LunchPage;
