export {}; //这个一定要加，不加表示覆盖原来的类型定义

declare module "vue" {
  interface ComponentCustomProperties {
    $URL: (key: string) => string;
  }
}
