<template>
  <div>
    <a :href="loading ? 'javascript:void(0)' : '/#/@' + creator.shortname" :class="loading ? 'card-loading' : ''">
      <div class="creator-card" v-loading="loading">
        <Avatar class="creator-card-avatar" size="48px" :src="avatar" />
        <div style="display: inline-block" class="creator-card-info">
          <span class="creator-card-info-name">{{ id }}</span><br>
          <span class="creator-card-info-bio">{{ creator.intro }}</span>
        </div>
      </div>
    </a>
  </div>
</template>
<script>
import Avatar from '@/components/User/Avatar'
import Api from '@/api/api'
import { mapState } from 'vuex'

export default {
  components: {
    Avatar
  },
  props: {
    address: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      id: 'Loading...',
      avatar: '',
      creator: {
        intro: 'Loading...',
        shortname: ''
      }
    }
  },
  computed: {
    ...mapState(['contract']),
    loading () {
      return this.id === 'Loading...' || this.avatar === '' || this.creator.intro === 'Loading...'
    }
  },
  async mounted () {
    this.creator = this.contract.creators[this.address]
    Api.gql.getAvatarByAddress(this.address).then((result) => {
      this.avatar = result
    })
    Api.gql.getIdByAddress(this.address).then((result) => {
      this.id = result.data
    })
  }
}
</script>
<style lang="less" scoped>
@import "../themes/variables";
a {
  text-decoration: none;
  color: #000;
}

.creator-card {
  background: @background;
  color: @dark;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  align-items: center;
  &-avatar {
    margin-right: 10px;
  }
  &-info {
    &-name {
      font-weight: bold;
    }
  }
}

.card-loading {
  cursor: not-allowed;
}

/deep/.el-loading-mask {
  border-radius: 6px;
}
</style>
