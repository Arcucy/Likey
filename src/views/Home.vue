<template>
  <el-main>
    <el-row justify="center" type="flex">
      <el-col :span="24" class="content-container">
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
              <creator-card v-for="(address, index) in shownCreators" :address="address" :key="index" />
              <div class="show-more-btn">
                <span @click="showMore ++" v-if="creators.length !== shownCreators.length" class="show-more-btn-text">显示更多</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </el-main>
</template>

<script>
import CreatorCard from '@/components/CreatorCard'
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'Home',
  components: {
    'creator-card': CreatorCard
  },
  data () {
    return {
      // 记录用户点了多少次展开
      showMore: 1
    }
  },
  computed: {
    ...mapState({
      creators: state => Object.keys(state.contract.creators),
      shownCreators () {
        return this.creators.slice(0, this.showMore * 5)
      }
    })
  },
  methods: {
    // TODO:在每次提交前记得删掉这个mutations的引用
    ...mapMutations(['mTestCreatorsAdd'])
  }
}
</script>

<style lang="less" scoped>
@import '../themes/variables';

.content-container {
  max-width: 1200px;
}

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

.show-more-btn {
  width: 100%;
  text-align: center;
  padding: 10px;
  &-text {
    transition: all 200ms;
    font-weight: bold;
    color: @primary;
    &:hover {
      color: @secondary;
    }
  }
}
</style>
