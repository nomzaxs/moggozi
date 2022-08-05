import KakaoLogin from "./KakaoLogin";
import NaverLogin from "./NaverLogin";
import GoogleLogin from "./GoogleLogin";
import Modal from "../ui/Modal";

import React, { useRef, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../lib/generalApi";
import Cookie from "js-cookie";
import moment from "moment";
import { login } from "../../store/auth";

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 로그인 에러 시 alert 대신 modal
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const loginCloseModal = () => {
    setLoginModalOpen(false);
  };

  // input값 가져오기
  const inputEmail = useRef<HTMLInputElement>(null);
  const inputPw = useRef<HTMLInputElement>(null);

  // 현재 페이지에서 login 버튼
  function loginHandler(event: React.FormEvent) {
    Cookie.remove("refreshToken");
    event.preventDefault();

    // 입력된 input값 변수에 담기
    const enteredEmail = inputEmail.current!.value;
    const enteredPw = inputPw.current!.value;

    // 둘다 비어있다면 에러 출력 / 이후에 수정해야함.
    // 정합성 검사
    // axios.defaults.withCredentials = true;
    if (enteredEmail.trim().length === 0 || enteredPw.trim().length === 0) {
      alert("입력을 해주세요.");
      return;
    } else {
      const option = { username: enteredEmail, password: enteredPw };
      loginApi(option)
        .then((res) => {
          dispatch(login(res));
          sessionStorage.setItem("accessToken", res.accessToken);
          sessionStorage.setItem(
            "expiresAt",
            moment().add(1, "hour").format("yyyy-MM-DD HH:mm:ss")
          );
          Cookie.set("refreshToken", res.refreshToken, { secure: true });
          navigate("/");
        })
        .catch((err) => {
          setLoginModalOpen(true);
          console.log(err);
        });
    }
  }

  const reIssueHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    navigate('/account/passwordReissue')
  }

  // 이미 로그인해 있을 경우 메인페이지로 이동시킴
  const token = sessionStorage.getItem("accessToken");
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div>
      <h3>Login form</h3>
      <div>
        <form onSubmit={loginHandler}>
          <div>
            <label htmlFor="email">email : </label>
            <input type="text" required id="email" ref={inputEmail} />
          </div>
          <div>
            <label htmlFor="password">password : </label>
            <input type="password" required id="password" ref={inputPw} />
          </div>
          <p onClick={ reIssueHandler }>비밀번호를 잊으셨나요?</p>
          <button type="submit">Login</button>
        </form>
        <React.Fragment>
          <Modal
            open={loginModalOpen}
            close={loginCloseModal}
            header="로그인 에러"
          >
            <p>비밀번호가 틀렸습니다.</p>
          </Modal>
        </React.Fragment>
        <p>
          <KakaoLogin />
        </p>
        <p>
          <NaverLogin />
        </p>
        <p>
          <GoogleLogin />
        </p>
        <p></p>
        {/* <SocialLoginForm value={"KAKAO"}></SocialLoginForm>
        <SocialLoginForm value={"GOOGLE"}></SocialLoginForm> */}
      </div>
    </div>
  );
};

export default LoginForm;