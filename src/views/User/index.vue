<template>
  <div class="user-profile">
    <div v-if="isCreator" class="row">
      <div class="col-6">
        <div class="col-header">
          <h3>{{ $t('userProfile.flow') }}</h3>
        </div>
        <InputBox />
        <FlowCard :data="{}" />
      </div>
      <div class="col-3">
        <div class="col-header">
          <h3>{{ $t('userProfile.sponsorship') }}</h3>
        </div>
        <SponsorStatistics :address="address" />
        <UnlockSolutionList :address="address" />
      </div>
    </div>
    <div v-else class="no-creator">
      <p>{{ $t('userProfile.notYetACreator') }}</p>
      <router-link :to="{ name: 'Setting-Creator' }">
        <el-button v-if="isMyself && !creatorLoading" class="no-creator-btn" type="primary">
          {{ $t('becomeACreatorBtn') }}
        </el-button>
      </router-link>
      <div v-if="isMyself && !creatorLoading" class="no-creator-edit">
        <p>{{ $t('userProfile.editUsernameAndAvatar') }}</p>
        <a href="https://arweave.net/fGUdNmXFmflBMGI2f9vD7KzsrAc1s1USQgQLgAVT0W0" target="_blank">
          Arweave ID
        </a>
        <a href="https://arweave.net/d9SXf_N32hAm3cygt1btmPC-7Dg460VhQEtW8I-cfvU" target="_blank">
          Arweave Avatar
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

import SponsorStatistics from '@/components/Creator/SponsorStatistics'
import UnlockSolutionList from '@/components/Creator/UnlockSolutionList'
import FlowCard from '@/components/FlowCard'
import InputBox from '@/components/Creator/InputBox'

export default {
  components: {
    SponsorStatistics,
    UnlockSolutionList,
    FlowCard,
    InputBox
  },
  props: {
    basicInfo: {
      type: Object,
      default: () => {
        return {
          username: '',
          avatar: '',
          address: ''
        }
      }
    }
  },
  data () {
    return {
      creatorLoading: false,
      creatorInfo: {
        shortname: '',
        intro: '',
        category: '',
        scale: '',
        ticker: {
          name: '',
          ticker: '',
          contract: ''
        },
        items: []
      }
    }
  },
  computed: {
    ...mapGetters(['isMe']),
    address () {
      const name = this.$route.name
      // 如果是创作者的短链接页面，需要通过 basicInfo 获取 address
      return name === 'User' ? this.$route.params.id : this.basicInfo.address
    },
    isMyself () {
      return this.isMe(this.address)
    },
    isCreator () {
      return Boolean(this.creatorInfo.shortname)
    }
  },
  watch: {
    address: {
      handler (val) {
        if (val) this.initCreatorInfo(val)
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['getCreatorInfo']),
    /** 初始化获取创作者信息 */
    async initCreatorInfo (address) {
      this.creatorLoading = true
      try {
        const res = await this.getCreatorInfo(address)
        if (res) this.creatorInfo = res
      } catch (err) {
        console.error('Failed to obtain creator information', err)
        this.$message.error(this.$t('failure.failedToObtainContractStatus'))
      }
      this.creatorLoading = false
    }
  }
}
</script>

<style lang="less" scoped>
.user-profile {
  margin: 0 10px 60px;
}

.no-creator {
  margin: 20px auto 0;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    color: @gray3;
    margin: 0 0 10px;
    padding: 0;
  }

  &-btn {
    padding: 12px 20px;
    min-width: 130px;
  }

  &-edit {
    margin: 60px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      margin: 0 0 5px;
    }
    a {
      color: @secondary;
    }
  }
}

.row {
  max-width: 1200px;
  width: 100%;
  margin: 20px auto 0;
  padding-bottom: 40px;
  &::after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    clear: both;
  }
  .col-6 {
    width: 66.666%;
    padding: 0 10px;
    float: left;
    box-sizing: border-box;
  }
  .col-3 {
    width: 33.333%;
    padding: 0 10px;
    float: left;
    box-sizing: border-box;
  }
}

.col-header {
  margin-bottom: 20px;
  h3 {
    margin: 0;
    padding: 0;
  }
}
</style>
