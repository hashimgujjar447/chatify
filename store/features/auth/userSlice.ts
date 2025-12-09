import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


// -------------------- LOGIN THUNK --------------------
export const loginUser = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials:"include"
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message || "Failed to login user");
      }

      return data; // expected { success, user }
    } catch (error) {
      return thunkAPI.rejectWithValue("Something went wrong while login.");
    }
  }
);


// -------------------- LOGOUT THUNK --------------------
export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data.message || "Logout failed");
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Error while logging out");
    }
  }
);


// ---------Refresh Page THUNK --------------------

export const refreshUser = createAsyncThunk("auth/refreshUser", async (_, thunkApi) => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "GET",
      credentials: "include" // Important: sends cookies
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkApi.rejectWithValue(data.error || "Failed to refresh user");
    }

    return data.user; // { userId, email }
    
  } catch (error) {
    return thunkApi.rejectWithValue("Error while refreshing user, please login");
  }
});

// -------------------- SLICE --------------------
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null as any,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // -------- LOGIN --------
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // -------- LOGOUT --------
      .addCase(logoutUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })

      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // -------- REFRESH USER --------
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      
      .addCase(refreshUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});



export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
