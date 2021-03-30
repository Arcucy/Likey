<template>
  <div class="purchased-item">
    <div class="purchased-item-left">
      <div class="purchased-item-left-type">
        <span class="purchased-item-left-type-title">购买 PST</span>
        <a class="address" :href="`https://viewblock.io/arweave/tx/${purchase.id}`">{{ purchase.id }}</a><span class="mdi mdi-content-copy copy-icon" @click="() => copyAddress(purchase.id)" />
      </div>
      <div class="purchased-item-left-info">
        <span class="purchased-item-left-info-user">Ayaka Neko</span> - <span class="purchased-item-left-info-item">{{ purchase.parsedTag.SolutionTitle || '' }}</span>
      </div>
      <div class="purchased-item-left-recipient">
        <span class="mdi mdi-account-arrow-right" />
        <a class="address" :href="`https://viewblock.io/arweave/tx/${purchase.recipient}`">{{ purchase.recipient }}</a><span class="mdi mdi-content-copy copy-icon" @click="() => copyAddress(purchase.recipient)" />
      </div>
    </div>
    <div class="purchased-item-right">
      <span class="purchased-item-right-value">{{ purchase.quantity.winston | winstonToAr }} AR</span>
      <span class="purchased-item-right-time">2020 01 29</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    purchase: {
      type: Object,
      default: () => {}
    }
  },
  mounted () {
    console.log(this.purchase)
  },
  methods: {
    /** 复制合约地址 */
    copyAddress (address) {
      this.$copyText(address).then(
        () => {
          this.$message({
            showClose: true,
            message: this.$t('success.copy'),
            type: 'success'
          })
        },
        () => {
          this.$message({ showClose: true, message: this.$t('error.copy'), type: 'error' })
        }
      )
    }
  }
}
</script>

<style lang="less" scoped>
.purchased-item {
  display: flex;
  width: 100%;
  padding: 20px 20px;
  box-sizing: border-box;
  border: 2px solid @primary;
  border-radius: 6px;

  &-left {
    display: flex;
    flex-direction: column;
    flex: 1;
    row-gap: 5px;

    &-type {
      display: flex;
      align-items: center;
      column-gap: 5px;

      &-title {
        font-weight: 600;
      }

      .address {
        font-size: 14px;
        color: @gray4;
        text-decoration: none;

        &:hover {
          color: @primary;
        }
      }
    }

    &-info {
      &-user {
        color: @gray4;
      }

      &-item {
        font-weight: 600;
      }
    }

    &-recipient {
      display: flex;
      align-items: center;
      column-gap: 5px;

      .mdi {
        color: @primary;
        font-size: 16px;
      }

      .address {
        font-size: 14px;
        color: @dark;
        text-decoration: none;

        &:hover {
          color: @primary;
        }
      }
    }
  }

  &-right {
    display: flex;
    flex-direction: column;
    text-align: right;
    row-gap: 5px;

    &-value {
      flex: 1;
      font-size: 20px;
    }

    &-time {
      align-self: flex-end;
    }
  }
}

.copy-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: @primary;

  &:hover {
    color: @secondary;
  }

  &:active {
    color: @primary-dark;
  }
}
</style>
