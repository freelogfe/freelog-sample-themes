import { createApp } from "vue"
import App from "./App.vue"
import "./registerServiceWorker"
import routes from "./router"
import store from "./store"
import { createRouter, createWebHistory } from 'vue-router';

// createApp(App).use(store).use(router).mount("#app")
let router:any = null;
let instance:any = null;

function render(props:any = {}) {
  const { container } = props;
  router = createRouter({
    history: createWebHistory(window.__POWERED_BY_FREELOG__ ? '/vue3' : '/'),
    routes,
  });

  instance = createApp(App);
  instance.use(router);
  instance.use(store);
  instance.mount(container ? container.querySelector('#app') : '#app');
}

if (!window.__POWERED_BY_FREELOG__) {
  render();
}

export async function bootstrap() {
  console.log('%c ', 'color: green;', 'vue3.0 app bootstraped');
}

function storeTest(props:any) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value:any, prev:any) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
      true,
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}

export async function mount(props:any) {
  storeTest(props);
  render(props);
  instance.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
  instance.config.globalProperties.$setGlobalState = props.setGlobalState;
}

export async function unmount() {
  instance.unmount();
  instance._container.innerHTML = '';
  instance = null;
  router = null;
}
