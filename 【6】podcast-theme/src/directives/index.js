import Vue from "vue";

function getAllNode(dom) {
  const result = [dom];
  if (dom.children && dom.children.length) {
    const vaildNode = Array.from(dom.children).filter(item => item.nodeType === 1);
    for (const item of vaildNode) {
      if (item.children && item.children.length) {
        result.push(...getAllNode(item));
      } else {
        result.push(...vaildNode);
      }
    }
  }
  return result;
}

function clickHandler(event, allNode, binding) {
  if (allNode.every(item => item !== event.target)) {
    binding.value.value = false;
  }
}

Vue.directive("clickOutside", {
  inserted: function (el, binding, vnode) {
    const allNode = getAllNode(el);
    document.body.addEventListener("click", event => clickHandler(event, allNode, binding));
  },
  unbind: function (el, binding, vnode) {
    document.body.removeEventListener("click", event => clickHandler(event, allNode, binding));
  }
});
