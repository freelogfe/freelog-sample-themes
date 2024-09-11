import "vue-router";

declare module "vue-router" {
  interface Router {
    myPush(location: Record<string, any>): void;
  }
}
