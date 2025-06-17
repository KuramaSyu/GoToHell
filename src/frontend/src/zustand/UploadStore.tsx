import { stat } from 'fs';
import { create } from 'zustand';

interface UploadState {
  uploadTrigger: number;
  triggerUpload: () => void;
  setUpload: (n: number) => void;
}

/**
 * This store is used to trigger the upload (button) which is also counted
 */
const useUploadStore = create<UploadState>((set) => ({
  uploadTrigger: 0,
  triggerUpload: () =>
    set((state) => ({ uploadTrigger: state.uploadTrigger + 1 })),
  setUpload: (n: number) => set({ uploadTrigger: n }),
}));

export default useUploadStore;
