<template>
  <div v-loading="loading" class="creator-card-container">
    <router-link class="creator-card" :to="creatorUrl">
      <Avatar class="creator-card-avatar" size="48px" :src="avatar" />
      <div style="display: inline-block" class="creator-card-info">
        <span class="creator-card-info-name">{{ id }}</span>
        <span class="creator-card-info-bio">{{ creator.intro }}</span>
      </div>
    </router-link>
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
      return this.id === 'Loading...' || this.creator.intro === 'Loading...'
    },
    creatorUrl () {
      return this.loading ? {} : { name: 'Creator', params: { shortname: this.creator.shortname } }
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
a {
  text-decoration: none;
  color: #000;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.creator-card {
  display: flex;
  align-items: center;
  padding: 0 0 20px;

  &-container:last-child {
    .creator-card {
      padding: 0;
    }
  }

  &-avatar {
    margin-right: 10px;
  }
  &-info {
    &-name {
      font-weight: bold;
      font-size: 15px;
      color: @dark;
      margin: 0 0 3px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;

      &:hover {
        color: var(--primary);
        text-decoration: underline;
      }
    }

    &-bio {
      font-size: 15px;
      font-weight: 400;
      color: @gray3;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
      word-break: break-all;
    }
  }
}

.card-loading {
  cursor: not-allowed;
}

/deep/.el-loading-mask {
  border-radius: 10px;
}

@media screen and (max-width: 799px) {
  .creator-card {
    flex-direction: column;
    width: 20%;
    margin: 0;
    padding: 0 5px;

    &-avatar {
      padding: 0;
      margin: 0 0 5px;
    }

    &-info {
      &-name {
        text-align: center;
        margin: 0;
        padding: 0;
        font-size: 14px;
        -webkit-line-clamp: 2;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        word-wrap: break-word;
        -ms-word-break: break-all;
        word-break: break-word;
      }

      &-bio {
        display: none;
      }
    }
  }
}

@media screen and (max-width: 640px) {
  .creator-card {
    &-info {
      &-name {
        font-size: 12px;
      }
    }
  }
}
</style>
