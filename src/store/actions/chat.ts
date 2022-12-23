import { createAsyncThunk } from '@reduxjs/toolkit';
import { sendChatMessage } from '@/domain/gameObject/chat/sendMessage';
import { RootState } from '..';
import { selectedTabIdSelector } from '../selectors/chatMessageSelector';

export const sendChatMessageAction = createAsyncThunk<
  void,
  { text: string; from: string },
  { state: RootState }
>('sendChatMessag', async (req, thunkAPI) => {
  const state = thunkAPI.getState();
  const tabId = selectedTabIdSelector(state);
  sendChatMessage(tabId, req.text, req.from);
});
