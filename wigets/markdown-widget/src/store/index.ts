import { defineStore } from "pinia";

export const useStore = defineStore("store", {
  state: () => <any>{ fontSize: 16 },
  getters: {},
  actions: {
    setData(key: string, value: any) {
      this[key] = value;
    },
  },
});
