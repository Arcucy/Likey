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
import { mapState } from 'vuex'

export default {
  components: {
  },
  props: {
    address: {
      type: String,
      default: ''
    },
    contract: {
      type: Object,
      default: () => {
        return {
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
    }
  },
  data () {
    return {
      ratio: '',
      sponsorAndDonationCount: '0'
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
  },
  watch: {
  },
  async mounted () {
    const sdCount = await this.$api.gql.getAllSponsorsAndDonations(this.creator.ticker.contract)
    let count = 0
    count += sdCount.sponsors ? sdCount.sponsors.length : 0
    count += sdCount.donations ? sdCount.donations.length : 0
    this.sponsorAndDonationCount = count
  },
  methods: {
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

@media screen and (max-width: 640px) {
  .sponsor {
    border-radius: 0;
    padding: 20px 16px;
  }
}
</style>
