// 박세호, 인증 유저에 대한 접근 추가 필요, 수정정보 요청, 요청성공시 메인페이지로 이동.

// 비인증 사용자에 대한 url 접근 막아야함.
import { RootState } from "../../store/store";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userDetail } from "../../lib/withTokenApi";
import { updateUserApi } from "../../lib/withTokenApi";
import { useSelector } from "react-redux";
import UserImgForm from "./UserImgForm";

import styles from "./EditUserInfoForm.module.scss";
import Modal from "../ui/Modal";
import { checkNickname } from "../../lib/generalApi";
import { useDispatch } from "react-redux";
import { userInfoEdit } from "../../store/auth";

// html input 태그에서 value의 type에 null이 매칭이 안되서 임의로 undefined로 수정하였습니다.
interface UserEditState {
  username: string | undefined;
  fullname: string | undefined;
  nickname: string | undefined;
  introduce: string | undefined;
  userImg: string | undefined;
  isPrivate: number | undefined; // html상의 type이 매칭이 안되서 임의로 number => boolean 로 수정하였습니다.
}

const EditUserInfoForm: React.FC = () => {
  // 성공이후 페이지이동을 위한 navigate 객체 생성
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.auth.userInfo.id);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userNickname = useSelector(
    (state: RootState) => state.auth.userInfo.nickname
  );
  const dispatch = useDispatch();
  const [submitState, setSubmitState] = useState(true);
  const [content, setContent] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openCompleteModal, setOpenCompleteModal] = useState(false);

  const [option, setOption] = useState<UserEditState>({
    username: "",
    fullname: "",
    nickname: "",
    introduce: "",
    userImg: "",
    isPrivate: 0,
  });

  const closeModal = () => {
    setOpenModal(false);
  };

  const closeCompleteModal = () => {
    navigate("/", { replace: true });
  };

  function checkNicknameHandler(event: React.MouseEvent) {
    event.preventDefault();
    checkNickname(option.nickname)
      .then((res) => {
        setOpenModal(true);
        setContent("사용 가능한 닉네임입니다.");
        setSubmitState(true);
      })
      .catch((err) => {
        setOpenModal(true);
        setContent("사용 불가능한 닉네임입니다.");
        setSubmitState(false);
      });
  }

  function submitHandler(event: React.FormEvent) {
    event.preventDefault();
    if (option.nickname === userNickname || submitState) {
      updateUserApi(userId, option)
        .then((res) => {
          setContent("회원정보 수정이 완료되었습니다.");
          updateUserApi(userId, option).then((res) => {
            dispatch(userInfoEdit(option.nickname));
            setOpenCompleteModal(true);
          });
        })
        .catch((err) => {
          console.log(err);
          setContent("닉네임 중복을 확인해주세요!");
          setOpenModal(true);
        });
    } else {
      setContent("닉네임 중복을 확인하세요.");
      setOpenModal(true);
    }
  }
  // 닉네임 수정하러 가기
  const nickNameUpdateHandler = (event: React.MouseEvent) => {
    event.preventDefault();
    setSubmitState(false);
  };

  useEffect(() => {
    if (isLoggedIn) {
      userDetail().then((res) => {
        const currentState: UserEditState = {
          username: res.username,
          fullname: res.fullname,
          nickname: res.nickname,
          introduce: res.introduce,
          userImg: res.userImg,
          isPrivate: res.isPrivate,
        };
        setOption(currentState);
      });
    } else {
      alert("잘못된 접근입니다.");
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={styles.center}>
      <div className={styles.form}>
        <div className={styles.card}>
          <div className={styles.title}>
            <div>회원정보 수정</div>
            <button
              onClick={() => {
                navigate("/account/withdrawal");
              }}
            >
              회원탈퇴
            </button>
          </div>
          <form>
            <div>
              <div className={styles.email}>
                <div className={styles.emailLabel}>
                  <div className={styles.e1}>
                    <label htmlFor="email">이메일</label>
                  </div>
                  <div className={styles.e2}>
                    <label htmlFor="email">필수항목*</label>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    id="email"
                    value={option.username}
                    readOnly
                    onChange={(event) => {
                      setOption({ ...option, username: event.target.value });
                    }}
                  />
                  <div className={styles.changeEmail}>
                    이메일을 변경하시려면 운영자에게 이메일을 보내주세요.
                  </div>
                </div>
              </div>
              <div className={styles.password}>
                <div>비밀번호</div>
                <button
                  onClick={() => {
                    navigate("/account/updatePw");
                  }}
                >
                  비밀번호 변경
                </button>
              </div>
              <div className={styles.name}>
                <div className={styles.nameLabel}>
                  <div className={styles.e1}>
                    <label htmlFor="username">이름</label>
                  </div>
                  <div className={styles.e2}>
                    <label htmlFor="username">필수항목*</label>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  id="username"
                  value={option.fullname}
                  readOnly
                  onChange={(event) => {
                    setOption({ ...option, fullname: event.target.value });
                  }}
                />
              </div>
              <div className={styles.nickname}>
                <div className={styles.nicknameLabel}>
                  <div className={styles.e1}>
                    <label htmlFor="nickname">닉네임</label>
                  </div>
                  <div className={styles.e2}>
                    <label htmlFor="nickname">필수항목*</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input
                      type="text"
                      required
                      id="nickname"
                      readOnly={submitState ? true : false}
                      maxLength={8}
                      value={option.nickname}
                      onChange={(event) => {
                        setOption({ ...option, nickname: event.target.value });
                      }}
                    />
                    {submitState ? (
                      <button onClick={nickNameUpdateHandler}>수정</button>
                    ) : (
                      <button onClick={checkNicknameHandler}>중복확인</button>
                    )}
                  </div>
                  <div className={styles.explain}>
                    다른 유저와 겹치지 않는 자신만의 별명을 입력하세요.(2 ~ 8자)
                  </div>
                </div>
              </div>{" "}
              <div className={styles.introduce}>
                <div className={styles.introduceLabel}>
                  <div className={styles.e1}>
                    <label htmlFor="introduce">한줄 소개</label>
                  </div>
                </div>
                <input
                  id="introduce"
                  value={option.introduce}
                  placeholder="자신을 한줄로 표현해보세요."
                  maxLength={25}
                  onChange={(event) => {
                    setOption({ ...option, introduce: event.target.value });
                  }}
                />
              </div>{" "}
              <div className={styles.isPrivate}>
                <div>프로필 공개 여부</div>
                <label htmlFor="false">
                  <input
                    type="radio"
                    required
                    checked={!option.isPrivate}
                    id="false"
                    name="is_private"
                    value={0}
                    onClick={(event) => {
                      let prevIsPrivate = option.isPrivate;
                      prevIsPrivate = 0;
                      setOption({ ...option, isPrivate: prevIsPrivate });
                    }}
                  />
                  공개
                </label>
                <label htmlFor="true">
                  <input
                    type="radio"
                    required
                    checked={!!option.isPrivate}
                    value={1}
                    id="true"
                    name="is_private"
                    onClick={(event) => {
                      let prevIsPrivate = option.isPrivate;
                      prevIsPrivate = 1;
                      setOption({ ...option, isPrivate: prevIsPrivate });
                    }}
                  />
                  비공개
                </label>
              </div>{" "}
              <div className={styles.profile}>
                <div className={styles.title}>프로필 이미지</div>
                <div>
                  <UserImgForm />
                </div>
              </div>
              <button
                type="button"
                onClick={submitHandler}
                className={styles.submit}
              >
                회원 정보 수정
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal open={openModal} close={closeModal} header="안내">
        <div>{content}</div>
      </Modal>
      <Modal open={openCompleteModal} close={closeCompleteModal} header="안내">
        <div>{content}</div>
      </Modal>
    </div>
  );
};

export default EditUserInfoForm;
