import { create } from 'zustand';

const usePermissionStore = create((set) => ({
    permissions: [],
    setPermissions: (p) => set({ permissions: p })
}));

export default usePermissionStore;
