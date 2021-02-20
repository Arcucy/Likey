<template>
  <div class="btn">这是一个按钮</div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
.btn {
  // 文本大小
  font-size: 20px;
  // 宽度，刚好适合文本的长度
  width: fit-content;
  // 内边距，上下 22px，左右 20px
  padding: 22px 20px;
  // 外边距，距离外部的元素上下各 22px，左右各 20px
  margin: 22px 20px;
  // 文本颜色，默认白色
  color: white;
  // 设定背景颜色，rgb，也可以 #ffffff，也可以 rgba（带透明度）
  background-color: rgb(255, 151, 151);
  // 描边，分别是，描边宽度，描边颜色填充样式，描边颜色
  border: 2px solid rgb(201, 53, 53);
  // 圆角，圆角半径为 10px
  border-radius: 10px;
  // 要求所有属性变化都遵循缓动曲线
  transition: all 0.3s ease-in-out;
  // 当鼠标在元素内部的时候，把鼠标样式变为 小手
  cursor: pointer;

  // 鼠标浮动在元素上面时发生的变化 (下一行的写法 Less 专属)：
  &:hover {
    // 鼠标浮动时变换颜色
    color: rgb(255, 151, 151);
    // 鼠标浮动时变换背景色
    background-color: white;
  }

  // 鼠标浮动在元素上面时发生的变化 (下一行的写法 Less 专属)：
  &:active {
    // 鼠标按下时变换颜色
    color: white;
    // 鼠标按下时变换背景色
    background-color: rgb(255, 195, 195);
  }
}
</style>
