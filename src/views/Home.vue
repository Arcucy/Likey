<template>
  <div class="container">
    <div class="row">
      <div class="col-6">
        <div class="home-title-container">
          <div class="home-title">
            {{ $t('home.tabFlow') }}
          </div>
          <div class="home-title home-title-sponsored" :class="showingAppreciate ? '' : 'home-title-not-active'">
            {{ $t('home.tabAppreciated') }}
          </div>
        </div>
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
      <div class="col-3">
        <div class="home-title">
          {{ $t('home.findMoreCreators') }}
        </div>
        <div class="card flow-card" v-if="shownCreators.length === 0">
          <div v-loading="true">
            {{ $t('home.creatorsLoading') }}
          </div>
        </div>
        <CreatorCard
          v-for="(address, index) in shownCreators"
          :address="address"
          :key="index"
          class="flow-card"
        />
        <div class="show-more-btn">
          <span
            @click="showMore ++"
            v-if="creatorsAddress.length !== shownCreators.length"
            class="show-more-btn-text"
          >{{ $t('home.showMore') }}</span>
        </div>
      </div>
    </div>
  </div>
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

.container {
  width: 100%;
  .row {
    max-width: 1220px;
    width: 100%;
    margin: 20px auto 0;
    .col-6 {
      width: 66.6%;
      float: left;
      padding: 0 10px;
      box-sizing: border-box;
    }
    .col-3 {
      width: 33.3%;
      float: right;
      padding: 0 10px;
      box-sizing: border-box;
    }
  }
}

.card {
  background: @background;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
}

.home-title-container {
  display: flex;
}

.home-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;

  &-sponsored {
    margin-left: 30px;
  }

  &-not-active {
    color: gray;
  }
}

.show-more-btn {
  width: 100%;
  text-align: center;
  padding: 20px;

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
  margin-bottom: 20px;
}

@media screen and (max-width: 799px) {
  .row {
    display: flex;
    flex-direction: column-reverse;
    .col-6, .col-3 {
      width: 100%;
    }
  }
}

@media screen and (max-width: 640px) {
  .row {
    .col-6, .col-3 {
      padding: 0;
      margin-bottom: 20px;
    }
  }
  .col-header {
    padding: 0 16px;
  }
  .flow-card {
    margin-bottom: 1px;
  }
}
</style>
