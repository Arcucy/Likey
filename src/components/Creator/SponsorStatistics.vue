<template>
  <div class="sponsor" v-loading="loading">
    <div class="sponsor-intro">
      <h4>
        {{ ticker }}
      </h4>
      <p>
        {{ name }}
      </p>
    </div>
    <div class="sponsor-balance">
      <h4>
        {{ myBalance | winstonToAr }}
      </h4>
      <p>
        {{ $t('sponsor.myBalance') }}
      </p>
    </div>
    <div class="sponsor-data">
      <div class="sponsor-data-item">
        <h4>
          {{ contract.holders || 0 }}
        </h4>
        <p>
          {{ $t('sponsor.holders') }}
        </p>
      </div>
      <div class="sponsor-data-item">
        <h4>
          {{ (contract.totalSupply || 0) | winstonToAr }}
        </h4>
        <p>
          {{ $t('sponsor.totalSupply') }}
        </p>
      </div>
      <div class="sponsor-data-item">
        <h4>
          {{ sponsorAndDonationCount }}
        </h4>
        <p>
          {{ $t('sponsor.donationAndSponsorCount') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

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
      loading: false,
      ratio: '',
      sponsorAndDonationCount: '0',
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
      },
      contract: {
        name: '',
        ticker: '',
        owner: '',
        admins: [],
        divisibility: 1000000000000,
        ratio: '1:0.001',
        balances: {},
        holders: '0',
        totalSupply: '0',
        donations: [],
        attributes: [],
        settings: [],
        version: '1.0.5'
      }
    }
  },
  computed: {
    ...mapState({
      creators: state => state.contract.creators,
      myAddress: state => state.user.myInfo.address,
      creatorPst: state => state.contract.creatorPst
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
    },
    myBalance () {
      if (!this.creator) return '0'
      return this.contract.balances[this.myAddress]
    }
  },
  watch: {
  },
  async mounted () {
    this.loading = true
    this.contract = await this.getPstContract(this.creators[this.address].ticker.contract)
    this.sponsorAndDonationCount = await this.$api.gql.getAllPurchasesStats(this.creator.ticker.contract, 'all')
    this.loading = false
  },
  methods: {
    ...mapActions(['getPstContract'])
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

  &-balance {
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

@media screen and (max-width: 640px) {
  .sponsor {
    border-radius: 0;
    padding: 20px 16px;
  }
}
</style>
