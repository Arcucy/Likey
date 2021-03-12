<template>
  <el-dropdown>
    <span class="my-avatar">
      <Avatar size="40px" :src="myInfo.avatar" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item>{{ myInfo.username }}</el-dropdown-item>
      <div @click="logout">
        <el-dropdown-item>{{ $t('login.signOut') }}</el-dropdown-item>
      </div>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import Avatar from '@/components/User/Avatar'
export default {
  components: {
    Avatar
  },
  computed: {
    ...mapState({
      myInfo: state => state.user.myInfo
    })
  },
  methods: {
    ...mapActions(['logout'])
  }
}
</script>

<style lang="less" scoped>
.my-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
