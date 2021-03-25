<template>
  <div class="sponsor">
    <div class="sponsor-intro">
      <h4>
        {{ ticker }}
      </h4>
      <p>
        {{ name }}
      </p>
    </div>
    <div class="sponsor-data">
      <div class="sponsor-data-item">
        <h4>
          100
        </h4>
        <p>
          赞赏人数
        </p>
      </div>
      <div class="sponsor-data-item">
        <h4>
          100
        </h4>
        <p>
          发行量
        </p>
      </div>
      <div class="sponsor-data-item">
        <h4>
          100
        </h4>
        <p>
          持仓量
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  components: {
  },
  props: {
    address: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      contractState: {}
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators
    }),
    creator () {
      return this.creators ? this.creators[this.address] : null
    },
    ticker () {
      if (!this.creator) return ''
      return this.creator.ticker.ticker
    },
    name () {
      if (!this.creator) return ''
      return this.creator.ticker.name
    }
    // contract () {
    //   // if (!this.creator) return ''
    // }
  },
  watch: {
  },
  mounted () {
    this.initContractInfo()
  },
  methods: {
    async initContractInfo () {
      this.contractState = await this.$api.contract.readLikeyCreatorPSTContract(this.creator.ticker.contract)
      console.log(this.contractState)
    }
  }
}
</script>

<style lang="less" scoped>
.sponsor {
  overflow: hidden;
  background: @background;
  box-shadow: 0 0 2px 0 #0000001a;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 20px;
  margin: 0 0 20px;

  &-intro {
    border-bottom: 1px solid @gray2;
    padding: 0 0 10px;
    margin: 0 0 10px;

    h4 {
      font-size: 20px;
      color: @dark;
      margin: 0 0 5px;
    }
    p {
      font-size: 15px;
      color: @dark;
      margin: 0 0 0;
    }
  }
  &-data {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    grid-gap: 10px 10px;
    justify-content: space-between;
    &-item {
      h4 {
        font-size: 20px;
        color: @dark;
        margin: 0;
      }
      p {
        font-size: 15px;
        color: @dark;
        margin: 0;
      }
    }
  }
}
</style>
