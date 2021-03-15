<template>
  <span :style="avatarStyle" class="avatar">
    <img v-if="src" :src="src" alt="avatar">
    <img v-else src="@/assets/img/default/avatar.png" alt="avatar">
  </span>
</template>

<script>

export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '30px'
    }
  },
  computed: {
    avatarStyle () {
      return {
        width: this.size,
        height: this.size,
        minWidth: this.size,
        minHeight: this.size
      }
    }
  }
}
</script>

<style lang="less" scoped>
.avatar {
  border: 1px solid @gray2;
  display: inline-block;
  border-radius: 50%;
  box-sizing: border-box;
  overflow: hidden;
  background-color: @gray1;
  user-select: none;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
