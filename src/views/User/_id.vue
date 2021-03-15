<template>
  <div class="user">
    <UserHeader class="user-info" :id="$route.params.id" @basic-info="data => basicInfo = data" />
    <router-view :basic-info="basicInfo" />
  </div>
</template>

<script>
import UserHeader from '@/components/User/UserHeader'

export default {
  components: {
    UserHeader
  },
  inject: ['routerRefresh'],
  data () {
    return {
      basicInfo: {
        username: '',
        avatar: '',
        address: ''
      }
    }
  },
  watch: {
    $route (val, oldVal) {
      if (val.params.id !== oldVal.params.id) this.routerRefresh()
    }
  }
}
</script>

<style lang="less" scoped>
.user {
  width: 100%;
}
</style>
