import { defineStore } from "pinia";

export const useStore = defineStore("store", {
  state: () => <any>{ show: false },
  getters: {},
  actions: {
    setData(key: string, value: any) {
      this[key] = value;
    },
  },
});
