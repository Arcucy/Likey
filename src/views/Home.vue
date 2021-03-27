<template>
  <el-main>
    <el-row justify="center" type="flex">
      <el-col :span="20">
        <el-row :gutter="20">
          <!--分栏：动态-->
          <el-col :span="14">
            <div class="home-timeline">
              动态
            </div>
          </el-col>
          <!--分栏：发现创作者-->
          <el-col :span="10">
            <div class="home-discovery">
              <span class="home-discovery-title">发现创作者</span>
              <creator-card v-for="(address, index) in Object.keys(contract.creators)" :address="address" :key="index" />
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import CreatorCard from '@/components/CreatorCard'
import { mapState } from 'vuex'

export default {
  name: 'Home',
  components: {
    'creator-card': CreatorCard
  },
  computed: {
    ...mapState(['contract'])
  }
}
</script>

<style lang="less" scoped>
@import '../themes/variables';

.card {
  background: @background;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
}

// 使卡片边框变得更明显
// TODO:应当只在开发时使用
.obviously-border {
  border: 1px black solid;
}

.home-timeline {
  // TODO
}

.home-discovery {
  &-title {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
