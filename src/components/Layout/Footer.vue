<template>
  <footer>
    <div class="footer">
      <div class="footer-container">
        <div class="info">
          <span class="info-title">{{ $t('footer.arcucyProducts') }}</span>
          <div class="info-content">
            <a href="https://github.com/AyakaLab" target="_blank">Ayaka Lab</a>
            <a href="https://arclight.arcucy.io" target="_blank">ArcLight</a>
            <a href="https://arweave.net/633O1T1mQfbSCla-GzV5mqZ7hfqpU9LHAwgRvSM5r8c" target="_blank">ArweaveAvatar</a>
          </div>
        </div>
        <div class="icons">
          <div class="icons-links">
            <a href="https://twitter.com/arcucyio" target="_blank">
              <span class="mdi mdi-twitter" />
            </a>
            <a href="https://github.com/Arcucy" target="_blank">
              <span class="mdi mdi-github" />
            </a>
            <a href="https://discord.gg/3zUXrnXyFv" target="_blank">
              <span class="mdi mdi-discord" />
            </a>
            <a href="mailto:contact@arcucy.io" target="_blank">
              <span class="mdi mdi-email" />
            </a>
          </div>
          <span class="icons-desp">{{ $t('footer.followUsStatement') }}</span>
        </div>
      </div>
      <div class="footer-brand">
        <div class="logo">
          Likey
        </div>
        <div class="copyright">
          Arcucy Team ©️ 2021
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
}
</script>

<style lang="less" scoped>
@gray2: #dcdcdc;

a {
  color: @gray2;
  text-decoration: none;
  width: fit-content;
  transition: all 0.2s ease-in-out;
}

footer {
  width: 100%;
  height: fit-content;
  padding: 35px 10px 35px;
  box-sizing: border-box;
  color: @gray2;
  background-color: @background-dark;
  display: flex;
  flex-direction: column;

  .footer {
    width: 100%;
    margin: 0 auto;
    max-width: 1200px;

    &-container {
      flex: 1;
      font-size: 14px;
      width: 100%;
      display: flex;
      flex-direction: row;

      .info {
        width: 100%;
        max-width: 200px;

        &-title {
          font-size: 16px;
          font-weight: 500;
          user-select: none;
        }

        &-content {
          font-weight: 400;
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          row-gap: 10px;

          a {
            &:hover {
              color: @light;
            }
          }
        }
      }

      .icons {
        flex-grow: 1;

        &-links {
          display: flex;
          flex-direction: row;
          column-gap: 10px;
          justify-content: flex-end;

          a {
            text-align: center;
            font-size: 20px;
            padding: 10px 10px;
            box-sizing: border-box;
            border-radius: 50%;
            border: 1px solid @gray2;
            &:hover {
              color: @light;
              border-color: @light;
            }
            span {
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }

        &-desp {
          display: block;
          margin-top: 15px;
          text-align: right;
        }
      }
    }

    &-brand {
      margin-top: 20px;
      font-size: 12px;
      display: flex;
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;

      .logo {
        font-size: 28px;
        margin-right: 20px;
      }
    }
  }
}
@media screen and (max-width: 640px) {
  footer {
    height: fit-content;
    .footer {
      &-container {
        flex-direction: column-reverse;
        .icons {
          &-links {
            justify-content: flex-start;
          }
          &-desp {
            text-align: left;
            margin-top: 5px;
          }
        }
        .info {
          margin-top: 10px;
          max-width: fit-content;
          &-content {
            flex-direction: row;
            column-gap: 10px;
            margin-top: 5px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 500px) {
  footer {
    padding: 35px 10px 65px;

    .footer {
      &-brand {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
      }
    }
  }
}

@media screen and (max-width: 400px) {
  footer {
    padding: 35px 10px 75px;

    .footer {
      &-brand {
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
