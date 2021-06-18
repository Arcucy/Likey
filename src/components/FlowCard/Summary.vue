<template>
  <div class="flow-summary">
    <!-- 摘要文本 -->
    <p v-if="preview.summary" class="flow-summary-text">
      {{ text }}
    </p>
    <router-link :to="{}">
      <el-button v-if="loading" class="flow-summary-btn">
        <i class="el-icon-loading" />
        {{ $t('app.loading') }}
      </el-button>
      <el-button v-else class="flow-summary-btn" @click="loadMore">
        {{ $t('flowCard.loadMore') }}
      </el-button>
    </router-link>
    <router-link
      v-if="isShowExtraBox"
      style="display: block;"
      :to="{}"
      v-loading="loading"
    >
      <div v-if="extra.media" class="flow-summary-mediabg" @click="loadMore">
        <div class="flow-summary-mediabg-pillar" />
        <div class="flow-summary-media">
          <span class="mdi mdi-image-size-select-actual" />
          <p>
            {{ $t('flowCard.numPictures', [extra.media]) }}
          </p>
        </div>
      </div>
      <div v-if="extra.audio" class="flow-summary-file" @click="loadMore">
        <span class="mdi mdi-music-circle" />
        <div style="flex: 1;">
          <p>
            {{ $t('flowCard.audio') }}
          </p>
        </div>
      </div>
      <div v-if="extra.file" class="flow-summary-file" @click="loadMore">
        <span class="mdi mdi-file" />
        <div style="flex: 1;">
          <p>
            {{ $t('flowCard.file') }}
          </p>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    // 预览数据
    preview: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    text () {
      return this.preview.summary + (this.preview.summary.length >= 100 ? '...' : '')
    },
    extra () {
      if (!this.preview.extra) {
        return {
          media: 0,
          audio: 0,
          file: 0
        }
      }
      return {
        media: this.preview.extra.media || 0,
        audio: this.preview.extra.audio || 0,
        file: this.preview.extra.file || 0
      }
    },
    isShowExtraBox () {
      return this.preview.extra && (this.preview.extra.media || this.preview.extra.audio || this.preview.extra.file)
    }
  },
  methods: {
    loadMore () {
      this.$emit('load-more')
    }
  }
}
</script>

<style lang="less" scoped>
a {
  text-decoration: none;
  color: @dark;
}
.flow-summary {

  &-text {
    font-size: 15px;
    line-height: 1.5;
    color: @dark;
    margin: 0 0 5px;
    padding: 0;
    max-width: 100%;
    overflow: hidden;

    overflow-wrap: break-word;
    word-wrap: break-word;
    -ms-word-break: break-all;
    word-break: break-word;
  }

  &-btn {
    display: block;
    width: 100%;
    margin: 0 0 10px;
  }

  &-mediabg {
    position: relative;
    width: 100%;
    margin: 0 0 10px;
    min-height: 100px;

    &-pillar {
      padding-bottom: 25.18%;
    }
  }
  &-media {
    background: @gray1;
    border-radius: 6px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: @gray3;
    flex-direction: column;
    border: 1px solid #fff0;

    span {
      font-size: 38px;
      height: 42px;
      width: 42px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 5px;
    }
    P {
      margin: 0;
      font-size: 15px;
    }

    &:hover {
      color: @primary;
      background-color: @primary-light;
      border: 1px solid @primary-dark;
    }
  }

  &-file {
    background: @gray1;
    border-radius: 6px;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    color: @gray3;
    margin: 0 0 10px;
    border: 1px solid #fff0;

    span {
      font-size: 38px;
      height: 42px;
      width: 42px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 10px;
    }
    P {
      margin: 0;
      font-size: 15px;
      line-height: 20px;
    }

    &:hover {
      color: @primary;
      background-color: @primary-light;
      border: 1px solid @primary-dark;
    }
  }
}
</style>
