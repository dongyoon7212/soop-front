/** @jsxImportSource @emotion/react */
import * as s from "./style";
import { useMutation, useQueryClient } from "react-query";
import { useMemo, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../apis/firebase/firebaseConfig";
import ReactQuill from "react-quill";
import { lunchRequest } from "../../apis/api/lunch";
import { useQuillContent } from "../../hooks/quillContent";
import LunchMap from "./LunchMap/LunchMap";
import {
  lunchMapPlaceUrlState,
  lunchMapTitlState,
  lunchMapXState,
  lunchMapYState,
} from "../../atoms/luchMapAtom";
import { useRecoilState } from "recoil";
import { lunchCategories } from "../../constants/lunchCategroies";

function LunchWrite(props) {
  // const reactQuillRef = useRef();
  // const [urls, setUrls] = useState([]);

  // const quillImageHandler = useCallback(() => {
  //   const input = document.createElement("input");
  //   input.setAttribute("type", "file");
  //   input.setAttribute("accept", "image/*");
  //   input.setAttribute("multiple", "true")
  //   input.click();

  //   input.onchange = async () => {

  //     const files = Array.from(input.files);

  //     for (let file of files) {
  //       const storageRef = ref(storage, `quill_image/${file.name}`);
  //       const uploadResponse = await uploadBytes(storageRef, file);
  //       const downloadURL = await getDownloadURL(uploadResponse.ref);

  //       const editor = reactQuillRef.current.getEditor();
  //       const range = editor.getSelection(true);
  //       editor.insertEmbed(range.index, "image", downloadURL);
  //       editor.setSelection(range.index + 1);
  //     }

  //   }

  // }, []);

  // const handleQuillEditorOnChange = (value) => {
  //   const tempValue = value;
  //   const div = document.createElement("div");
  //   div.innerHTML = value;
  //   console.log(value);
  //   const imgs = div.querySelectorAll("img");
  //   const imgSrcList = Array.from(imgs).map(img => img.src);
  //   console.log(imgSrcList)
  // }

  // const modules = useMemo(() => ({
  //   toolbar: {
  //     container: [
  //       ["image"]
  //     ],
  //     handlers: {
  //       image: quillImageHandler
  //     }
  //   }
  // }), []);

  const queryClient = useQueryClient();
  const principalData = queryClient.getQueryData("principalQuery");
  const [lunchTitle, setLunchTitle] = useState("");
  const [placeName, setPlaceName] = useRecoilState(lunchMapTitlState);
  const [placeX, setPlaceX] = useRecoilState(lunchMapXState);
  const [placeY, setPlaceY] = useRecoilState(lunchMapYState);
  const [placeUrl, setPlaceUrl] = useRecoilState(lunchMapPlaceUrlState);
  const [uploadPhotos, setUploadPhotos] = useState([]);
  const [lunchContent, lunchContentChange, lunchContentMessage] = useQuillContent("quilContent");
  const [checkCategories, setcheckCategories] = useState([]);
  const [laodPhotos, setLoadPhotos] = useState([]);
  const imgFileRef = useRef();

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ size: ["small", false, "large", "huge"] }],
        [{ align: [] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
      ],
    },
  }));

  const saveLunch = useMutation({
    mutationKey: "saveLunch",
    mutationFn: lunchRequest,
    onSuccess: (response) => {
      alert("작성이 완료되었습니다.");
      // window.location.replace("/")
      // saveFeedList(principalData.data.userId, newFeedContent, contentImg);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  // 사진 선택하면 상태 두게에 값 넣기
  // 1. firebase 주소로 변경할 상태 setUploadPhotos
  // 2. 미리보기를 보여주기위한 상태 setLoadPhotos
  const handleFileChange = (e) => {
    const fileArray = Array.from(e.target.files);

    if (fileArray.length === 0) {
      imgFileRef.current.value = "";
      return;
    }

    setUploadPhotos(fileArray);

    const filePromiseArray = fileArray.map(
      (file) =>
        new Promise((resolve) => {
          const fileReader = new FileReader();

          fileReader.onload = (e) => {
            resolve(e.target.result);
          };

          fileReader.readAsDataURL(file);
        })
    );

    Promise.all(filePromiseArray).then((result) => {
      setLoadPhotos(() =>
        result.map((dataUrl, index) => {
          return {
            id: index + 1,
            dataUrl,
          };
        })
      );
    });
  };

  // 사진과 글 내용 post로 요청 보내기
  const handleImageUpload = () => {
    if (lunchContent === "") {
      alert("글 내용을 입력하세요");
      return;
    }
    if (!placeName || !placeX || !placeY) {
      console.log(placeName);
      console.log(placeX);
      console.log(placeY);
      alert("지도를 검색하여 가게를 선택해 주세요!");
      return;
    }

    const uploadPromises = [];

    uploadPhotos.forEach((file) => {
      const storageRef = ref(
        storage,
        `soop/lunch/${principalData.data.userId}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      const promise = new Promise((resolve) => {
        uploadTask.on(
          "state_changed", // uploadTask 상태가 변할때마다 snapshot 상태를 kb 백분율로 찍음
          (snapshot) => {},
          (error) => {
            console.log(error);
          },
          () => {
            // 업로드 완료시 동작하는 로직
            getDownloadURL(storageRef).then((url) => {
              resolve(url);
            });
          }
        );
      });
      uploadPromises.push(promise);
    });

    Promise.all(uploadPromises)
      .then((urls) => {
        console.log(urls);
        saveLunch.mutate({
          userId: principalData.data.userId,
          lunchTitle: lunchTitle,
          lunchContent: lunchContent,
          lunchCategories: checkCategories,
          placeName: placeName,
          placeX: placeX,
          placeY: placeY,
          placeUrl: placeUrl,
          lunchImgUrls: urls,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // category가 변경될 때 실행되는 함수
  const handleCategoryChange = (categoryNumber, isChecked) => {
    // category의 boolean 상태에 따라 배열 업데이트
    if (isChecked) {
      setcheckCategories((prevCheckedCategory) => [
        ...prevCheckedCategory,
        categoryNumber,
      ]);
    } else {
      setcheckCategories((prevCheckedCategory) =>
        prevCheckedCategory.filter((category) => category !== categoryNumber)
      );
    }
  };

  const onChangeTitle = (e) => {
    setLunchTitle(e.target.value);
  };


  return (
    <div css={s.writeLunchLayout}>
      {/* 가게이름 */}
      <input
        placeholder="가게이름(지도를 검색해주세요)"
        css={s.restaurantNameInput}
        value={placeName}
        disabled
      />

      <div css={s.lunchAddLayout}>
        <div css={s.categoryLayout}>
          {lunchCategories.map((categroy) => {
            return (
              <div css={s.checkLayout}>
                <div css={s.checkContainer}>
                  <input
                    id={`chk${categroy.id}`}
                    css={s.checkIntput}
                    type="checkbox"
                    onChange={(e) =>
                      handleCategoryChange(categroy.id, e.target.checked)
                    }
                  />
                  <label for={`chk${categroy.id}`}></label>
                  <div css={s.checkIcon}>{categroy.label}</div>
                </div>
                <span>{categroy.value}</span>
              </div>
            );
          })}
        </div>

        
        <LunchMap />


        
        <div>
          미리보기
          {laodPhotos.map((photo) => (
            <div key={photo.id}>
              <img src={photo.dataUrl} alt="" />
            </div>
          ))}
        </div>

        <div >
          {/* {   
            // 이미지 2개 이상 일 때만 슬라이드
            laodPhotos.length > 1 
            ?
            <div className="slide-container">
                <Slide {...settings} 
                    prevArrow={<div css={s.slideArrow}><IoIosArrowDropleftCircle /></div>}
                    nextArrow={<div css={s.slideArrow}><IoIosArrowDroprightCircle /></div>}
                >
                    {feed.feedImgUrl.map((imgUrl, index)=> (
                        <div key={index} css={s.feedImg(imgUrl)}></div>
                    ))} 
                </Slide>
            </div>
            :
            <div className="slide-container">
                {feed.feedImgUrl.map((imgUrl, index)=> (
                    <div key={index} css={s.feedImg(imgUrl)}></div>
                ))} 
            </div>
          } */}
        </div>


        <input
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
          ref={imgFileRef}
          multiple={true}
        />
        <button onClick={() => imgFileRef.current.click()}>사진 선택</button>

        <h2>글 제목</h2>
        <input type="text" value={lunchTitle} onChange={onChangeTitle} />

        <ReactQuill
          modules={modules}
          value={lunchContent}
          style={{ width: "400px" }}
          onChange={lunchContentChange}
        />
        <div>
          {!!lunchContentMessage && <div>{lunchContentMessage.text}</div>}
        </div>

        <button onClick={() => handleImageUpload()}>작성완료</button>
      </div>

    </div>
  );
}

export default LunchWrite;
