import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  fullName: string;
  avatar: string;
  username: string;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    updateAvatar(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.avatar = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    updateUser(state, action: PayloadAction<User>) {
      if (state.user) {
        state.user.fullName = action.payload.fullName;
        state.user.avatar = action.payload.avatar;
        state.user.id = action.payload.id;

        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, updateAvatar, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
