import { stat } from 'fs';
import { create } from 'zustand';

interface UploadState {
  uploadTrigger: number;
  triggerUpload: () => void;
}

const useUploadStore = create<UploadState>((set) => ({
  uploadTrigger: 0,
  triggerUpload: () =>
    set((state) => ({ uploadTrigger: state.uploadTrigger + 1 })),
}));

export default useUploadStore;
