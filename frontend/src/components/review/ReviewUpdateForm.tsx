import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchReview, reviewUpdate } from "../../lib/withTokenApi";
import { ReviewState, reviewFetch } from "../../store/review";

// Rating 관련 import
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";

import styles from "./ReviewUpdateForm.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Modal from "../ui/Modal";

const ReviewUpdateForm: React.FC<{
  review: ReviewState;
  closeHandler: () => void;
}> = ({ review, closeHandler }) => {
  const dispatch = useDispatch();
  const contentInputRef = useRef<HTMLInputElement>(null);
  const userId = useSelector((state: RootState) => state.auth.userInfo.id);
  const { id } = useParams();
  const [inputs, setInputs] = useState({ content: review.content || "" });
  const [rate, setRate] = useState(review.rate || 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [alertText, setAlertText] = useState(<div></div>);
  const { content } = inputs;

  const closeAlertModal = () => {
    document.body.style.overflow = "unset";
    setModalOpen(false);
  };

  useEffect(() => {
    if (!modalOpen) {
      document.body.style.overflow = "auto"; //모달때문에 이상하게 스크롤이 안되서 강제로 스크롤 바 생성함
      document.body.style.height = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  }, [modalOpen]);

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const { name, value } = event.target; // 우선 e.target 에서 content와 value 를 추출
    setInputs({
      ...inputs, // 기존의 input 객체를 복사한 뒤
      [name]: value, // content 키를 가진 값을 value 로 설정
    });
  };

  const reviewSubmitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    if (review.writer.id !== userId) {
      setAlertText(<div>내가 작성한 글만 수정 가능합니다.</div>);
      setModalOpen(true);
      return;
    }
    if (rate === 0) {
      setAlertText(<div>평점을 입력해주세요.</div>);
      setModalOpen(true);
      return;
    }
    if (!content) {
      setAlertText(<div>내용을 입력해주세요.</div>);
      setModalOpen(true);
      return;
    }
    const reviewData = {
      rate: rate!,
      reviewContent: content!,
      reviewId: review.id!,
    };
    console.log(reviewData);
    reviewUpdate(reviewData, Number(id)).then((res) => {
      setAlertText(<div>review 수정이 완료되었습니다.</div>);
      setModalOpen(true);
      fetchReview(Number(id))
        .then((res) => {
          dispatch(reviewFetch(res));
          closeHandler();
        })
        .catch((err) => {
          console.log(err.response);
        });
    });
  };

  ///// Rating 관련 코드
  const [value, setValue] = React.useState<number | null>(review.rate || 0);

  return (
    <div className={styles.reviewForm}>
      <img
        src="https://i1.daumcdn.net/thumb/C230x300/?fname=https://blog.kakaocdn.net/dn/CUI4O/btqIarIJfHs/LxRhxkC8CcQ19Dyy8Wf6bK/img.jpg"
        alt=""
      />
      <div>{review.writer.img}</div>
      <form>
        <Box sx={{ "& > legend": { mt: 2 }, mb: 1, mt: 2 }}>
          <Rating
            name="rate"
            value={value}
            onChange={(event, newValue) => {
              console.log(newValue);
              if (newValue != null) {
                setRate(newValue);
              }
              setValue(newValue);
            }}
          />
        </Box>
        <div className={styles.input}>
          <input
            name="content"
            placeholder="수정할 내용"
            type="text"
            required
            id="content"
            onChange={onChangeHandler}
            value={content}
            ref={contentInputRef}
          />
          <div className={styles.reviewSubmit} onClick={reviewSubmitHandler}>
            수정
          </div>
        </div>
      </form>
      <Modal open={modalOpen} close={closeAlertModal} header="안내">
        {alertText}
      </Modal>
    </div>
  );
};
export default ReviewUpdateForm;
