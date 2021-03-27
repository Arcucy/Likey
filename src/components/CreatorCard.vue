<template>
  <a :href="'/#/@' + shortname" target="_blank">
    <div class="creator-card" v-loading="loading">
      <avatar class="creator-card-avatar" size="48px" :src="avatar" />
      <div style="display: inline-block" class="creator-card-info">
        <span class="creator-card-info-name">{{ id }}</span><br>
        <span class="creator-card-info-bio">{{ intro }}</span>
      </div>
    </div>
  </a>
</template>
<script>
import Avatar from '@/components/User/Avatar'
import Api from '@/api/api'

export default {
  components: {
    avatar: Avatar
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
      intro: 'Loading...',
      avatar: '',
      shortname: ''
    }
  },
  computed: {
    loading () {
      return this.id === 'Loading...' || this.avatar === '' || this.intro === 'Loading...'
    }
  },
  async mounted () {
    this.$store.dispatch('getCreatorInfo', this.address).then((result) => {
      this.intro = result.intro
      this.shortname = result.shortname
    }).catch(e => {
      console.log(e)
    })
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
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
  margin-top: 10px;
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

.el-loading-mask {
  border-radius: 6px;
}
</style>
