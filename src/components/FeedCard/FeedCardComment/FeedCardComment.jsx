/** @jsxImportSource @emotion/react */
import * as s from "./style";
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { deleteFeedComment, feedCommentRequest, searchFeedComment, updateFeedComment } from '../../../apis/api/feed';
import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineDelete } from "react-icons/ai";
import { TbDotsVertical } from "react-icons/tb";

import userImg from "../../../assets/images/userProfileNone.png"

function FeedCardComment({feedId}) {
  const queryClient = useQueryClient();
  const principalData = queryClient.getQueryData("principalQuery")
  const [commentSaveInputValue, setCommentSaveInputValue] = useState("");
  const [commentList, setCommentList] = useState([]);
  const [putCommentId, setPutCommentId] = useState(0);
  const [putChangeComment, setPutChangeComment] = useState("");
  const inputFocusRef = useRef(""); 

  // useEffect(() => {
  //   inputFocusRef.current.focus()
  // }, [putChangeComment])

  //댓글 get
  const searchFeedCommentQuery = useQuery(
    ["searchFeedCommentQuery", feedId],
    () => searchFeedComment(feedId),
    {
      retry:0,
      refetchOnWindowFocus: false,
      onSuccess: response => {
        console.log("댓글리스트");
        console.log(response);
        setCommentList(response.data);
      },
      onError: error => {
        console.log(error);
      }
    }

  )

  // 댓글 작성
  const saveFeedCommentMutation = useMutation({
    mutationKey: "saveFeedCommentMutation",
    mutationFn: feedCommentRequest,
    onSuccess: response => {
      console.log("작성됨" + response);
      searchFeedCommentQuery.refetch();
    },
    onError: error => {
      console.log(error);
    }
  })

  // 댓글 수정
  const putFeedCommentMutation = useMutation({
    mutationKey: "putFeedCommentMutation",
    mutationFn: updateFeedComment,
    onSuccess: response => {
      console.log("수정됨" + response);
      searchFeedCommentQuery.refetch()
      setPutCommentId(0)
    },
    onError: error => {
      console.log(error);
    }
  })
  
  //댓글 삭제
  const deleteFeedCommentMutation = useMutation({
    mutationKey: "deleteFeedCommentMutation",
    mutationFn: deleteFeedComment,
    onSuccess: response => {
      console.log("삭제됨" + response);
      searchFeedCommentQuery.refetch()
    },
    onError: error => {
      console.log(error);
    }
  })



  // 댓글 save 버튼
  const addClickSaveComment = () => {
    saveFeedCommentMutation.mutate({
      feedId: feedId,
      commentContent: commentSaveInputValue,
    })
  }

  // 댓글 put 버튼
  const putClickFeedComment = (commentId, userId) => {
    putFeedCommentMutation.mutate({
      commentId: commentId,
      feedId: feedId,
      commentUserId: userId,
      commentContent: putChangeComment,
    })
  }

  // 댓글 삭제 버튼
  const deletClickFeedComment = (commentId) => {
    deleteFeedCommentMutation.mutate(commentId)
  }

  // 수정 input 창 open 
  const openClickCommentInput = (feedCommentId) => {
    setPutCommentId(feedCommentId)
  }

  return (
    <div css={s.commentRootLayout}>
      {
        commentList.map(comment => (
          comment.feedCommentId === putCommentId 
          ?
          // 수정클릭 했을때 input창
          <div key={comment.feedCommentId}>
            {/* 원래 댓글 보여주기 */}
            <div css={s.commentContentLayout}>
              <img 
                css={s.commentProfileImg}
                src={
                  !!comment.feedCommentUserProfileImgUrl 
                  ? comment.feedCommentUserProfileImgUrl 
                  : userImg
                } alt="" 
              />
              <div css={s.contents}>
                <h4>{comment.feedCommentNickName}</h4>
                <span css={s.commentContent}>{comment.feedCommentContent}</span>
              </div>
            </div>
            {/* 수정 댓글 input 창 */}
            <div css={s.editCommentLayout}>
              <span>댓글수정</span>
              <input 
                css={s.feedCommentInput}
                // ref={inputFocusRef}
                type="text" 
                defaultValue={comment.commentContent}
                onChange={(e) => setPutChangeComment(e.target.value)}
                />
              <div css={s.editingCommentButton}>
                <button onClick={() => putClickFeedComment(comment.feedCommentId, comment.feedCommentUserId)}>수정</button>
                <button onClick={() => setPutCommentId(0)}>취소</button>
              </div>
            </div>
          </div>
          :
          <div key={comment.feedCommentId} >
              <div css={s.commentContentLayout}>
                <img 
                  css={s.commentProfileImg}
                  src={
                    !!comment.feedCommentUserProfileImgUrl 
                    ? comment.feedCommentUserProfileImgUrl 
                    : userImg
                  } alt="" 
                />
                
                <div css={s.contents}>
                  <h4>{comment.feedCommentNickName}</h4>
                  <span css={s.commentContent}>{comment.feedCommentContent}</span>
                  
                  {
                    comment.feedCommentUserId === principalData.data.userId
                    ?
                    <div>
                      <div css={s.editCommentButton}>
                        <button onClick={() => openClickCommentInput(comment.feedCommentId)}><AiOutlineEdit /></button>
                        <button onClick={() => deletClickFeedComment(comment.feedCommentId)}><AiOutlineDelete /></button>
                      </div>
                    </div>
                    :
                    <div></div>
                  }

                  <div css={s.commentMenu}>
                    <button ><TbDotsVertical /></button>
                  </div>

                </div>
              </div>
          </div>

        ))
      }

      <div css={s.addCommentLayout}>
        <span>댓글작성</span>
        <input 
          css={s.feedCommentInput}
          type="text" 
          value={commentSaveInputValue}
          placeholder='댓글 입력'
          onChange={e => setCommentSaveInputValue(e.target.value)}
        />
        <button css={s.addCommentButton} onClick={addClickSaveComment}>등록</button>
      </div>
    </div>
  );
}

export default FeedCardComment;