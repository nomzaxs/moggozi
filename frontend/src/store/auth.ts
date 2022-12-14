import { createSlice } from "@reduxjs/toolkit";
import Cookie from "js-cookie";

// interface(type) 을 통해 우리가 관리할 state의 형태를 먼저 잡아줌
export interface UserState {
  userInfo: UserInfo;
  isLoggedIn: boolean;
}

// 중첩문 안의 객체도 모든 타입을 지정해줘야 한다.
export interface UserInfo {
  id: number | null;
  nickname: string | null;
  img: string | undefined;
  path: string | undefined;
}

export interface followed {
  id: number | null;
  loginFollowState: number | null;
  nickname: string | null;
  userImg: string | null;
  username: string | null;
}

export interface following {
  id: number | null;
  nickname: string | null;
  userImg: string | null;
  username: string | null;
}

const initialToken = sessionStorage.getItem("accessToken");

const initialAuthState: UserState = {
  userInfo: {
    id: 0,
    nickname: null,
    img: "",
    path: "",
  },
  isLoggedIn: !!initialToken,
};

// 해당 데이터에 접근할 때에는 , useSelector 를 이용하여 state를 조회
// useDispatch를 이용하면 action을 줄 수 있다.

export const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    // 리덕스가 제공하는 현재 상태를 state 인자로 받음. // "전달받은" 인자는 action.payload
    login: (state, action) => {
      // console.log(!!action.payload.accessToken);
      state.userInfo = {
        id: action.payload.id,
        nickname: action.payload.nickname,
        img: action.payload.userImg,
        path: action.payload.path,
      };
      state.isLoggedIn = !!action.payload.accessToken;
    },
    logout: (state) => {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("expiresAt");
      sessionStorage.removeItem("id");
      Cookie.remove("refreshToken");
    },
    // 로그인 유지 관련 리듀서 // 로그인 유지 api 보고 수정해야함.
    authentication: (state, action) => {
      state.userInfo = {
        id: action.payload.id,
        nickname: action.payload.nickname,
        img: action.payload.userImg,
        path: action.payload.path,
      };
      state.isLoggedIn = true;
    },
    kakaoLogin: (state, action) => {},
    // 유저이미지 불러오기
    userImgFetch: (state, action) => {
      state.userInfo.img = action.payload;
    },
    userInfoEdit: (state, action) => {
      state.userInfo.nickname = action.payload;
    },
  },
});

export const {
  login,
  logout,
  authentication,
  kakaoLogin,
  userImgFetch,
  userInfoEdit,
} = authSlice.actions;

export default authSlice.reducer;
