<template>
  <div class="my-order">
    <div class="my-order-header">
      <h3 class="my-order-header-title">
        {{ $t('pageTitle.myOrder') }}
      </h3>
      <div class="my-order-header-menu">
        <h4>
          <span
            v-for="(item, index) in tabs"
            :class="(tab || defaultTab) === item.type && 'active'"
            :key="index"
            @click="tab = item.type"
          >
            {{ item.label }}
          </span>
        </h4>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import { getCookie } from '@/util/cookie'

export default {
  inject: ['updateQuery'],
  data () {
    return {
      tab: this.$route.query.tab || '',
      defaultTab: 'single',
      tabs: [
        {
          label: 'All Purchases',
          type: 'all'
        },
        {
          label: 'Sponsors',
          type: 'sponsors'
        },
        {
          label: 'Donations',
          type: 'donations'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      myAddress: state => state.user.myInfo.address
    })
  },
  watch: {
    isLoggedIn: {
      handler (val) {
        if (val) this.initUserData()
        else {
          // 对于没有登录的用户，检查 Cookie 中是否有 key，
          // 如果有的话，等待登录完成，没有则直接退回主页。
          const jwk = getCookie('arclight_userkey')
          if (!jwk) {
            this.$message.warning(this.$t('failure.noPermissionToAccessPage'))
            this.$router.push({ name: 'Home' })
          }
        }
      },
      immediate: true
    },
    tab (val) {
      this.addressList = []
      this.page = 1
      this.updateQuery('tab', val)
      if (this.wallet) this.getList(val || this.defaultTab)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.tabs[0].label = this.$t('orderTab.allPurchases')
      this.tabs[1].label = this.$t('orderTab.sponsors')
      this.tabs[2].label = this.$t('orderTab.donations')
    })
  },
  methods: {
    async initUserData () {
      console.log(await this.$api.gql.getAllPurchases(this.myAddress))
    }
  }
}
</script>

<style lang="less" scoped>
.my-order {
  margin: 20px auto 0;
  max-width: 1200px;

  &-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &-title {
      color: @dark;
      margin-bottom: 10px;
      line-height: 22px;
      text-align: left;
    }

    &-menu {
      h4 {
        font-size: 16px;
        text-align: left;
        margin-bottom: 16px;
        span {
          transition: all 0.3s ease;
          cursor: pointer;
          color: @gray2;
          margin-right: 20px;
          display: inline-block;
          &:hover {
            color: @dark;
          }
          &.active {
            color: @primary;
          }
        }
      }
    }
  }
}
</style>
