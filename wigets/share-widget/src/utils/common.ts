/** 轻提示 */
let timeout: any = null;
export const showToast = (msg: string) => {
  const toast = document.getElementById("toast-wrapper");
  if (toast) document.body.removeChild(toast);
  if (timeout) clearTimeout(timeout);

  const div = document.createElement("div");
  div.className = "toast-wrapper";
  div.id = "toast-wrapper";
  div.innerHTML = msg;
  document.body.appendChild(div);

  timeout = setTimeout(() => {
    document.body.removeChild(div);
  }, 2000);
};