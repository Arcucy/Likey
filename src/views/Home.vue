<template>
  <el-main>
    <el-row justify="center" type="flex">
      <el-col :span="24" class="content-container">
        <el-row :gutter="20">
          <!--分栏：动态-->
          <el-col :span="14">
            <div class="home-timeline">
              <el-row>
                <el-col :span="4">
                  <span class="home-title">
                    {{ $t('home.tabFlow') }}
                  </span>
                </el-col>
                <el-col :span="4">
                  <span class="home-title" :class="showingAppreciate ? '' : 'home-title-not-active'">
                    {{ $t('home.tabAppreciated') }}
                  </span>
                </el-col>
              </el-row>
              <FlowCard
                v-for="(data, index) in flow"
                :brief="data"
                :key="index"
                class="flow-card"
              />
              <InfiniteScroll
                class="flow-card"
                :no-data="!flow || !flow.length"
                :loading="flowLoading"
                :distance="200"
                :disable="!hasNextPage"
                @load="() => getUserStatus()"
              />
            </div>
          </el-col>
          <!--分栏：发现创作者-->
          <el-col :span="10">
            <div class="home-discovery">
              <span class="home-title">
                {{ $t('home.findMoreCreators') }}
              </span>
              <div class="card flow-card" v-if="shownCreators.length === 0">
                <div v-loading="true">
                  {{ $t('home.creatorsLoading') }}
                </div>
              </div>
              <CreatorCard v-for="(address, index) in shownCreators" :address="address" :key="index" />
              <div class="show-more-btn">
                <span
                  @click="showMore ++"
                  v-if="creatorsAddress.length !== shownCreators.length"
                  class="show-more-btn-text"
                >{{ $t('home.showMore') }}</span>
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
import FlowCard from '@/components/FlowCard'
import InfiniteScroll from '@/components/InfiniteScroll'

import { mapActions, mapMutations, mapState } from 'vuex'

export default {
  name: 'Home',
  components: {
    CreatorCard,
    FlowCard,
    InfiniteScroll
  },
  data () {
    return {
      // 记录用户点了多少次展开
      showMore: 1,
      showingAppreciate: false,
      // 动态列表
      flow: [],
      flowLoading: false,
      hasNextPage: false
    }
  },
  computed: {
    ...mapState({
      creatorsAddress: state => Object.keys(state.contract.creators),
      creators: state => state.contract.creators
    }),
    shownCreators () {
      return this.creatorsAddress.slice(0, this.showMore * 5)
    },
    flowCursor () {
      if (!this.flow || !this.flow.length) return ''
      return this.flow[this.flow.length - 1].cursor
    }
  },
  methods: {
    // TODO:在每次提交前记得删掉这个mutations的引用
    ...mapMutations(['mTestCreatorsAdd']),
    ...mapActions(['getCreatorInfo']),
    /** 获取所有用户动态列表 */
    async getUserStatus () {
      if (this.flowLoading) return
      this.flowLoading = true
      const res = await this.$api.gql.getUserStatus(this.flowCursor, 10)
      this.flow.push(...res.transactions.edges)
      this.hasNextPage = res.transactions.pageInfo.hasNextPage
      this.flowLoading = false
    }
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
  // TODO
}

.home-title {
  font-size: 18px;
  font-weight: bold;

  &-not-active {
    color: gray;
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

.flow-card {
  margin-top: 10px;
}
</style>
