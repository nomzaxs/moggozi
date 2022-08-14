import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { stageImgFetchAPI } from "../../lib/imgApi";
import {
  fetchStageProgress,
  postListRead,
  stageCancel,
  stageJoin,
} from "../../lib/withTokenApi";
import { PostData } from "../../store/post";
import {
  setPostFormButtonState,
  setPostFormModalOpen,
} from "../../store/postModal";
import { imgState, StageState } from "../../store/stage";
import { RootState } from "../../store/store";
import Carousel from "../ui/Slider";

import styles from "./StageItem.module.scss";
import "./Carousel.module.scss";
import PostList from "../post/PostList";

import Dompurify from "dompurify";

const StageItem: React.FC<{
  stage: StageState;
  index: number;
  challengeProgress: number;
}> = ({ stage, index, challengeProgress }) => {
  document.body.style.overflow = "auto"; //모달때문에 이상하게 스크롤이 안되서 강제로 스크롤 바 생성함

  const dispatch = useDispatch();
  const [postStageListState, setPostStageListState] = useState<PostData[]>([]);
  const [getStageImg, setStageImg] = useState<imgState[]>([]);
  const [getStageProgress, setStageProgress] = useState(0);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const user = useSelector((state: RootState) => state.auth);
  const postingStageId = useSelector(
    (state: RootState) => state.post.postingStageId
  );
  const { postFormButtonOpen } = useSelector(
    (state: RootState) => state.postModal
  );

  // 스테이지 진행도
  useEffect(() => {
    if (isLoggedIn === true) {
      fetchStageProgress(stage.id!)
        .then((res) => {
          setStageProgress(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [isLoggedIn, stage.id]);

  // 스테이지 사진
  let postedCheck = postStageListState.some((post) => {
    return post.writer!.id !== user.userInfo.id;
  });

  useEffect(() => {
    stageImgFetchAPI(stage.id!)
      .then((res) => {
        setStageImg(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [stage.id]);

  // 포스트 리스트
  useEffect(() => {
    postListRead(Number(stage.id))
      .then((res) => {
        console.log("포스팅 불러오기 성공", res);
        res.sort((a: PostData, b: PostData) =>
          a.likeNum! >= b.likeNum! ? 1 : -1
        );
        const loadedPostStageList = res.slice(0, 3);
        setPostStageListState(loadedPostStageList);
        dispatch(setPostFormButtonState(true));
      })
      .catch((err) => {
        console.log("ERR", err);
      });
  }, [dispatch, stage.id]);

  // 스테이지 도전 버튼 클릭
  const stageTryHandler = () => {
    stageJoin(stage.id!)
      .then(() => {
        alert("도전하시겠습니까?");
        setStageProgress(1);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // 스테이지 도전 취소버튼 클릭
  const stageCancelHandler = () => {
    stageCancel(stage.id!)
      .then(() => {
        alert("취소하시겠습니까?");
        setStageProgress(0);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <div className={styles.stageInfo}>
        <div className={styles.carouesl}>
          <Carousel>
            {/* 여기서 map으로 div태그 안에 이미지 출력하면 된다. 밑의 3개는 임시 사진.*/}
            {Array.isArray(getStageImg) && getStageImg.length !== 0 ? (
              getStageImg.map((img) => {
                return <img key={img.id!} src={img.url!} alt="" />;
              })
            ) : (
              <img
                src="https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbgHC4M%2FbtqBVf8rCqB%2FZz5aJuALI4JSKV8ZKAm8YK%2Fimg.jpg"
                alt=""
              />
            )}
          </Carousel>
        </div>
        <div className={styles.content}>
          <div>{index + 1}단계</div>
          <div>{stage.name}</div>
          <div
            dangerouslySetInnerHTML={{
              __html: Dompurify.sanitize(stage.content!.toString()),
            }}
            className="view ql-editor"
          ></div>
        </div>
      </div>
      <div className={styles.btnPosition}>
        {/* 챌린지를 도전해야 포스팅 CRUD 가능 */}
        {challengeProgress !== 0 &&
          postFormButtonOpen &&
          isLoggedIn &&
          postingStageId && (
            <div>
              {postedCheck ? (
                // 포스팅 모달 연결해야한다.
                <button>내 포스팅 보기</button>
              ) : (
                <button onClick={() => dispatch(setPostFormModalOpen(true))}>
                  포스팅하기
                </button>
              )}
            </div>
          )}
      </div>

      <div className={styles.horizon}></div>

      <div className={styles.postTitle}>
        <div>포스트</div>
        <Link to={`/post/${stage.id}`}>더보기</Link>
      </div>

      <div>{postStageListState && <PostList posts={postStageListState} />}</div>
    </div>
  );
};
export default StageItem;
